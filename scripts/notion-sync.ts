/**
 * Notion → Supabase ingestion.
 *
 * Reads the shared Notion databases, normalises each row into the schema in
 * `supabase/migrations/0001_init.sql`, and upserts. Idempotent: every table
 * carries a `source_ref` unique key derived from the Notion page id, so a
 * re-run updates rather than duplicating.
 *
 *   npx tsx scripts/notion-sync.ts            # sync everything
 *   npx tsx scripts/notion-sync.ts properties # one dataset
 *   npx tsx scripts/notion-sync.ts --dry-run  # parse and report, write nothing
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   NOTION_TOKEN            (preferred — reads the Notion API directly), or
 *   NOTION_*_URL            (public share links, parsed as CSV/HTML export)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/* --- Environment -------------------------------------------------------- */

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const [, key, raw] = match;
    if (!process.env[key]) {
      process.env[key] = raw.replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DRY_RUN = process.argv.includes("--dry-run");

const only = process.argv.find((a) =>
  ["properties", "professionals", "materials"].includes(a),
);

/* --- Notion readers ------------------------------------------------------ */

type Row = Record<string, string>;

/** Reads a Notion database through the official API. */
async function readNotionDatabase(databaseId: string): Promise<Row[]> {
  const rows: Row[] = [];
  let cursor: string | undefined;

  do {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cursor ? { start_cursor: cursor } : {}),
      },
    );

    if (!res.ok) {
      throw new Error(
        `Notion API ${res.status} for database ${databaseId}: ${await res.text()}`,
      );
    }

    const json = (await res.json()) as {
      results: { id: string; properties: Record<string, unknown> }[];
      next_cursor: string | null;
      has_more: boolean;
    };

    for (const page of json.results) {
      const row: Row = { __id: page.id };
      for (const [key, prop] of Object.entries(page.properties)) {
        row[key] = flattenNotionProperty(prop);
      }
      rows.push(row);
    }

    cursor = json.has_more ? (json.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return rows;
}

/**
 * Notion property values are a wide discriminated union; this reads the handful
 * of shapes the sync cares about without pulling in the SDK's type surface.
 */
interface NotionProperty {
  type?: string;
  title?: { plain_text?: string }[];
  rich_text?: { plain_text?: string }[];
  number?: number | null;
  select?: { name?: string } | null;
  multi_select?: { name?: string }[];
  date?: { start?: string } | null;
  checkbox?: boolean;
  url?: string | null;
  email?: string | null;
  phone_number?: string | null;
  files?: { file?: { url?: string }; external?: { url?: string } }[];
  formula?: { string?: string; number?: number } | null;
  rollup?: { number?: number } | null;
}

/** Collapses any Notion property value to a plain string. */
function flattenNotionProperty(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as NotionProperty;

  switch (p.type) {
    case "title":
      return (p.title ?? []).map((t) => t.plain_text ?? "").join("");
    case "rich_text":
      return (p.rich_text ?? []).map((t) => t.plain_text ?? "").join("");
    case "number":
      return p.number == null ? "" : String(p.number);
    case "select":
      return p.select?.name ?? "";
    case "multi_select":
      return (p.multi_select ?? []).map((s) => s.name ?? "").join(", ");
    case "date":
      return p.date?.start ?? "";
    case "checkbox":
      return p.checkbox ? "true" : "false";
    case "url":
      return p.url ?? "";
    case "email":
      return p.email ?? "";
    case "phone_number":
      return p.phone_number ?? "";
    case "files":
      return (p.files ?? [])
        .map((f) => f.file?.url ?? f.external?.url ?? "")
        .filter(Boolean)
        .join(", ");
    case "formula":
      return String(p.formula?.string ?? p.formula?.number ?? "");
    case "rollup":
      return String(p.rollup?.number ?? "");
    default:
      return "";
  }
}

/** Parses a CSV export, handling quoted fields and embedded commas. */
function parseCsv(text: string): Row[] {
  const rows: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      record.push(field);
      field = "";
    } else if (ch === "\n") {
      record.push(field);
      rows.push(record);
      record = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field || record.length) {
    record.push(field);
    rows.push(record);
  }

  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  if (!header) return [];

  return body.map((cells) => {
    const row: Row = {};
    header.forEach((h, i) => {
      row[h.trim()] = (cells[i] ?? "").trim();
    });
    return row;
  });
}

/* --- Field helpers ------------------------------------------------------- */

/** Reads the first present key, so column renames in Notion do not break the sync. */
function pick(row: Row, ...keys: string[]): string {
  for (const k of keys) {
    const found = Object.keys(row).find(
      (rk) => rk.toLowerCase().replace(/\s+/g, "") === k.toLowerCase().replace(/\s+/g, ""),
    );
    if (found && row[found]?.trim()) return row[found].trim();
  }
  return "";
}

const num = (v: string): number | null => {
  const n = Number(v.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) && v.trim() !== "" ? n : null;
};

const bool = (v: string): boolean => /^(true|yes|y|1)$/i.test(v.trim());

const list = (v: string): string[] =>
  v.split(/[,;]/).map((s) => s.trim()).filter(Boolean);

/**
 * Stable identity for a row.
 *
 * The Notion API gives every page an id; a CSV export does not. Falling back to
 * a slug of the row's natural key keeps the upsert idempotent either way —
 * without it, a CSV re-run would insert duplicates on every pass because
 * `on conflict (source_ref)` never matches a null.
 */
function sourceRef(row: Row, ...naturalKey: string[]): string {
  const notionId = pick(row, "__id");
  if (notionId) return notionId;
  const slug = naturalKey
    .filter(Boolean)
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9|\-]/g, "");
  return `csv:${slug}`;
}

/** Maps loose Notion text onto the CHECK-constrained vocabularies. */
function normaliseTenure(v: string): string {
  const s = v.toLowerCase();
  if (s.includes("free")) return "Freehold";
  if (s.includes("custom")) return "Customary";
  if (s.includes("50")) return "Leasehold 50yr";
  if (s.includes("lease") || s.includes("99")) return "Leasehold 99yr";
  return "Unknown";
}

function normaliseTitle(v: string): string {
  const s = v.toLowerCase();
  if (s.includes("unregist")) return "Unregistered";
  if (s.includes("regist")) return "Registered";
  if (s.includes("pend") || s.includes("process")) return "Pending";
  return "Unknown";
}

function normaliseStatus(v: string): string {
  const s = v.toLowerCase();
  if (s.includes("sold") || s.includes("complete")) return "Sold";
  if (s.includes("offer") || s.includes("stc")) return "Under Offer";
  return "Available";
}

function normaliseType(v: string): string {
  const s = v.toLowerCase();
  if (s.includes("apart") || s.includes("flat")) return "Apartment";
  if (s.includes("town")) return "Townhouse";
  if (s.includes("compound")) return "Compound House";
  if (s.includes("land") || s.includes("plot")) return "Land";
  return "House";
}

function normaliseEco(v: string): string | null {
  const m = /^[A-G]/i.exec(v.trim());
  return m ? m[0].toUpperCase() : null;
}

/* --- Mappers ------------------------------------------------------------- */

/**
 * "image%201.png, image%202.png" -> ["/properties/image-1.webp", ...]
 *
 * Notion's CSV export gives a Files & media column as plain filenames, not
 * URLs, so the only way to resolve an image is to match it against what has
 * already been extracted into `public/properties/`. Anything that doesn't
 * match is dropped loudly (not silently) so a stale or renamed export is
 * visible in the sync output instead of quietly producing an empty gallery.
 */
function resolvePropertyImages(raw: string, propertyLabel: string): string[] {
  const available = new Set(
    existsSync("public/properties") ? readdirSync("public/properties") : [],
  );
  const names = raw
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean)
    .map((name) => name.replace(/\s+/g, "-").replace(/\.(png|jpe?g)$/i, ".webp"));

  const found: string[] = [];
  for (const name of names) {
    if (available.has(name)) found.push(`/properties/${name}`);
    else
      console.warn(
        `  ⚠ ${propertyLabel}: image file not found in public/properties/: ${name}`,
      );
  }
  return found;
}

/**
 * A property's image list, resolved separately from `mapProperty()` since
 * `images` is not a column on the `properties` table — it lives in
 * `property_media`, synced as its own step in `main()`.
 */
function mapPropertyImages(row: Row): { id: string; images: string[] } {
  const id =
    pick(row, "id", "ref", "reference") || `NT-${pick(row, "__id").slice(0, 8)}`;
  const label = pick(row, "address", "name", "title") || id;
  const raw = pick(row, "files&media", "filesandmedia", "images", "photos");
  return { id, images: raw ? resolvePropertyImages(raw, label) : [] };
}

function mapProperty(row: Row) {
  const lng = num(pick(row, "lng", "longitude"));
  const lat = num(pick(row, "lat", "latitude"));

  return {
    id: pick(row, "id", "ref", "reference") || `NT-${pick(row, "__id").slice(0, 8)}`,
    address: pick(row, "address", "name", "title"),
    locality: pick(row, "locality", "area", "neighbourhood"),
    district: pick(row, "district", "municipal"),
    region: pick(row, "region") || "Greater Accra",
    geom:
      lng != null && lat != null
        ? `SRID=4326;POINT(${lng} ${lat})`
        : null,
    type: normaliseType(pick(row, "type", "propertytype")),
    style: pick(row, "style", "propertystyle") || "Unknown",
    bedrooms: num(pick(row, "bedrooms", "beds")) ?? 0,
    bathrooms: num(pick(row, "bathrooms", "baths")) ?? 0,
    floor_area_sqm: num(pick(row, "floorarea", "floorareasqm", "sqm")),
    plot_area_sqm: num(pick(row, "plotarea", "plotareasqm")),
    year_built: num(pick(row, "yearbuilt", "built")),
    asking_price: num(pick(row, "askingprice", "price")) ?? 0,
    listed_date: pick(row, "listeddate", "listed") || null,
    status: normaliseStatus(pick(row, "status")),
    tenure: normaliseTenure(pick(row, "tenure")),
    title_status: normaliseTitle(pick(row, "titlestatus", "title")),
    eco_rating: normaliseEco(pick(row, "ecorating", "eco")),
    verified_by: pick(row, "verifiedby", "surveyor") || null,
    summary: pick(row, "summary", "description") || null,
    source_ref: sourceRef(row, pick(row, "address", "name", "title")),
  };
}

function mapProfessional(row: Row) {
  return {
    name: pick(row, "name"),
    firm: pick(row, "firm", "company", "organisation"),
    discipline: pick(row, "discipline", "profession", "role"),
    licence_no: pick(row, "licenceno", "licenseno", "licence", "registration"),
    region: pick(row, "region") || "Greater Accra",
    verified: bool(pick(row, "verified", "registered")),
    years_experience: num(pick(row, "yearsexperience", "experience")),
    specialisms: list(pick(row, "specialisms", "specialities", "specialties")),
    phone: pick(row, "phone", "telephone"),
    email: pick(row, "email"),
    source_ref: sourceRef(
      row,
      pick(row, "name"),
      pick(row, "firm", "company", "organisation"),
    ),
  };
}

function mapMaterial(row: Row) {
  return {
    name: pick(row, "name", "material"),
    category: pick(row, "category") || "Structure",
    region: pick(row, "region") || "Greater Accra",
    certification: pick(row, "certification", "certificate"),
    carbon_kg_co2e: num(pick(row, "carbon", "carbonkgco2e", "co2e")),
    saving_vs_conventional_pct: num(pick(row, "saving", "savingpct", "carbonsaving")),
    unit: pick(row, "unit") || "unit",
    price_per_unit: num(pick(row, "price", "priceperunit")),
    summary: pick(row, "summary", "description") || null,
    source_ref: sourceRef(row, pick(row, "name", "material")),
  };
}

/* --- Sync ---------------------------------------------------------------- */

/**
 * `fromFile` tells the caller whether image sync is possible: a CSV/file
 * export carries plain filenames (resolvable against `public/properties/`),
 * while the live Notion API returns temporary signed URLs that cannot be
 * resolved to a local file.
 */
async function loadDataset(
  name: string,
  envUrlKey: string,
): Promise<{ rows: Row[]; fromFile: boolean }> {
  const ref = process.env[envUrlKey];
  if (!ref) {
    console.log(`  ${envUrlKey} not set — skipping ${name}`);
    return { rows: [], fromFile: false };
  }

  // A local export file is the most reliable path and needs no token.
  if (existsSync(ref)) {
    console.log(`  reading ${name} from file ${ref}`);
    return { rows: parseCsv(readFileSync(ref, "utf8")), fromFile: true };
  }

  // Otherwise treat it as a Notion database id / URL.
  const id = (ref.match(/[0-9a-f]{32}/i) ?? [])[0];
  if (!id) {
    throw new Error(
      `${envUrlKey} is neither a readable file nor a Notion URL containing a database id: ${ref}`,
    );
  }
  if (!NOTION_TOKEN) {
    throw new Error(
      `${envUrlKey} points at Notion but NOTION_TOKEN is not set. Either set the token, or export the database to CSV and point ${envUrlKey} at the file.`,
    );
  }

  console.log(`  reading ${name} from Notion database ${id}`);
  return { rows: await readNotionDatabase(id), fromFile: false };
}

async function main() {
  if (!DRY_RUN && (!SUPABASE_URL || !SERVICE_KEY)) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (or pass --dry-run).",
    );
    process.exit(1);
  }

  const supabase =
    DRY_RUN || !SUPABASE_URL || !SERVICE_KEY
      ? null
      : createClient(SUPABASE_URL, SERVICE_KEY, {
          auth: { persistSession: false },
        });

  // The three mappers return different shapes, so the array is typed to their
  // common contract: a row of column values plus the identity fields the
  // upsert conflicts on.
  interface Dataset {
    name: string;
    env: string;
    table: string;
    conflict: string;
    map: (row: Row) => Record<string, unknown>;
  }

  const datasets: Dataset[] = [
    {
      name: "properties",
      env: "NOTION_PROPERTIES_URL",
      table: "properties",
      conflict: "id",
      map: mapProperty,
    },
    {
      name: "professionals",
      env: "NOTION_PROFESSIONALS_URL",
      table: "professionals",
      conflict: "source_ref",
      map: mapProfessional,
    },
    {
      name: "materials",
      env: "NOTION_MATERIALS_URL",
      table: "green_materials",
      conflict: "source_ref",
      map: mapMaterial,
    },
  ].filter((d) => !only || d.name === only);

  for (const ds of datasets) {
    console.log(`\n${ds.name}:`);
    const { rows, fromFile } = await loadDataset(ds.name, ds.env);
    if (rows.length === 0) continue;

    const mapped = rows.map(ds.map);
    // A row with neither an address nor a name is an empty Notion row.
    const usableFlags = mapped.map((r) => Boolean(r.name || r.address));
    const usable = mapped.filter((_, i) => usableFlags[i]);
    const usableRows = rows.filter((_, i) => usableFlags[i]);
    const skipped = mapped.length - usable.length;

    console.log(`  parsed ${mapped.length} rows, ${usable.length} usable${skipped ? `, ${skipped} skipped (no name/address)` : ""}`);

    if (DRY_RUN) {
      console.log(`  sample: ${JSON.stringify(usable[0], null, 2)}`);
      if (ds.name === "properties") {
        if (fromFile) {
          for (const row of usableRows) {
            const { id, images } = mapPropertyImages(row);
            console.log(`  images ${id}: ${images.length ? images.join(", ") : "(none)"}`);
          }
        } else {
          console.log(
            "  live Notion API path does not sync images yet — export the database to CSV (point NOTION_PROPERTIES_URL at the file) and re-run for image sync.",
          );
        }
      }
      continue;
    }

    const { error, count } = await supabase!
      .from(ds.table)
      .upsert(usable, { onConflict: ds.conflict, count: "exact" });

    if (error) {
      console.error(`  FAILED: ${error.message}`);
      process.exitCode = 1;
      continue;
    }

    console.log(`  upserted ${count ?? usable.length} rows into ${ds.table}`);

    if (ds.name !== "properties") continue;

    if (!fromFile) {
      console.warn(
        "  live Notion API path does not sync images yet — export the database to CSV (point NOTION_PROPERTIES_URL at the file) and re-run for image sync.",
      );
      continue;
    }

    let mediaOk = 0;
    let mediaFailed = 0;
    for (const row of usableRows) {
      const { id, images } = mapPropertyImages(row);
      if (!id) continue;

      const { error: delErr } = await supabase!
        .from("property_media")
        .delete()
        .eq("property_id", id);
      if (delErr) {
        console.error(`  media delete failed for ${id}: ${delErr.message}`);
        mediaFailed++;
        continue;
      }

      if (images.length === 0) {
        mediaOk++;
        continue;
      }

      const { error: insErr } = await supabase!
        .from("property_media")
        .insert(images.map((url, sort) => ({ property_id: id, url, sort })));
      if (insErr) {
        console.error(`  media insert failed for ${id}: ${insErr.message}`);
        mediaFailed++;
      } else {
        mediaOk++;
      }
    }
    console.log(
      `  synced media for ${mediaOk}/${usableRows.length} propert${usableRows.length === 1 ? "y" : "ies"}${mediaFailed ? `, ${mediaFailed} failed` : ""}`,
    );
  }

  console.log(DRY_RUN ? "\nDry run complete — nothing written." : "\nSync complete.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
