import { Client } from "pg";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvLocal();

const DB_URL = process.env.SUPABASE_DB_URL;
console.log("DB_URL:", DB_URL?.split("@")[1]?.split("/")[0] || "unknown");

if (!DB_URL) {
  console.error("SUPABASE_DB_URL not set");
  process.exit(1);
}

const c = new Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  statement_timeout: 30000,
});

async function run() {
  try {
    console.log("Connecting...");
    await c.connect();
    console.log("Connected");

    // Check current state
    const { rows: propCount } = await c.query("SELECT count(*) FROM properties");
    console.log("Properties in DB:", propCount[0].count);

    const { rows: agentCount } = await c.query("SELECT count(*) FROM agents");
    console.log("Agents in DB:", agentCount[0].count);

    await c.end();
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

run();
