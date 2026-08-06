/**
 * One-off connectivity diagnosis: which API keys work, and which Supavisor
 * pooler region actually accepts the database credentials.
 *
 *   node scripts/diagnose.ts
 *
 * Kept in the repo because "why can't it reach the database" is the question
 * most likely to come up again on a new machine or network.
 */

import { Client } from "pg";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
const env: Record<string, string> = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) env[m[1]] = m[2].trim();
  }
}

const base = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const ref = base.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1] ?? "";

/* --- 1. API keys --------------------------------------------------------- */

async function probeKey(label: string, key: string) {
  if (!key) return console.log(`  ${label.padEnd(14)} not set`);
  try {
    const res = await fetch(`${base}/rest/v1/properties?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const body = await res.text();
    const code = res.headers.get("sb-error-code") ?? "";
    // 404 / PGRST205 means auth passed but the table does not exist yet —
    // which at this stage is exactly what we expect and want to see.
    const verdict =
      res.ok || /PGRST205|does not exist|relation/i.test(body)
        ? "OK (authenticated)"
        : `REJECTED ${code}`;
    console.log(`  ${label.padEnd(14)} http ${res.status}  ${verdict}`);
  } catch (e) {
    console.log(`  ${label.padEnd(14)} network error: ${(e as Error).message}`);
  }
}

/* --- 2. Pooler region ---------------------------------------------------- */

const REGIONS = [
  "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1", "eu-central-2",
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "ap-southeast-1", "ap-southeast-2", "ap-south-1",
  "ap-northeast-1", "ap-northeast-2", "ca-central-1", "sa-east-1",
];

async function probeRegion(host: string, password: string) {
  const c = new Client({
    host,
    port: 5432,
    user: `postgres.${ref}`,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await c.connect();
    await c.query("select 1");
    await c.end();
    return "CONNECTED";
  } catch (e) {
    const msg = (e as Error).message;
    await c.end().catch(() => {});
    // "Tenant or user not found" = wrong region. Anything else is informative.
    if (/tenant or user not found/i.test(msg)) return null;
    return msg;
  }
}

async function main() {
  console.log(`project ref: ${ref || "COULD NOT PARSE FROM URL"}\n`);

  console.log("API keys:");
  await probeKey("publishable", env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  await probeKey("service_role", env.SUPABASE_SERVICE_ROLE_KEY);

  const dbUrl = env.SUPABASE_DB_URL;
  if (!dbUrl) return;

  const password = decodeURIComponent(new URL(dbUrl).password);
  console.log("\nPooler regions (probing for the one that owns this project):");

  for (const region of REGIONS) {
    for (const prefix of ["aws-0", "aws-1"]) {
      const host = `${prefix}-${region}.pooler.supabase.com`;
      const result = await probeRegion(host, password);
      if (result) {
        console.log(`  ${host}\n    -> ${result}`);
        if (result === "CONNECTED") {
          console.log(
            `\nUse this:\n  SUPABASE_DB_URL=postgresql://postgres.${ref}:<password>@${host}:5432/postgres`,
          );
          return;
        }
      }
    }
  }
  console.log("  no region accepted the credentials.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
