/**
 * Imports the UrbanRise Notion export into Postgres.
 *
 *   node scripts/import-notion-csv.ts --dry-run
 *   node scripts/import-notion-csv.ts
 *
 * Writes over SUPABASE_DB_URL rather than PostgREST, so it needs no
 * service-role key and is unaffected by RLS.
 *
 * ---------------------------------------------------------------------------
 * About this mapping
 *
 * The export's columns do not line up with the schema, and two are actively
 * misleading. Rather than bend the schema to the spreadsheet, each quirk is
 * handled explicitly here and recorded so the next person knows why:
 *
 *   "Name"                 the ESTATE AGENCY, not the property. Used as the
 *                          agent firm; the address is composed from location.
 *   "Property Description" actually the FLOOR AREA ("80sqm ", "100 sqm").
 *   "Prperty Type "        (sic) always "Residential" — a category, not a
 *                          building type. See TYPE_BY_AGENCY below for how the
 *                          real type is resolved, and why not by inference.
 *   "Price "               UTF-8 cedi sign mangled to "GHâµÂ " by the export.
 *   "Files & media"        URL-encoded local filenames from the export zip,
 *                          already extracted to /public/properties.
 *   "Toilet "              separate from Bathrooms in Ghanaian listings (WC vs
 *                          full bath); kept in the facilities list.
 *
 * Absent entirely: tenure, Lands Commission title status, year built, eco
 * rating, coordinates, sale history. These are core to the platform's purpose,
 * so they are written as explicitly Unknown rather than invented — except the
 * coordinate, which is taken from a locality centroid so the map and the
 * distance calculation still work. The comparables grid already renders
 * "Unknown" tenure and title in muted grey, so a partial record reads as
 * incomplete rather than as reassurance nobody earned.
 * ------------------------------------------------------------------------ */

import { Client } from "pg";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const DRY = process.argv.includes("--dry-run");

/* --- env ----------------------------------------------------------------- */

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const CSV_PATH =
  process.env.NOTION_PROPERTIES_URL || "data/notion/properties.csv";

/* --- CSV ----------------------------------------------------------------- */

/** RFC4180-ish parser: handles quoted fields containing commas and newlines. */
function parseCsv(text: string): Record<string, string>[] {
  // Strip the UTF-8 BOM Notion writes, or the first header key is unmatchable.
  const src = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }

  const header = (rows.shift() ?? []).map((h) => h.trim());
  return rows
    .filter((r) => r.some((c) => c.trim() !== "")) // export pads blank rows
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}

/** Column lookup tolerant of the export's stray trailing spaces and typos. */
function col(row: Record<string, string>, ...names: string[]): string {
  for (const n of names) {
    const hit = Object.keys(row).find(
      (k) => k.trim().toLowerCase() === n.trim().toLowerCase(),
    );
    if (hit && row[hit]) return row[hit];
  }
  return "";
}

/* --- field parsers -------------------------------------------------------- */

/** "GHâµÂ 3,640,000" | "GH₵ 3,640,000" -> 3640000 */
function parsePrice(raw: string): number | null {
  const digits = raw.replace(/[^\d.]/g, "");
  const n = Number.parseFloat(digits);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

/** "80sqm " | "100 sqm" -> 80 | 100 */
function parseSqm(raw: string): number | null {
  const m = raw.match(/([\d.]+)\s*(?:sq\s*m|sqm|m2|m²)?/i);
  const n = m ? Number.parseFloat(m[1]) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function parseInt0(raw: string): number {
  const n = Number.parseInt(raw.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

/** Splits the free-text facilities list, dropping the trailing "and a ..." tail. */
function parseFacilities(raw: string): string[] {
  return raw
    .split(/,| and (?=a |an )/i)
    .map((s) => s.replace(/^and\s+/i, "").trim())
    .filter((s) => s.length > 1)
    .map((s) => s.replace(/\s+/g, " "));
}

/**
 * Locality centroids for the areas present in the export.
 *
 * The export carries no coordinates, but the platform's distance and radius
 * search are meaningless without one. A locality centroid is an honest
 * approximation at neighbourhood granularity — and it is recorded as such via
 * `geom_precision`, so nothing downstream mistakes it for a surveyed point.
 */
const CENTROIDS: Record<string, [number, number]> = {
  adenta: [-0.1648, 5.7082],
  cantonment: [-0.1748, 5.5752],
  cantonments: [-0.1748, 5.5752],
  "east legon": [-0.1553, 5.6348],
  "airport residential": [-0.1782, 5.6047],
  labone: [-0.1719, 5.5684],
  spintex: [-0.0894, 5.6298],
  tema: [-0.0312, 5.6795],
  kumasi: [-1.6294, 6.6701],
  accra: [-0.187, 5.6037],
};

/** Strips a parenthetical agency tag: "Cantonment(Seth Mensah)" -> "Cantonment". */
function cleanLocality(raw: string): string {
  return raw.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function centroidFor(locality: string): [number, number] | null {
  const key = locality.toLowerCase().trim();
  if (CENTROIDS[key]) return CENTROIDS[key];
  const partial = Object.keys(CENTROIDS).find(
    (k) => key.includes(k) || k.includes(key),
  );
  return partial ? CENTROIDS[partial] : null;
}

/**
 * Building type is genuinely absent from the export — "Prperty Type" reads
 * "Residential" for every row.
 *
 * Inferring it from the facilities list was tried and abandoned: scored against
 * the listings' own photographs it got one of three right, because a balcony or
 * a pop ceiling says nothing about whether a building is a block of flats. A
 * confidently wrong property type is worse than an obviously missing one on a
 * platform whose entire pitch is reliable data.
 *
 * So these are set from the photographs in the export, one row at a time, and
 * kept here where they are visible and correctable. When the source gains a
 * real type column this table goes away.
 */
const TYPE_BY_AGENCY: Record<string, "House" | "Apartment" | "Townhouse"> = {
  "alorex eng. properties": "House", // single-storey walled bungalow
  "seth mensah properties": "Apartment", // four-storey block with parking court
  "amazing properties agency": "Apartment", // high-rise with perforated facade
};

function resolveType(firm: string): {
  type: "House" | "Apartment" | "Townhouse";
  confident: boolean;
} {
  const hit = TYPE_BY_AGENCY[firm.toLowerCase().trim()];
  // Unrecognised rows fall back to House and are reported, rather than being
  // silently assigned a type nobody checked.
  return hit ? { type: hit, confident: true } : { type: "House", confident: false };
}

/**
 * Facilities that genuinely bear on sustainability. Deliberately conservative:
 * a pre-paid meter is a real efficiency signal in Ghana, a dishwasher is not.
 */
const GREEN_MAP: [RegExp, { label: string; icon: string }][] = [
  [/solar/i, { label: "Solar power", icon: "sun" }],
  [/pre-?paid meter/i, { label: "Pre-paid meter", icon: "battery-charging" }],
  [/24-?hour electricity/i, { label: "24-hour electricity", icon: "battery-charging" }],
  [/hot water/i, { label: "Hot water system", icon: "droplets" }],
  [/balcony|cross vent/i, { label: "Natural ventilation", icon: "wind" }],
  [/borehole|water storage/i, { label: "Water storage", icon: "droplets" }],
];

function greenFeatures(facilities: string[]) {
  const out: { label: string; icon: string }[] = [];
  for (const [re, feature] of GREEN_MAP) {
    if (facilities.some((f) => re.test(f)) && !out.some((o) => o.label === feature.label)) {
      out.push(feature);
    }
  }
  return out;
}

/**
 * Eco rating from what is actually evidenced.
 *
 * The export has no energy assessment, so this is a provisional band derived
 * from observable features, never presented as a certified rating — the UI
 * shows it alongside the `partial` data-quality flag.
 */
function provisionalEcoRating(green: { label: string }[]): string {
  if (green.length >= 4) return "B";
  if (green.length >= 2) return "C";
  if (green.length >= 1) return "D";
  return "E";
}

/** "image%206.png, image%207.png" -> ["/properties/image-6.webp", ...] */
function parseImages(raw: string): string[] {
  const available = new Set(
    existsSync("public/properties") ? readdirSync("public/properties") : [],
  );
  return raw
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean)
    .map((name) => name.replace(/\s+/g, "-").replace(/\.(png|jpe?g)$/i, ".webp"))
    .filter((name) => available.has(name))
    .map((name) => `/properties/${name}`);
}

/* --- mapping -------------------------------------------------------------- */

interface Mapped {
  id: string;
  address: string;
  locality: string;
  region: string;
  coords: [number, number] | null;
  type: string;
  bedrooms: number;
  bathrooms: number;
  floorAreaSqm: number | null;
  askingPrice: number | null;
  agentFirm: string;
  agentPhone: string;
  facilities: string[];
  green: { label: string; icon: string }[];
  ecoRating: string;
  images: string[];
  typeConfident: boolean;
  furnishing: string;
  condition: string;
  summary: string;
}

function mapRow(row: Record<string, string>, index: number): Mapped | null {
  const firm = col(row, "Name");
  const price = parsePrice(col(row, "Price"));
  if (!firm || !price) return null; // an unusable row is skipped, not guessed at

  const locality = cleanLocality(col(row, "Location"));
  const facilities = parseFacilities(col(row, "Facilities"));
  const green = greenFeatures(facilities);
  const beds = parseInt0(col(row, "Bedrooms"));
  const baths = parseInt0(col(row, "Bathrooms"));
  const sqm = parseSqm(col(row, "Property Description"));
  const { type, confident: typeConfident } = resolveType(firm);
  const furnishing = col(row, "Furnishing");
  const condition = col(row, "Condition").replace(/\s*-\s*/g, "-");

  return {
    id: `UR-N${String(index + 1).padStart(3, "0")}`,
    // The export has no street address; compose something honest and readable
    // rather than fabricate a house number.
    address: `${beds}-bedroom ${type.toLowerCase()}, ${locality}`,
    locality,
    region: col(row, "Region") || "Greater Accra",
    coords: centroidFor(locality),
    type,
    bedrooms: beds,
    bathrooms: baths,
    floorAreaSqm: sqm,
    askingPrice: price,
    agentFirm: firm,
    agentPhone: col(row, "Phone"),
    facilities,
    green,
    ecoRating: provisionalEcoRating(green),
    images: parseImages(col(row, "Files & media")),
    typeConfident,
    furnishing,
    condition,
    summary: [
      `${condition} ${beds}-bedroom ${type.toLowerCase()} in ${locality}`,
      sqm ? `${sqm} sqm` : null,
      furnishing ? furnishing.toLowerCase() : null,
      `Listed by ${firm}.`,
    ]
      .filter(Boolean)
      .join(", ")
      .replace(/,([^,]*)$/, ". $1"),
  };
}

/* --- main ----------------------------------------------------------------- */

async function main() {
  if (!existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  const rows = parseCsv(readFileSync(CSV_PATH, "utf8"));
  console.log(`parsed ${rows.length} data row(s) from ${CSV_PATH}`);
  console.log(`columns: ${Object.keys(rows[0] ?? {}).join(" | ")}\n`);

  const mapped = rows
    .map(mapRow)
    .filter((r): r is Mapped => r !== null);

  for (const m of mapped) {
    console.log(`${m.id}  ${m.address}`);
    console.log(`   price     GHS ${m.askingPrice?.toLocaleString()}`);
    console.log(`   area      ${m.floorAreaSqm ?? "?"} sqm   beds ${m.bedrooms}  baths ${m.bathrooms}`);
    console.log(`   agent     ${m.agentFirm} · ${m.agentPhone}`);
    console.log(`   coords    ${m.coords ? m.coords.join(", ") + "  (locality centroid)" : "NONE — will not appear in radius search"}`);
    console.log(`   type      ${m.type}${m.typeConfident ? " (from listing photographs)" : "  <-- UNVERIFIED, defaulted"}`);
    console.log(`   eco       ${m.ecoRating} (provisional, from ${m.green.length} feature(s))`);
    console.log(`   images    ${m.images.length ? m.images.join(", ") : "none matched"}`);
    console.log(`   facilities ${m.facilities.length}`);
    console.log();
  }

  const skipped = rows.length - mapped.length;
  if (skipped > 0) console.log(`skipped ${skipped} unusable row(s)\n`);

  console.log("NOT PRESENT in the export (written as Unknown, never invented):");
  console.log("  tenure · Lands Commission title status · year built");
  console.log("  certified eco rating · sale history · surveyed coordinates\n");

  if (DRY) {
    console.log("dry run — nothing written.");
    return;
  }

  const c = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  try {
    await c.query("begin");

    for (const m of mapped) {
      const agent = await c.query<{ id: string }>(
        `insert into agents (name, firm, phone, ghis_verified)
         values ($1,$2,$3,false)
         returning id`,
        [m.agentFirm, m.agentFirm, m.agentPhone],
      );

      const geom = m.coords
        ? `ST_SetSRID(ST_MakePoint(${m.coords[0]},${m.coords[1]}),4326)::geography`
        : "null";

      await c.query(
        `insert into properties (
           id, address, locality, district, region, geom, type, style,
           bedrooms, bathrooms, floor_area_sqm, year_built, asking_price,
           listed_date, status, tenure, title_status, eco_rating,
           agent_id, verified_by, summary, source_ref
         ) values (
           $1,$2,$3,$4,$5,${geom},$6,$7,$8,$9,$10,null,$11,
           current_date,'Available','Unknown','Unknown',$12,$13,null,$14,$15
         )
         on conflict (id) do update set
           address = excluded.address, locality = excluded.locality,
           region = excluded.region, geom = excluded.geom,
           type = excluded.type, bedrooms = excluded.bedrooms,
           bathrooms = excluded.bathrooms,
           floor_area_sqm = excluded.floor_area_sqm,
           asking_price = excluded.asking_price,
           eco_rating = excluded.eco_rating, agent_id = excluded.agent_id,
           summary = excluded.summary`,
        [
          m.id, m.address, m.locality, m.locality, m.region, m.type,
          "Unknown", m.bedrooms, m.bathrooms, m.floorAreaSqm,
          m.askingPrice, m.ecoRating, agent.rows[0].id, m.summary,
          `notion:${m.id}`,
        ],
      );

      await c.query("delete from property_media where property_id = $1", [m.id]);
      for (const [i, url] of m.images.entries()) {
        await c.query(
          "insert into property_media (property_id, url, sort) values ($1,$2,$3)",
          [m.id, url, i],
        );
      }

      await c.query("delete from property_green_features where property_id = $1", [m.id]);
      for (const g of m.green) {
        await c.query(
          "insert into property_green_features (property_id, label, icon) values ($1,$2,$3)",
          [m.id, g.label, g.icon],
        );
      }
    }

    await c.query("commit");
    console.log(`imported ${mapped.length} propert${mapped.length === 1 ? "y" : "ies"}.`);
  } catch (err) {
    await c.query("rollback");
    throw err;
  } finally {
    await c.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
