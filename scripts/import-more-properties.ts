/**
 * One-off import of 4 more real, professionally photographed listings.
 *
 *   node scripts/import-more-properties.ts
 *
 * Source files are already WebP (unlike the previous batch's PNGs) at healthy
 * web resolution, so this mostly just renames/normalises them into
 * public/properties/<slug>/NN.webp — but still re-encodes via sharp so the
 * output is consistent with the rest of the site's listing photography.
 *
 * Each property's file list is given explicitly, in the desired final order —
 * not an alphabetical loop — because the exterior shot (verified by direct
 * visual inspection, not filename convention) must land at 01.webp so it
 * becomes the cover photo everywhere images[0] is used as the thumbnail.
 *
 * Idempotent: an existing output file is left alone.
 */

import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE_ROOT = "C:/Users/Admin/Desktop/Done";

interface PropertyImages {
  slug: string;
  sourceDir: string;
  files: string[]; // in final display order; index 0 becomes 01.webp (the cover)
}

const PROPERTIES: PropertyImages[] = [
  {
    slug: "east-legon-hills-savehands",
    sourceDir: "PROPERTY ONE IMAGES",
    files: [
      "53407295_MTIwMC0xNjAwLTFlYWFjZWUxNzA.webp", // exterior
      "53407294_MTIwMC0xNjAwLTcwMDdlYjI4ZjA.webp",
      "53407296_MTIwMC0xNjAwLTJlNTc1Yjc3ZGU.webp",
      "53407297_MTIwMC0xNjAwLTFjMTdhNGFmNzE.webp",
      "53407298_MTIwMC0xNjAwLTY0Mjg0MDEyOGQ.webp",
      "53407303_MTIwMC0xNjAwLTUzM2Y0ZWEyZDE.webp",
      "53407305_MTIwMC0xNjAwLWM0MWI5MmEzZWM.webp",
      "53407306_MTIwMC0xNjAwLWI5MTZhNmVhZjA.webp",
      "53407308_MTIwMC0xNjAwLTFiODFkMTk5MWU.webp",
      "53407319_MTIwMC0xNjAwLWFkZDA4NjI5Nzc.webp",
    ],
  },
  {
    slug: "east-legon-hills-thebeast",
    sourceDir: "PROPERTY TWO IMAGES",
    files: [
      "61691443_MTUzNi0yMDQ4LWUyY2ZkZTlmNzQ.webp", // exterior (full dusk facade)
      "61691440_NzIwLTk2MC1mZTMzN2I0NzVm.webp",
      "61691444_MTUzNi0yMDQ4LWY4OTk2NGFlNGM.webp",
      "61691445_OTYwLTEyODAtMzk3NDU3YWM0Nw.webp",
      "61691448_MTUzNi0yMDQ4LWYxZTRlMDlmZTk.webp",
      "61691451_MTUzNi0yMDQ4LWEwMzI2MDA4NDA.webp",
      "61691452_MTUzNi0yMDQ4LWNkN2E4ZWUxYTc.webp",
      "61691455_MTUzNi0yMDQ4LTMyYjUyZGJlNmE.webp",
      "61691456_MTUzNi0yMDQ4LTNhMGQ1MzFlZjY.webp",
      "61691457_MTUzNi0yMDQ4LWViMWU4NzQyMDc.webp",
    ],
  },
  {
    slug: "east-legon-adjiganor",
    sourceDir: "PROPERTY THREE IMAGES",
    files: [
      "61693026_MTA4Ni0xNDQ4LTM1YmQyYWUyNjk.webp", // exterior (already first)
      "61693027_MTUzNi0yMDQ4LTQ4NDk2OTY1ODA.webp",
      "61693028_MTUzNi0yMDQ4LWI1NGYzMWZlNjI.webp",
      "61693029_MTUzNi0yMDQ4LWE2NTBlNjRiZDg.webp",
      "61693031_MTUzNi0yMDQ4LTU1MjI0Y2QyM2U.webp",
      "61693037_MTUzNi0yMDQ4LTU3MWJjMGRmZjM.webp",
      "61693039_MTUzNi0yMDQ4LTVhYWU3YzVjNzI.webp",
    ],
  },
  {
    slug: "east-legon-nanakrom",
    sourceDir: "PROPERTY FOUR IMAGES",
    files: [
      "43252152_MTI4NC0xNjAwLWRiNzliMmJhNjY.webp", // exterior
      "43252133_MTI4NC0xNjAwLTUwZmQ1N2ZiZjY.webp",
      "43252140_MTI4NC0xNjAwLTM1MTBlY2I0ZjE.webp",
      "43252150_MTI4NC0xNjAwLWM0YzQxNjQ4MjQ.webp",
      "43252151_MTI4NC0xNjAwLTUyZDEzOTViZTU.webp",
      "43252154_MTI4NC0xNjAwLTQ2NWZmNzZlZGM.webp",
    ],
  },
];

async function main() {
  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const prop of PROPERTIES) {
    const srcDir = resolve(SOURCE_ROOT, prop.sourceDir);
    const outDir = resolve(process.cwd(), "public/properties", prop.slug);
    mkdirSync(outDir, { recursive: true });

    for (const [i, file] of prop.files.entries()) {
      const destName = `${String(i + 1).padStart(2, "0")}.webp`;
      const dest = resolve(outDir, destName);
      const src = resolve(srcDir, file);

      if (existsSync(dest)) {
        skipped++;
        continue;
      }
      if (!existsSync(src)) {
        failed++;
        console.log(`  FAIL  ${prop.slug}/${destName}: source not found: ${src}`);
        continue;
      }

      try {
        const out = await sharp(src)
          .resize(1600, undefined, { withoutEnlargement: true })
          .webp({ quality: 95 })
          .toBuffer();
        writeFileSync(dest, out);
        converted++;
        console.log(
          `  saved  ${prop.slug}/${destName}  ${(out.length / 1024).toFixed(0)}KB`,
        );
      } catch (e) {
        failed++;
        console.log(`  FAIL  ${prop.slug}/${destName}  ${(e as Error).message}`);
      }
    }
  }

  console.log(`\n${converted} converted, ${skipped} already present, ${failed} failed.`);
}

main();
