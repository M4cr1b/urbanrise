/**
 * Database owner tasks: connectivity check, migrations, seeding.
 *
 *   npx tsx scripts/db.ts check      # prove the connection works
 *   npx tsx scripts/db.ts migrate    # apply supabase/migrations/*.sql in order
 *   npx tsx scripts/db.ts seed       # load the Ghanaian dataset into Postgres
 *   npx tsx scripts/db.ts status     # row counts per table
 *
 * Migrations are tracked in a `schema_migrations` table, so re-running is safe:
 * a file that has already been applied is skipped rather than replayed.
 */

import { Client } from "pg";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

/* --- Environment --------------------------------------------------------- */

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

if (!DB_URL) {
  console.error(
    "SUPABASE_DB_URL is not set in .env.local — nothing to connect to.",
  );
  process.exit(1);
}

/** Supabase terminates TLS with its own CA; verification is off by design. */
function connect() {
  return new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20_000,
  });
}

/* --- Commands ------------------------------------------------------------ */

async function check() {
  const url = new URL(DB_URL!);
  console.log(`host   ${url.hostname}`);
  console.log(`port   ${url.port}`);
  console.log(`user   ${url.username}`);

  const c = connect();
  await c.connect();
  const { rows } = await c.query(
    "select current_database() db, current_user usr, version() v",
  );
  console.log(
    `\nconnected — ${rows[0].db} as ${rows[0].usr}\n${rows[0].v.split(" on ")[0]}`,
  );

  const ext = await c.query(
    "select extname from pg_extension where extname in ('postgis','uuid-ossp') order by extname",
  );
  console.log(
    `extensions present: ${ext.rows.map((r) => r.extname).join(", ") || "none yet"}`,
  );
  await c.end();
}

async function migrate() {
  const dir = resolve(process.cwd(), "supabase/migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const c = connect();
  await c.connect();

  await c.query(`
    create table if not exists schema_migrations (
      filename    text primary key,
      applied_at  timestamptz not null default now()
    )
  `);

  const { rows } = await c.query<{ filename: string }>(
    "select filename from schema_migrations",
  );
  const applied = new Set(rows.map((r) => r.filename));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  skip   ${file} (already applied)`);
      continue;
    }

    const sql = readFileSync(join(dir, file), "utf8");
    process.stdout.write(`  apply  ${file} … `);

    // Each migration runs in one transaction: a failure leaves no partial schema.
    try {
      await c.query("begin");
      await c.query(sql);
      await c.query("insert into schema_migrations (filename) values ($1)", [
        file,
      ]);
      await c.query("commit");
      console.log("ok");
    } catch (err) {
      await c.query("rollback");
      console.log("FAILED");
      throw err;
    }
  }

  await c.end();
  console.log("\nmigrations up to date.");
}

async function status() {
  const c = connect();
  await c.connect();

  const tables = [
    "properties",
    "property_media",
    "property_green_features",
    "sale_history",
    "agents",
    "professionals",
    "suppliers",
    "green_materials",
    "market_stats",
    "valuations",
  ];

  for (const t of tables) {
    try {
      const { rows } = await c.query(`select count(*)::int n from ${t}`);
      console.log(`  ${t.padEnd(26)} ${String(rows[0].n).padStart(6)}`);
    } catch {
      console.log(`  ${t.padEnd(26)} ${"—".padStart(6)}  (missing)`);
    }
  }

  await c.end();
}

/* --- Entry --------------------------------------------------------------- */

const command = process.argv[2] ?? "check";
const commands: Record<string, () => Promise<void>> = {
  check,
  migrate,
  status,
  seed: async () => {
    const { seed } = await import("./db-seed.ts");
    await seed(connect);
  },
};

const run = commands[command];
if (!run) {
  console.error(`unknown command "${command}". Try: check | migrate | seed | status`);
  process.exit(1);
}

run().catch((err) => {
  console.error(`\n${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
