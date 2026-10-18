#!/usr/bin/env node
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Map source folders → {slug, thumbnail_filename}
// All files are re-ordered so the thumbnail lands at 01.webp, rest follow alphabetically.
const props = {
  27: { slug: 'achimota-tantra-hills-bungalow-unitedhomes', thumbnail: '59152280_ODc3LTExNzEtZDI1YWM4ZjI0OA.webp' },
  28: { slug: 'achimota-villa-unitedhomes', thumbnail: '25999926_MTAyNC03NjgtZDNiNDk1MWExNC0x.webp' },
  29: { slug: 'achimota-bungalow-hometrust', thumbnail: '59031721_ODEwLTEwODAtNmJlNGY4Mzg4MS0x.webp' },
  30: { slug: 'achimota-acp-duplex-kingscity', thumbnail: '19948737_OTYwLTEyODAtMDM4YjVkNzcxYS0x.webp' },
  31: { slug: 'achimota-tantra-hills-mansion-kingscity', thumbnail: '38139451_OTYwLTEyODAtYTc1NWQ3MzFiZS0x.webp' },
  32: { slug: 'achimota-tantra-hills-duplex-rokoson', thumbnail: '31884924_OTAwLTkwMC1kZGUyMDFmYTE3.webp' },
  33: { slug: 'achimota-kingsby-duplex-hometrust', thumbnail: '59672989_NzIwLTEyODAtOTEyZDgzNTAyMg.webp' },
  34: { slug: 'achimota-golf-hills-duplex-haskaybright', thumbnail: '48801416_Nzk4LTEwODUtODY5MzM1NDFkNw.webp' },
  35: { slug: 'achimota-tantra-hills-villa-appiah', thumbnail: '61371846_OTYwLTEyODAtZThjZTIxZWQ4ZA.webp' },
  36: { slug: 'achimota-mile7-townhouse-kingscity', thumbnail: '50259286_MTIwNS0xNjAwLWNjNmEzM2RhZWYtMQ.webp' },
};

const srcRoot = 'C:/Users/Admin/Desktop/Round two';
const destRoot = 'C:/Users/Admin/Desktop/urbanrise/public/properties';

// This similarly named file is a different photograph (kitchen, not exterior).
// Append it as 09.webp so the existing 01–08 URLs retain their original images.
const appendLastFiles = {
  32: ['31884851_MTUwMC04NDMtZDlhZmQ5N2NiMA (1).webp'],
};

for (const [num, { slug, thumbnail }] of Object.entries(props)) {
  const srcDir = join(srcRoot, `PROPERTY ${num} IMAGES`);
  const destDir = join(destRoot, slug);

  if (!existsSync(srcDir)) {
    console.error(`Source folder not found: ${srcDir}`);
    process.exit(1);
  }

  mkdirSync(destDir, { recursive: true });

  // Include every source photograph, preserving the established URL mapping.
  let files = readdirSync(srcDir)
    .filter(f => f.endsWith('.webp'));

  // Sort alphabetically
  files.sort();

  // Move thumbnail to front if it's not already first
  if (files[0] !== thumbnail) {
    files = files.filter(f => f !== thumbnail);
    files.unshift(thumbnail);
  }

  for (const filename of appendLastFiles[num] ?? []) {
    if (!files.includes(filename)) {
      throw new Error(`Required source photograph not found: ${join(srcDir, filename)}`);
    }
    files = files.filter(f => f !== filename);
    files.push(filename);
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

console.log('\nAll properties 27–36 copied successfully.');
