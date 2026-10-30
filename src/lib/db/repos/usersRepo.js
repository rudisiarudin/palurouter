import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { getAdapter } from "../driver.js";
import { getSettings } from "./settingsRepo.js";

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name || row.email.split("@")[0],
    role: row.role === "admin" ? "admin" : "client",
    balance: Number(row.balance || 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToUserWithPassword(row) {
  if (!row) return null;
  return {
    ...rowToUser(row),
    passwordHash: row.password,
  };
}

export async function getAllUsers() {
  const db = await getAdapter();
  const rows = db.all(`SELECT * FROM users ORDER BY createdAt ASC`);
  return rows.map(rowToUser);
}

export async function getUserById(id) {
  if (!id) return null;
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM users WHERE id = ?`, [id]);
  return rowToUser(row);
}

export async function getUserByEmail(email) {
  if (!email) return null;
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [email.trim()]);
  return rowToUser(row);
}

export async function getUserWithPasswordByEmail(email) {
  if (!email) return null;
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [email.trim()]);
  return rowToUserWithPassword(row);
}

export async function createUser({
  email,
  password,
  name,
  role = "client",
  balance = 50000,
}) {
  if (!email || !password) throw new Error("Email and password are required");
  const normalizedEmail = email.trim().toLowerCase();
  
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) throw new Error("Email is already registered");

  const db = await getAdapter();
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const safeRole = role === "admin" ? "admin" : "client";
  const initialBalance = Number(balance) || 0;

  db.run(
    `INSERT INTO users (id, email, password, name, role, balance, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, normalizedEmail, passwordHash, name.trim() || normalizedEmail.split("@")[0], safeRole, initialBalance, now, now]
  );

  return getUserById(id);
}

export async function updateUser(id, updates = {}) {
  const db = await getAdapter();
  const user = await getUserById(id);
  if (!user) throw new Error("User not found");

  const fields = [];
  const params = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    params.push(updates.name.trim());
  }
  if (updates.role !== undefined) {
    fields.push("role = ?");
    params.push(updates.role === "admin" ? "admin" : "client");
  }
  if (updates.password) {
    const passwordHash = await bcrypt.hash(updates.password, 10);
    fields.push("password = ?");
    params.push(passwordHash);
  }
  if (updates.balance !== undefined) {
    fields.push("balance = ?");
    params.push(Number(updates.balance));
  }

  if (fields.length === 0) return user;

  fields.push("updatedAt = ?");
  params.push(new Date().toISOString());
  params.push(id);

  db.run(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
  return getUserById(id);
}

export async function updateUserBalance(id, delta) {
  const db = await getAdapter();
  const now = new Date().toISOString();
  db.run(
    `UPDATE users SET balance = MAX(0, balance + ?), updatedAt = ? WHERE id = ?`,
    [Number(delta), now, id]
  );
  return getUserById(id);
}

export async function deleteUser(id) {
  const db = await getAdapter();
  db.run(`DELETE FROM users WHERE id = ?`, [id]);
  return true;
}

/**
 * Ensures there is at least one admin user in the system.
 * If none exists, creates default admin: admin@router.local
 */
export async function ensureDefaultAdmin() {
  const db = await getAdapter();
  const adminRow = db.get(`SELECT * FROM users WHERE role = 'admin' LIMIT 1`);
  if (adminRow) return rowToUser(adminRow);

  const settings = await getSettings();
  const initialPassword = process.env.INITIAL_PASSWORD || "123456";
  const passwordToUse = settings?.password ? null : initialPassword;

  // If settings has a hash, we can reuse it, or hash default 123456
  const passwordHash = settings?.password || (await bcrypt.hash(initialPassword, 10));
  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT OR IGNORE INTO users (id, email, password, name, role, balance, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 'admin', 999999999, ?, ?)`,
    [id, "admin@router.local", passwordHash, "Super Admin", now, now]
  );

  return getUserById(id);
}
