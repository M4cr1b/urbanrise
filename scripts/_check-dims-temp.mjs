import sharp from "sharp";
import { readdirSync } from "fs";
import path from "path";

const root = "C:/Users/Admin/Desktop/urbanrise/public/properties";

const oldProps = [
  "east-legon-hills-duplex-stardom",
  "adjiringanor-duplex-stardom",
  "adjiringanor-villa-encore",
  "cantonments-mansion-stardom",
  "cantonments-villa-charclem",
  "adjiringanor-mansion-stardom",
  "east-legon-hills-townhouse-charclem",
  "east-legon-west-trasacco-villa-charclem",
  "east-legon-hills-villa-mrfred",
  "adjiringanor-duplex-hometrust",
];

const newProps = [
  "east-legon-hills-mansion-aceholding",
  "adjiriganor-apartment-savehands",
  "achimota-tantra-hills-duplex-hometrust",
  "achimota-mansion-greenyard",
  "achimota-kingsby-villa-justice",
  "achimota-duplex-unitedhomes",
  "achimota-tantra-hills-duplex-hometrust-ii",
  "achimota-villa-seekers",
];

async function dumpDims(label, props) {
  console.log(`\n=== ${label} (first image only) ===`);
  for (const p of props) {
    const dir = path.join(root, p);
    try {
      const files = readdirSync(dir).filter(f => f.endsWith(".webp")).sort();
      if (files.length === 0) { console.log(`${p}: NO FILES`); continue; }
      const first = files[0];
      const meta = await sharp(path.join(dir, first)).metadata();
      console.log(`${p}/${first}: ${meta.width}x${meta.height} (${(meta.size/1024).toFixed(0)}KB)`);
    } catch (e) {
      console.log(`${p}: ERROR ${e.message}`);
    }
  }
}

await dumpDims("OLD PROPERTIES 1-10", oldProps);
await dumpDims("NEW PROPERTIES 11-18", newProps);
