import pg from "pg";
const { Pool } = pg;

// Helper to translate SQLite-style SQL queries into PostgreSQL compliant queries
function translateSql(sql) {
  if (typeof sql !== "string") return sql;
  let translated = sql;

  // 1. Convert ? placeholders to $1, $2, $3...
  let paramIdx = 1;
  translated = translated.replace(/\?/g, () => `$${paramIdx++}`);

  // 2. Wrap known mixedCase table names in quotes if not already quoted
  const mixedTables = [
    "providerConnections",
    "providerNodes",
    "proxyPools",
    "apiKeys",
    "usageHistory",
    "usageDaily",
    "requestDetails",
  ];
  for (const t of mixedTables) {
    const regex = new RegExp(`(?<!")\\b${t}\\b(?!")`, "g");
    translated = translated.replace(regex, `"${t}"`);
  }

  // 3. Handle INSERT OR IGNORE -> INSERT INTO ... ON CONFLICT DO NOTHING
  if (/INSERT\s+OR\s+IGNORE\s+INTO/i.test(translated)) {
    translated = translated.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, "INSERT INTO");
    if (!/ON\s+CONFLICT/i.test(translated)) {
      translated += " ON CONFLICT DO NOTHING";
    }
  }

  return translated;
}

export function createPgAdapter(connectionString) {
  const pool = new Pool({
    connectionString,
    ssl:
      connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return {
    driver: "postgres",
    async run(sql, params = []) {
      const pgSql = translateSql(sql);
      const res = await pool.query(pgSql, params);
      return {
        changes: res.rowCount,
        lastInsertRowid: res.rows[0]?.id || null,
      };
    },
    async get(sql, params = []) {
      const pgSql = translateSql(sql);
      const res = await pool.query(pgSql, params);
      return res.rows[0] || null;
    },
    async all(sql, params = []) {
      const pgSql = translateSql(sql);
      const res = await pool.query(pgSql, params);
      return res.rows || [];
    },
    async exec(sql) {
      return await pool.query(sql);
    },
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const txAdapter = {
          async run(sql, params = []) {
            const res = await client.query(translateSql(sql), params);
            return { changes: res.rowCount, lastInsertRowid: res.rows[0]?.id || null };
          },
          async get(sql, params = []) {
            const res = await client.query(translateSql(sql), params);
            return res.rows[0] || null;
          },
          async all(sql, params = []) {
            const res = await client.query(translateSql(sql), params);
            return res.rows || [];
          },
          async exec(sql) {
            return await client.query(sql);
          },
        };
        const result = await fn(txAdapter);
        await client.query("COMMIT");
        return result;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    },
    checkpoint() {},
    async close() {
      await pool.end();
    },
    raw: pool,
  };
}
