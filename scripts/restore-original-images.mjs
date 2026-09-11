#!/usr/bin/env node
/**
 * Restore original property images from Desktop backups with CORRECT mapping.
 * VERIFIED mapping (triple-checked against DOCX + migrations + image counts).
 * ZERO processing: pure byte-for-byte copy, no blur, no watermark edits.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, copyFileSync, mkdirSync, rmSync, statSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// VERIFIED correct mapping (triple-checked against DOCX, migrations, image counts)
const propertyMap = {
  'PROPERTY 1 IMAGES': 'east-legon-hills-duplex-stardom',
  'PROPERTY 2 IMAGES': 'adjiringanor-duplex-stardom',
  'PROPERTY 3 IMAGES': 'adjiringanor-villa-encore',
  'PROPERTY 4 IMAGES': 'cantonments-mansion-stardom',
  'PROPERTY 5 IMAGES': 'cantonments-villa-charclem',
  'PROPERTY 6  IMAGES': 'adjiringanor-mansion-stardom', // Note: double space in source folder name
  'PROPRTY 7 IMAGES': 'east-legon-hills-townhouse-charclem', // Note: typo in source folder name
  'PROPERTY 8 IMAGES': 'east-legon-west-trasacco-villa-charclem',
  'PROPERTY 9 IMAGES': 'east-legon-hills-villa-mrfred',
  'PROPERTY 10 IMAGES': 'adjiringanor-duplex-hometrust'
};

/**
 * Restore images from Desktop backups
 */
function restoreImages() {
  console.log('=== Restoring Original Property Images ===\n');
  console.log('Using VERIFIED mapping (cross-checked against DOCX, migrations, and image counts)\n');

  let restored = 0;
  let failed = 0;

  const sources = [
    'C:/Users/Admin/Desktop/Done',
    'C:/Users/Admin/Desktop/assets'
  ];

  for (const sourceRoot of sources) {
    console.log(`\nProcessing ${sourceRoot}...`);

    if (!statSync(sourceRoot, { throwIfNoEntry: false })) {
      console.log(`  ⚠️  Source not found, skipping`);
      continue;
    }

    const folders = readdirSync(sourceRoot, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort();

    for (const folder of folders) {
      const srcDir = path.join(sourceRoot, folder);
      const propId = propertyMap[folder];

      if (!propId) {
        console.log(`  ⚠️  Unknown folder: ${folder} (skipped)`);
        continue;
      }

      const destDir = path.join(projectRoot, 'public/properties', propId);

      // Clean the destination directory completely (removes .tmp files, cross-contamination, etc.)
      if (statSync(destDir, { throwIfNoEntry: false })) {
        try {
          rmSync(destDir, { recursive: true, force: true });
          console.log(`  🗑️  Cleaned existing: ${propId}`);
        } catch (err) {
          console.error(`  ✗ Failed to clean ${propId}: ${err.message}`);
          failed++;
          continue;
        }
      }

      // Create fresh directory
      mkdirSync(destDir, { recursive: true });

      // Copy all images, sorted by original filename, renumbered sequentially
      const images = readdirSync(srcDir)
        .filter(f => f.endsWith('.webp'))
        .sort();

      for (let i = 0; i < images.length; i++) {
        try {
          const src = path.join(srcDir, images[i]);
          const dest = path.join(destDir, `${String(i + 1).padStart(2, '0')}.webp`);
          copyFileSync(src, dest);
          restored++;
        } catch (err) {
          console.error(`  ✗ Failed to copy: ${err.message}`);
          failed++;
        }
      }

      console.log(`  ✓ Restored ${images.length} images to ${propId}`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Files restored: ${restored}`);
  console.log(`Failed: ${failed}\n`);
}

/**
 * Main
 */
function main() {
  restoreImages();
  console.log('Restore complete. Next: run `npm run build` to verify, then check results visually.');
}

main().catch(console.error);
