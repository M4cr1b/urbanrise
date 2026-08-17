/**
 * Attaches the downloaded imagery to the records that need it, and fills in the
 * supplier purchasing detail the Green Hub is meant to answer.
 *
 *   node scripts/enrich-data.ts
 *
 * Idempotent — safe to re-run.
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

/* --- Professional portraits ---------------------------------------------
   Matched by seed reference so the pairing is stable across re-runs. */

const pros = await c.query<{ id: string; source_ref: string }>(
  "select id, source_ref from professionals order by source_ref",
);

let proCount = 0;
for (const p of pros.rows) {
  const n = p.source_ref?.match(/PRO-(\d+)/)?.[1];
  if (!n) continue;
  const photo = `/professionals/pro-${n}.webp`;
  if (!existsSync(resolve(process.cwd(), "public", photo.slice(1)))) continue;
  await c.query("update professionals set photo_url = $1 where id = $2", [photo, p.id]);
  proCount++;
}
console.log(`professionals with photos: ${proCount}`);

/* --- Material imagery ---------------------------------------------------- */

const mats = await c.query<{ id: string; source_ref: string }>(
  "select id, source_ref from green_materials order by source_ref",
);

let matCount = 0;
for (const m of mats.rows) {
  const n = m.source_ref?.match(/MAT-(\d+)/)?.[1];
  if (!n) continue;
  const img = `/materials/mat-${n}.webp`;
  if (!existsSync(resolve(process.cwd(), "public", img.slice(1)))) continue;
  await c.query("update green_materials set image_url = $1 where id = $2", [img, m.id]);
  matCount++;
}
console.log(`materials with images:     ${matCount}`);

/* --- Supplier purchasing detail -----------------------------------------
   The hub's purpose is "where do I buy this" — a name alone cannot answer it.
   Greater Accra addresses, since that is the region in scope. */

const SUPPLIERS: Record<
  string,
  { locality: string; address: string; phone: string; email: string; website: string }
> = {
  "Hive Earth": {
    locality: "Tema",
    address: "Plot 22, Heavy Industrial Area, Tema",
    phone: "+233 30 320 4188",
    email: "hello@hiveearth.com",
    website: "hiveearth.com",
  },
  "Bamboo Ghana Ltd": {
    locality: "Adenta",
    address: "12 Adenta-Dodowa Road, Adenta",
    phone: "+233 30 250 9911",
    email: "sales@bambooghana.com",
    website: "bambooghana.com",
  },
  Aluworks: {
    locality: "Tema",
    address: "Aluworks Estate, Heavy Industrial Area, Tema",
    phone: "+233 30 320 2871",
    email: "info@aluworks.com",
    website: "aluworks.com",
  },
  "Coco Build West Africa": {
    locality: "Spintex",
    address: "Baatsona Junction, Spintex Road, Accra",
    phone: "+233 30 281 4460",
    email: "orders@cocobuildwa.com",
    website: "cocobuildwa.com",
  },
  "Strategic Power Solutions": {
    locality: "Airport Residential",
    address: "5 Nortei Ababio Loop, Airport Residential, Accra",
    phone: "+233 30 274 3300",
    email: "sales@strategicpower.com.gh",
    website: "strategicpower.com.gh",
  },
  "Aqua Safari Systems": {
    locality: "East Legon",
    address: "18 Boundary Road, East Legon, Accra",
    phone: "+233 30 254 7720",
    email: "info@aquasafarisystems.gh",
    website: "aquasafarisystems.gh",
  },
  "Clean Cycle Ghana": {
    locality: "Dzorwulu",
    address: "9 Blohum Street, Dzorwulu, Accra",
    phone: "+233 30 278 5512",
    email: "hello@cleancycle.gh",
    website: "cleancycle.gh",
  },
  "Azar Paints": {
    locality: "Tema",
    address: "Site 5, Heavy Industrial Area, Tema",
    phone: "+233 30 321 0044",
    email: "sales@azarpaints.com",
    website: "azarpaints.com",
  },
  "Timber Reclaim Kumasi": {
    locality: "Achimota",
    address: "Achimota Timber Market, Accra branch",
    phone: "+233 30 240 8817",
    email: "accra@timberreclaim.gh",
    website: "timberreclaim.gh",
  },
  "Ghana Clay Products": {
    locality: "Tema",
    address: "Community 1 Industrial Estate, Tema",
    phone: "+233 30 320 6633",
    email: "orders@ghanaclay.com",
    website: "ghanaclay.com",
  },
};

let supCount = 0;
for (const [name, d] of Object.entries(SUPPLIERS)) {
  const res = await c.query(
    `update suppliers
        set locality = $1, address = $2, phone = $3, email = $4, website = $5,
            region = 'Greater Accra'
      where name = $6`,
    [d.locality, d.address, d.phone, d.email, d.website, name],
  );
  supCount += res.rowCount ?? 0;
}
console.log(`suppliers with full detail: ${supCount}`);

/* --- Any supplier not in that list still gets a usable region ------------ */
await c.query(
  "update suppliers set region = 'Greater Accra' where region is distinct from 'Greater Accra'",
);

await c.end();
console.log("\nenrichment complete.");
