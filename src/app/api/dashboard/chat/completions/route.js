import { handleChat } from "@/sse/handlers/chat.js";
import { initTranslators } from "open-sse/translator/index.js";
import { getApiKeys } from "@/lib/localDb";

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await initTranslators();
    initialized = true;
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function POST(request) {
  await ensureInitialized();

  // If request has no Authorization header, auto-provide an active internal API key
  // so testing via the dashboard playground passes the gateway's requireApiKey check.
  const authHeader = request.headers.get("authorization");
  const clonedHeaders = new Headers(request.headers);
  clonedHeaders.set("x-disable-token-saver", "true");

  if (!authHeader) {
    try {
      const keys = await getApiKeys();
      const activeKeys = keys.filter((k) => k.isActive !== false);
      const activeKey = (activeKeys.find((k) => !k.access?.restricted) || activeKeys[0])?.key;
      if (activeKey) {
        clonedHeaders.set("Authorization", `Bearer ${activeKey}`);
      }
    } catch {
      // fallback to original request
    }
  }

  const body = await request.blob();
  const authedReq = new Request(request.url, {
    method: request.method,
    headers: clonedHeaders,
    body,
    duplex: "half",
  });
  return await handleChat(authedReq);
}
