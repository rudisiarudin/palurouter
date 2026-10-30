import { v4 as uuidv4 } from "uuid";
import { getAdapter } from "../driver.js";
import { keyAccessFromColumns, keyAccessToColumns } from "@/shared/utils/keyAccess.js";
import { KEY_ACCESS_UNRESTRICTED } from "@/shared/constants/keyAccess.js";

function rowToKey(row) {
  if (!row) return null;
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    machineId: row.machineId,
    userId: row.userId || null,
    isActive: row.isActive === 1 || row.isActive === true,
    createdAt: row.createdAt,
    access: keyAccessFromColumns(row.accessRestricted, row.accessAllow),
    balance: row.balance !== null && row.balance !== undefined ? Number(row.balance) : null,
    creditLimit: row.creditLimit !== null && row.creditLimit !== undefined ? Number(row.creditLimit) : null,
    spent: Number(row.spent || 0),
    rateLimitRpm: row.rateLimitRpm !== null && row.rateLimitRpm !== undefined ? Number(row.rateLimitRpm) : null,
  };
}

export async function getApiKeys(userId = null) {
  const db = await getAdapter();
  const rows = userId
    ? db.all(`SELECT * FROM apiKeys WHERE userId = ? ORDER BY createdAt ASC`, [userId])
    : db.all(`SELECT * FROM apiKeys ORDER BY createdAt ASC`);
  return rows.map(rowToKey);
}

export async function getApiKeyById(id) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
  return rowToKey(row);
}

// Used by the /v1 handlers to read the presented key's access settings and quota.
export async function getApiKeyByKey(key) {
  if (!key) return null;
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM apiKeys WHERE key = ?`, [key]);
  return rowToKey(row);
}

export async function createApiKey(name, machineId, options = {}) {
  if (!machineId) throw new Error("machineId is required");
  const db = await getAdapter();
  const { generateApiKeyWithMachine } = await import("@/shared/utils/apiKey");
  const result = generateApiKeyWithMachine(machineId);

  const initialBalance = options.balance !== undefined && options.balance !== null ? Number(options.balance) : null;
  const initialCreditLimit = options.creditLimit !== undefined && options.creditLimit !== null
    ? Number(options.creditLimit)
    : initialBalance;
  const rateLimitRpm = options.rateLimitRpm !== undefined && options.rateLimitRpm !== null
    ? Number(options.rateLimitRpm)
    : null;
  const userId = options.userId || null;

  const apiKey = {
    id: uuidv4(),
    name,
    key: result.key,
    machineId,
    userId,
    isActive: true,
    createdAt: new Date().toISOString(),
    access: { restricted: false, allow: [] },
    balance: initialBalance,
    creditLimit: initialCreditLimit,
    spent: 0,
    rateLimitRpm,
  };

  const cols = keyAccessToColumns(KEY_ACCESS_UNRESTRICTED);
  db.run(
    `INSERT INTO apiKeys(id, key, name, machineId, userId, isActive, createdAt, accessRestricted, accessAllow, balance, creditLimit, spent, rateLimitRpm)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      apiKey.id,
      apiKey.key,
      apiKey.name,
      apiKey.machineId,
      apiKey.userId,
      1,
      apiKey.createdAt,
      cols.accessRestricted,
      cols.accessAllow,
      apiKey.balance,
      apiKey.creditLimit,
      0,
      apiKey.rateLimitRpm,
    ]
  );
  return apiKey;
}

export async function updateApiKey(id, data) {
  const db = await getAdapter();
  let result = null;
  db.transaction(() => {
    const row = db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
    if (!row) return;
    const current = rowToKey(row);
    const merged = { ...current, ...data };
    const cols = keyAccessToColumns(merged.access);

    const balance = merged.balance !== undefined && merged.balance !== null ? Number(merged.balance) : null;
    const creditLimit = merged.creditLimit !== undefined && merged.creditLimit !== null ? Number(merged.creditLimit) : null;
    const spent = Number(merged.spent || 0);
    const rateLimitRpm = merged.rateLimitRpm !== undefined && merged.rateLimitRpm !== null ? Number(merged.rateLimitRpm) : null;

    db.run(
      `UPDATE apiKeys
       SET key = ?, name = ?, machineId = ?, isActive = ?, accessRestricted = ?, accessAllow = ?, balance = ?, creditLimit = ?, spent = ?, rateLimitRpm = ?
       WHERE id = ?`,
      [
        merged.key,
        merged.name,
        merged.machineId,
        merged.isActive ? 1 : 0,
        cols.accessRestricted,
        cols.accessAllow,
        balance,
        creditLimit,
        spent,
        rateLimitRpm,
        id,
      ]
    );
    result = rowToKey(db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]));
  });
  return result;
}

export async function deductApiKeyBalance(keyStr, costIdr) {
  if (!keyStr || !costIdr || costIdr <= 0) return null;
  const db = await getAdapter();
  let updated = null;
  try {
    db.transaction(() => {
      const row = db.get(`SELECT id, balance, spent FROM apiKeys WHERE key = ?`, [keyStr]);
      if (!row) return;
      const currentBalance = row.balance !== null && row.balance !== undefined ? Number(row.balance) : null;
      const currentSpent = Number(row.spent || 0);
      const newSpent = currentSpent + costIdr;

      let newBalance = currentBalance;
      if (currentBalance !== null) {
        newBalance = Math.max(0, currentBalance - costIdr);
      }

      db.run(`UPDATE apiKeys SET balance = ?, spent = ? WHERE key = ?`, [newBalance, newSpent, keyStr]);
      updated = { balance: newBalance, spent: newSpent };
    });
  } catch (err) {
    console.warn(`[APIKey] Balance deduction failed for key: ${err.message}`);
  }
  return updated;
}

export async function topUpApiKeyBalance(id, amountIdr) {
  if (!id || typeof amountIdr !== "number" || amountIdr <= 0) return null;
  const db = await getAdapter();
  let updated = null;
  db.transaction(() => {
    const row = db.get(`SELECT id, balance, creditLimit FROM apiKeys WHERE id = ?`, [id]);
    if (!row) return;
    const curBalance = row.balance !== null && row.balance !== undefined ? Number(row.balance) : 0;
    const curLimit = row.creditLimit !== null && row.creditLimit !== undefined ? Number(row.creditLimit) : 0;
    const newBalance = curBalance + amountIdr;
    const newLimit = curLimit + amountIdr;

    db.run(`UPDATE apiKeys SET balance = ?, creditLimit = ? WHERE id = ?`, [newBalance, newLimit, id]);
    updated = rowToKey(db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]));
  });
  return updated;
}

export async function deleteApiKey(id) {
  const db = await getAdapter();
  const res = db.run(`DELETE FROM apiKeys WHERE id = ?`, [id]);
  return (res?.changes ?? 0) > 0;
}

export async function validateApiKey(key) {
  const db = await getAdapter();
  const row = db.get(`SELECT isActive FROM apiKeys WHERE key = ?`, [key]);
  if (!row) return false;
  return row.isActive === 1 || row.isActive === true;
}
