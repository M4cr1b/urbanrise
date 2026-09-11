#!/usr/bin/env node
/**
 * Copy property images 11–18 from Desktop Round two folder to public/properties/.
 * Byte-for-byte copy only (copyFileSync), no image processing, no watermark edits.
 * Follows the same pattern as restore-original-images.mjs but for new properties.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, copyFileSync, mkdirSync, statSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// New properties 11–18 mapping (verified slug names to avoid collisions)
// CORRECTED: PROPERTY 11 and 12 source folders were swapped in Desktop layout
const propertyMap = {
  'PROPERTY 11 IMAGES': 'adjiriganor-apartment-savehands',  // Swapped: was 11→11, now 11→12
  'PROPERTY 12 IMAGES': 'east-legon-hills-mansion-aceholding',  // Swapped: was 12→12, now 12→11
  'PROPERTY 13 IMAGES': 'achimota-tantra-hills-duplex-hometrust',
  'PROPERTY 14 IMAGES': 'achimota-mansion-greenyard',
  'PROPERTY 15 IMAGES': 'achimota-kingsby-villa-justice',
  'PROPERTY 16 IMAGES': 'achimota-duplex-unitedhomes',
  'PROPERTY 17 IMAGES': 'achimota-tantra-hills-duplex-hometrust-ii',
  'PROPERTY 18 IMAGES': 'achimota-villa-seekers',
};

const sourceRoot = 'C:/Users/Admin/Desktop/Round two';

function copyProperties() {
  console.log('=== Copying Property Images 11–18 ===\n');
  console.log(`Source: ${sourceRoot}\n`);

  let copied = 0;
  let failed = 0;

  if (!statSync(sourceRoot, { throwIfNoEntry: false })) {
    console.error(`✗ Source root not found: ${sourceRoot}`);
    process.exit(1);
  }

  for (const [srcFolder, propSlug] of Object.entries(propertyMap)) {
    const srcDir = path.join(sourceRoot, srcFolder);
    const destDir = path.join(projectRoot, 'public/properties', propSlug);

    if (!statSync(srcDir, { throwIfNoEntry: false })) {
      console.error(`✗ Source folder not found: ${srcDir}`);
      failed++;
      continue;
    }

    // Create destination directory (don't clean, assume it doesn't exist yet)
    mkdirSync(destDir, { recursive: true });

    // Copy all .webp files, sorted by filename, renumbered sequentially
    const images = readdirSync(srcDir)
      .filter(f => f.endsWith('.webp'))
      .sort();

    for (let i = 0; i < images.length; i++) {
      try {
        const src = path.join(srcDir, images[i]);
        const dest = path.join(destDir, `${String(i + 1).padStart(2, '0')}.webp`);
        copyFileSync(src, dest);
        copied++;
      } catch (err) {
        console.error(`✗ Failed to copy: ${err.message}`);
        failed++;
      }
    }

    console.log(`✓ Copied ${images.length} images to ${propSlug}`);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Files copied: ${copied}`);
  console.log(`Failed: ${failed}\n`);

  if (failed === 0) {
    console.log('✓ All images copied successfully. Next: run the migration.');
  }
}

copyProperties();
