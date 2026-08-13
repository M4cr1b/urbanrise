/**
 * Verifies every image URL the database references actually resolves.
 *
 *   node scripts/check-images.ts
 *
 * A listing whose photograph 404s still renders — just with an empty frame and
 * a console error — so this failure is invisible until someone looks. Worth a
 * check that can be run before a deploy.
 */

import { Client } from "pg";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const c = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const { rows } = await c.query<{ property_id: string; url: string }>(
  "select property_id, url from property_media order by property_id, sort",
);
await c.end();

console.log(`checking ${rows.length} image reference(s)\n`);

let broken = 0;

for (const r of rows) {
  if (r.url.startsWith("/")) {
    // Local asset: confirm the file is actually in public/.
    const ok = existsSync(resolve(process.cwd(), "public", r.url.slice(1)));
    if (!ok) {
      broken++;
      console.log(`  MISSING  ${r.property_id}  ${r.url}`);
    }
    continue;
  }

  try {
    // HEAD is enough and avoids pulling the bytes.
    const res = await fetch(r.url, { method: "HEAD", redirect: "follow" });
    if (!res.ok) {
      broken++;
      console.log(`  HTTP ${res.status}  ${r.property_id}  ${r.url.slice(0, 90)}`);
    }
  } catch (e) {
    broken++;
    console.log(
      `  FETCH FAIL  ${r.property_id}  ${(e as Error).message}  ${r.url.slice(0, 70)}`,
    );
  }
}

console.log(
  broken === 0
    ? "\nall image references resolve."
    : `\n${broken} broken reference(s).`,
);
process.exit(broken === 0 ? 0 : 1);
