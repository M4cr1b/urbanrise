/**
 * Attaches profile photographs to the professionals directory.
 *
 *   node scripts/make-portraits.ts
 *
 * On sourcing
 * -----------
 * Each photograph below was checked on a contact sheet before being assigned —
 * an earlier pass picked ids blind and produced an almost entirely European set
 * for a directory of Ghanaian professionals, which reads as nobody having
 * looked. Forty-plus candidates yielded eight suitable portraits.
 *
 * The remaining professionals keep `photo_url` null and render as a monogram.
 * That is deliberate rather than a shortfall: a real directory always has
 * members who have not uploaded a photograph yet, so the interface has to carry
 * that state well, and a monogram is honest where a stock portrait of an
 * unrelated person beside an invented licence number is not.
 *
 * When professional sign-up exists, uploaded photographs replace these and
 * nothing else changes.
 */

import sharp from "sharp";
import { Client } from "pg";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const OUT = resolve(process.cwd(), "public/professionals");
mkdirSync(OUT, { recursive: true });

/** source_ref suffix -> verified Unsplash photo id. */
const PORTRAITS: Record<string, string> = {
  "001": "1616805765352-beedbad46b2a", // Kwame Asante — surveyor, suit
  "002": "1507152832244-10d45c7eda57", // Efua Danquah — surveyor
  "004": "1531123897727-8f129e1688ce", // Abena Owusu — agent
  "005": "1531384441138-2736e62e0919", // Nii Armah Quaye — lawyer
  "007": "1521119989659-a83eee488004", // Selorm Nyaho — architect
  "009": "1573497019940-1c28c88b4f3e", // Comfort Adjei — quantity surveyor
  "010": "1546456073-6712f79251bb", // Kofi Mensah — property manager
  "011": "1589156280159-27698a70f29e", // Akua Frimpong — mortgage consultant
};

const c = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const { rows } = await c.query<{ id: string; name: string; source_ref: string }>(
  "select id, name, source_ref from professionals order by source_ref",
);

let withPhoto = 0;
let withMonogram = 0;

for (const p of rows) {
  const num = p.source_ref?.match(/PRO-(\d+)/)?.[1] ?? "";
  const photoId = PORTRAITS[num];

  if (!photoId) {
    await c.query("update professionals set photo_url = null where id = $1", [p.id]);
    withMonogram++;
    console.log(`  ${p.name.padEnd(20)} monogram`);
    continue;
  }

  const file = `pro-${num}.webp`;
  const dest = resolve(OUT, file);

  if (!existsSync(dest)) {
    const res = await fetch(
      `https://images.unsplash.com/photo-${photoId}?w=800&q=90&fm=jpg&fit=max`,
      { redirect: "follow" },
    );
    if (!res.ok) {
      console.log(`  ${p.name.padEnd(20)} FAILED http ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    // Square crop, face-weighted — the card renders it in a circle.
    const out = await sharp(buf)
      .resize(600, 600, { fit: "cover", position: "attention" })
      .webp({ quality: 85 })
      .toBuffer();
    writeFileSync(dest, out);
  }

  await c.query("update professionals set photo_url = $1 where id = $2", [
    `/professionals/${file}`,
    p.id,
  ]);
  withPhoto++;
  console.log(`  ${p.name.padEnd(20)} ${file}`);
}

await c.end();
console.log(`\n${withPhoto} photographs, ${withMonogram} monograms.`);
