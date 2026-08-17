/**
 * Downloads the remaining imagery the interface needs and stores it locally.
 *
 *   node scripts/fetch-imagery.ts
 *
 * Everything is fetched once, converted to WebP and committed, so the running
 * site never depends on a third-party host — see scripts/localise-images.ts for
 * why that matters.
 *
 * The portraits stand in for seeded demo professionals, who are fictional. They
 * are placeholders for a real directory's uploaded photographs, not claims that
 * these people are registered surveyors.
 */

import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const UNSPLASH = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=90&fm=jpg&fit=max`;

interface Job {
  out: string;
  url: string;
  width: number;
  height?: number;
  quality?: number;
}

const jobs: Job[] = [
  /* --- Landing hero -----------------------------------------------------
     The previous hero came from a generated-asset CDN and topped out at
     1376x768, which is soft on a full-bleed desktop stage. This is a real
     photograph at full resolution. */
  {
    out: "public/hero-eco-home.webp",
    url: UNSPLASH("1600585154340-be6161a56a0c", 3200),
    width: 2800,
    quality: 88,
  },

  /* --- Estate professionals -------------------------------------------- */
  { out: "public/professionals/pro-001.webp", url: UNSPLASH("1507003211169-0a1dd7228f2d", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-002.webp", url: UNSPLASH("1573497019940-1c28c88b4f3e", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-003.webp", url: UNSPLASH("1500648767791-00dcc994a43e", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-004.webp", url: UNSPLASH("1580489944761-15a19d654956", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-005.webp", url: UNSPLASH("1519085360753-af0119f7cbe7", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-006.webp", url: UNSPLASH("1494790108377-be9c29b29330", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-007.webp", url: UNSPLASH("1472099645785-5658abf4ff4e", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-008.webp", url: UNSPLASH("1506794778202-cad84cf45f1d", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-009.webp", url: UNSPLASH("1544005313-94ddf0286df2", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-010.webp", url: UNSPLASH("1560250097-0b93528c311a", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-011.webp", url: UNSPLASH("1487412720507-e7ab37603c6f", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-012.webp", url: UNSPLASH("1568602471122-7832951cc4c5", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-013.webp", url: UNSPLASH("1534528741775-53994a69daeb", 800), width: 600, height: 750 },
  { out: "public/professionals/pro-014.webp", url: UNSPLASH("1492562080023-ab3db95bfbce", 800), width: 600, height: 750 },

  /* --- Green building materials ----------------------------------------
     Each shows the material itself rather than a finished building, so it is
     recognisable at a merchant. */
  { out: "public/materials/mat-001.webp", url: UNSPLASH("1517581177682-a085bb7ffb15", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-002.webp", url: UNSPLASH("1489514354504-1653aa90e34e", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-003.webp", url: UNSPLASH("1605276374104-dee2a0ed3cd6", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-004.webp", url: UNSPLASH("1607400201889-565b1ee75f8e", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-005.webp", url: UNSPLASH("1509391366360-2e959784a276", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-006.webp", url: UNSPLASH("1621905251189-08b45d6a269e", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-007.webp", url: UNSPLASH("1523413651479-597eb2da0ad6", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-008.webp", url: UNSPLASH("1595514535415-dae8580c416c", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-009.webp", url: UNSPLASH("1562259949-e8e7689d7828", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-010.webp", url: UNSPLASH("1604014237800-1c9102c219da", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-011.webp", url: UNSPLASH("1605276374104-dee2a0ed3cd6", 1200), width: 900, height: 675 },
  { out: "public/materials/mat-012.webp", url: UNSPLASH("1607400201889-565b1ee75f8e", 1200), width: 900, height: 675 },
];

let ok = 0;
let failed = 0;

for (const job of jobs) {
  const dest = resolve(process.cwd(), job.out);
  mkdirSync(resolve(dest, ".."), { recursive: true });

  if (existsSync(dest)) {
    ok++;
    continue;
  }

  try {
    const res = await fetch(job.url, { redirect: "follow" });
    if (!res.ok) throw new Error(`http ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());

    let pipeline = sharp(buf);
    if (job.height) {
      // Portraits and material shots are cropped to a consistent ratio so the
      // grids do not go ragged.
      pipeline = pipeline.resize(job.width, job.height, { fit: "cover", position: "attention" });
    } else {
      pipeline = pipeline.resize(job.width, undefined, { withoutEnlargement: true });
    }

    const out = await pipeline.webp({ quality: job.quality ?? 82 }).toBuffer();
    writeFileSync(dest, out);
    const meta = await sharp(out).metadata();
    console.log(
      `  ${job.out.padEnd(38)} ${(out.length / 1024).toFixed(0).padStart(5)}KB  ${meta.width}x${meta.height}`,
    );
    ok++;
  } catch (e) {
    failed++;
    console.log(`  FAIL ${job.out}  ${(e as Error).message}`);
  }
}

console.log(`\n${ok} available, ${failed} failed.`);
