#!/usr/bin/env node
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Map source folders → {slug, thumbnail_filename}
// All files are re-ordered so the thumbnail lands at 01.webp, rest follow alphabetically.
const props = {
  19: { slug: 'achimota-tantra-hills-villa-vpproperty', thumbnail: '59495208_ODEwLTEwODAtOWIxZTk1ZTgyMw.webp' },
  20: { slug: 'achimota-villa-nartey', thumbnail: '55917816_MTIxNy0xNjAwLThlNzE1YWMyZGM.webp' },
  21: { slug: 'achimota-kingsby-apartment-roger', thumbnail: '59055430_ODA5LTEwODAtYjMxOWU5Zjk5Mg.webp' },
  22: { slug: 'achimota-duplex-enbtrust', thumbnail: '58656221_MTI4MC05NjAtOGRlMWNmYTZiYQ.webp' },
  23: { slug: 'achimota-tantra-hills-duplex-hometrust-iii', thumbnail: '60137400_OTYwLTEyODAtZDFhODU3MDE2NQ.webp' },
  24: { slug: 'achimota-duplex-edwin', thumbnail: '52914499_MTYwMC0xMjAwLTQ4OGYxNjkxNTQ.webp' },
  25: { slug: 'achimota-tantra-hills-villa-walako', thumbnail: '61953651_NzIwLTEyODAtYjk1ZGM3Y2QwZA.webp' },
  26: { slug: 'achimota-tantra-hills-villa-eagleeye', thumbnail: '38872387_MTA4MC0xMzUwLTIwNmQyYjRlYzc.webp' },
};

const srcRoot = 'C:/Users/Admin/Desktop/Round two';
const destRoot = 'C:/Users/Admin/Desktop/urbanrise/public/properties';

// Property 21 has a duplicate file (1) — exclude it
const excludeFiles = {
  21: ['59055442_NzQ2LTEwMDgtZTI2M2E0NTFiOA (1).webp'],
};

for (const [num, { slug, thumbnail }] of Object.entries(props)) {
  const srcDir = join(srcRoot, `PROPERTY ${num} IMAGES`);
  const destDir = join(destRoot, slug);

  if (!existsSync(srcDir)) {
    console.error(`Source folder not found: ${srcDir}`);
    process.exit(1);
  }

  mkdirSync(destDir, { recursive: true });

  // Read all .webp files, exclude property 21's duplicate
  let files = readdirSync(srcDir)
    .filter(f => f.endsWith('.webp'));

  if (excludeFiles[num]) {
    files = files.filter(f => !excludeFiles[num].includes(f));
  }

  // Sort alphabetically
  files.sort();

  // Move thumbnail to front if it's not already first
  if (files[0] !== thumbnail) {
    files = files.filter(f => f !== thumbnail);
    files.unshift(thumbnail);
  }

  // Copy files, renumbered 01.webp, 02.webp, …
  files.forEach((srcFile, idx) => {
    const pad = String(idx + 1).padStart(2, '0');
    const srcPath = join(srcDir, srcFile);
    const destPath = join(destDir, `${pad}.webp`);
    copyFileSync(srcPath, destPath);
  });

  console.log(`Property ${num} (${slug}): ${files.length} images copied`);
}

console.log('\nAll properties 19–26 copied successfully.');
