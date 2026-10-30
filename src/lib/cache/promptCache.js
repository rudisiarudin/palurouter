import crypto from "crypto";
import { getAdapter } from "@/lib/db/driver.js";

const DEFAULT_TTL_HOURS = 24;
const ramCache = new Map();
const MAX_RAM_ENTRIES = 500;

export function computeCacheHash({ model, messages, temperature = 1, system = null }) {
  const normalizedMessages = Array.isArray(messages)
    ? messages.map((m) => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content.trim() : JSON.stringify(m.content),
      }))
    : [];

  const payload = JSON.stringify({
    model: String(model || "").toLowerCase().trim(),
    messages: normalizedMessages,
    temperature: Number(temperature) || 1,
    system: system ? String(system).trim() : null,
  });

  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function getCachedPrompt(hash) {
  if (!hash) return null;

  // 1. Check Fast RAM Cache
  if (ramCache.has(hash)) {
    const entry = ramCache.get(hash);
    if (entry.expiresAt > Date.now()) {
      entry.hits = (entry.hits || 0) + 1;
      return entry;
    }
    ramCache.delete(hash);
  }

  // 2. Check SQLite kv store
  try {
    const db = await getAdapter();
    const row = db.get(`SELECT value FROM kv WHERE scope = ? AND key = ?`, ["prompt_cache", hash]);
    if (row?.value) {
      const entry = JSON.parse(row.value);
      if (entry.expiresAt > Date.now()) {
        entry.hits = (entry.hits || 0) + 1;
        // update ram cache
        ramCache.set(hash, entry);
        // update hits in db async
        Promise.resolve().then(async () => {
          try {
            db.run(`UPDATE kv SET value = ? WHERE scope = ? AND key = ?`, [
              JSON.stringify(entry),
              "prompt_cache",
              hash,
            ]);
          } catch {}
        });
        return entry;
      } else {
        // expired
        db.run(`DELETE FROM kv WHERE scope = ? AND key = ?`, ["prompt_cache", hash]);
      }
    }
  } catch {
    // fail-open
  }

  return null;
}

export async function setCachedPrompt(hash, data, ttlHours = DEFAULT_TTL_HOURS) {
  if (!hash || !data) return;

  const now = Date.now();
  const expiresAt = now + ttlHours * 3600 * 1000;
  const entry = {
    hash,
    model: data.model || "",
    response: data.response || null,
    text: data.text || "",
    usage: data.usage || null,
    createdAt: now,
    expiresAt,
    hits: 0,
  };

  // RAM cache
  if (ramCache.size >= MAX_RAM_ENTRIES) {
    const firstKey = ramCache.keys().next().value;
    if (firstKey) ramCache.delete(firstKey);
  }
  ramCache.set(hash, entry);

  // SQLite kv store
  try {
    const db = await getAdapter();
    db.run(
      `INSERT OR REPLACE INTO kv (scope, key, value) VALUES (?, ?, ?)`,
      ["prompt_cache", hash, JSON.stringify(entry)]
    );
  } catch {
    // fail-open
  }
}

export async function getPromptCacheStats() {
  try {
    const db = await getAdapter();
    const rows = db.all(`SELECT value FROM kv WHERE scope = ?`, ["prompt_cache"]);
    let totalEntries = 0;
    let totalHits = 0;
    const now = Date.now();

    for (const r of rows) {
      try {
        const item = JSON.parse(r.value);
        if (item.expiresAt > now) {
          totalEntries++;
          totalHits += Number(item.hits || 0);
        }
      } catch {}
    }

    return {
      entries: totalEntries,
      hits: totalHits,
      estimatedSavedTokens: totalHits * 450, // avg prompt tokens
    };
  } catch {
    return { entries: 0, hits: 0, estimatedSavedTokens: 0 };
  }
}

export async function clearPromptCache() {
  ramCache.clear();
  try {
    const db = await getAdapter();
    db.run(`DELETE FROM kv WHERE scope = ?`, ["prompt_cache"]);
  } catch {}
}
