/**
 * One-off import of real, professionally photographed listings.
 *
 *   node scripts/import-real-properties.ts
 *
 * Converts each source PNG into a local WebP under public/properties/<slug>/,
 * matching the site's local-only image policy (see next.config.ts) and the
 * resize/quality precedent already set by scripts/localise-images.ts for
 * listing photography. Idempotent: an existing output file is left alone.
 */

import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE_DIR = "C:/Users/Admin/Pictures/urban-rise-properties/images";
const SLUGS = ["michelle-camp-gbetsile", "east-legon-hills", "fairhaven-east-legon"];

async function main() {
  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const slug of SLUGS) {
    const srcDir = resolve(SOURCE_DIR, slug);
    const outDir = resolve(process.cwd(), "public/properties", slug);
    mkdirSync(outDir, { recursive: true });

    if (!existsSync(srcDir)) {
      console.log(`  FAIL  ${slug}: source folder not found at ${srcDir}`);
      failed++;
      continue;
    }

    const files = readdirSync(srcDir).filter((f) => /\.png$/i.test(f));

    for (const file of files) {
      const dest = resolve(outDir, file.replace(/\.png$/i, ".webp"));
      if (existsSync(dest)) {
        skipped++;
        continue;
      }

      try {
        const out = await sharp(resolve(srcDir, file))
          .resize(1600, undefined, { withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();
        writeFileSync(dest, out);
        converted++;
        console.log(
          `  saved  ${slug}/${file.replace(/\.png$/i, ".webp")}  ${(out.length / 1024).toFixed(0)}KB`,
        );
      } catch (e) {
        failed++;
        console.log(`  FAIL  ${slug}/${file}  ${(e as Error).message}`);
      }
    }
  }

  console.log(`\n${converted} converted, ${skipped} already present, ${failed} failed.`);
}

main();
