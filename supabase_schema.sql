-- ==============================================================================
-- PALU Router v1.0.0 - Supabase / PostgreSQL Schema Definition
-- Run this in Supabase SQL Editor if setting up manually, or let PALU Router
-- auto-create tables via DATABASE_URL on initial startup.
-- ==============================================================================

-- 1. Metadata / Schema Versioning
CREATE TABLE IF NOT EXISTS _meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 2. System Settings & Global Config
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL
);

-- 3. AI Provider Connections (OAuth / API Keys)
CREATE TABLE IF NOT EXISTS "providerConnections" (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  "authType" TEXT NOT NULL,
  name TEXT,
  email TEXT,
  priority INTEGER,
  "isActive" INTEGER DEFAULT 1,
  data TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pc_provider ON "providerConnections"(provider);
CREATE INDEX IF NOT EXISTS idx_pc_provider_active ON "providerConnections"(provider, "isActive");
CREATE INDEX IF NOT EXISTS idx_pc_priority ON "providerConnections"(provider, priority);

-- 4. Provider Nodes (Load Balancing / Multi-endpoint)
CREATE TABLE IF NOT EXISTS "providerNodes" (
  id TEXT PRIMARY KEY,
  type TEXT,
  name TEXT,
  data TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pn_type ON "providerNodes"(type);

-- 5. Outbound Proxy Pools
CREATE TABLE IF NOT EXISTS "proxyPools" (
  id TEXT PRIMARY KEY,
  "isActive" INTEGER DEFAULT 1,
  "testStatus" TEXT,
  data TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pp_active ON "proxyPools"("isActive");
CREATE INDEX IF NOT EXISTS idx_pp_status ON "proxyPools"("testStatus");

-- 6. Multi-User Accounts & RBAC
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'client',
  balance NUMERIC DEFAULT 0,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 7. API Keys Management & Quota Billing
CREATE TABLE IF NOT EXISTS "apiKeys" (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT,
  "machineId" TEXT,
  "userId" TEXT,
  "isActive" INTEGER DEFAULT 1,
  "createdAt" TEXT NOT NULL,
  "accessRestricted" INTEGER DEFAULT 0,
  "accessAllow" TEXT,
  balance NUMERIC DEFAULT NULL,
  "creditLimit" NUMERIC DEFAULT NULL,
  spent NUMERIC DEFAULT 0,
  "rateLimitRpm" INTEGER DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_ak_key ON "apiKeys"(key);
CREATE INDEX IF NOT EXISTS idx_ak_userId ON "apiKeys"("userId");

-- 8. Routing Combos & Fallback Chains
CREATE TABLE IF NOT EXISTS combos (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  kind TEXT,
  models TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_combo_name ON combos(name);

-- 9. Key-Value Store (Pricing, Custom Models, Tool Mappings)
CREATE TABLE IF NOT EXISTS kv (
  scope TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (scope, key)
);
CREATE INDEX IF NOT EXISTS idx_kv_scope ON kv(scope);

-- 10. Request Usage History & Token Analytics
CREATE TABLE IF NOT EXISTS "usageHistory" (
  id BIGSERIAL PRIMARY KEY,
  timestamp TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  "connectionId" TEXT,
  "apiKey" TEXT,
  endpoint TEXT,
  "promptTokens" BIGINT DEFAULT 0,
  "completionTokens" BIGINT DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  status TEXT,
  tokens TEXT,
  meta TEXT
);
CREATE INDEX IF NOT EXISTS idx_uh_ts ON "usageHistory"(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_uh_provider ON "usageHistory"(provider);
CREATE INDEX IF NOT EXISTS idx_uh_model ON "usageHistory"(model);
CREATE INDEX IF NOT EXISTS idx_uh_conn ON "usageHistory"("connectionId");

-- 11. Daily Aggregated Usage Summaries
CREATE TABLE IF NOT EXISTS "usageDaily" (
  "dateKey" TEXT PRIMARY KEY,
  data TEXT NOT NULL
);

-- 12. Detailed Request Traces
CREATE TABLE IF NOT EXISTS "requestDetails" (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  "connectionId" TEXT,
  status TEXT,
  data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rd_ts ON "requestDetails"(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rd_provider ON "requestDetails"(provider);
CREATE INDEX IF NOT EXISTS idx_rd_model ON "requestDetails"(model);
CREATE INDEX IF NOT EXISTS idx_rd_conn ON "requestDetails"("connectionId");

-- Enable Row Level Security (RLS) on sensitive tables for Supabase security compliance
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE "apiKeys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE "providerConnections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "providerNodes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "proxyPools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usageHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usageDaily" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "requestDetails" ENABLE ROW LEVEL SECURITY;
ALTER TABLE _meta ENABLE ROW LEVEL SECURITY;

-- Allow full access for backend service_role / pooler postgres connection
CREATE POLICY "Service Role Full Access" ON users FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON "apiKeys" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON settings FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON "providerConnections" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON "providerNodes" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON "proxyPools" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON combos FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON kv FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON "usageHistory" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON "usageDaily" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON "requestDetails" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access" ON _meta FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
