/**
 * Downloads remote listing photography into public/ and repoints the database
 * at the local copies.
 *
 *   node scripts/localise-images.ts
 *
 * The seeded listings referenced images.unsplash.com directly. Next's image
 * optimiser fetches each one server-side, so a page view became several
 * outbound requests to a third party — which rate-limits, at which point the
 * optimiser returns 500 and the listing renders with empty frames. The
 * imported Notion listings were already local; this brings the rest in line.
 *
 * Idempotent: an image already present is skipped.
 */

import { Client } from "pg";
import sharp from "sharp";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const OUT_DIR = resolve(process.cwd(), "public/properties/seed");
mkdirSync(OUT_DIR, { recursive: true });

const c = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const { rows } = await c.query<{ id: number; property_id: string; url: string }>(
  "select id, property_id, url from property_media where url like 'http%' order by property_id, sort",
);

console.log(`${rows.length} remote image reference(s)\n`);

/** Stable filename from the URL, so re-runs reuse what is already downloaded. */
function localNameFor(url: string): string {
  const photoId = url.match(/photo-([\w-]+)/)?.[1];
  const base =
    photoId ?? createHash("sha1").update(url).digest("hex").slice(0, 12);
  return `${base}.webp`;
}

let downloaded = 0;
let reused = 0;
let failed = 0;

for (const row of rows) {
  const name = localNameFor(row.url);
  const dest = resolve(OUT_DIR, name);
  const publicPath = `/properties/seed/${name}`;

  if (existsSync(dest)) {
    reused++;
  } else {
    try {
      const res = await fetch(row.url, { redirect: "follow" });
      if (!res.ok) throw new Error(`http ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const webp = await sharp(buf)
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      writeFileSync(dest, webp);
      downloaded++;
      console.log(
        `  saved  ${name}  ${(webp.length / 1024).toFixed(0)}KB  (${row.property_id})`,
      );
    } catch (e) {
      failed++;
      console.log(`  FAIL   ${row.property_id}  ${(e as Error).message}`);
      continue;
    }
  }

  await c.query("update property_media set url = $1 where id = $2", [
    publicPath,
    row.id,
  ]);
}

await c.end();

console.log(
  `\ndownloaded ${downloaded}, reused ${reused}, failed ${failed}` +
    (failed ? " — those rows still point remotely." : "."),
);
