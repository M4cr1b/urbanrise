/**
 * Post-import smoke test against a running dev server.
 *
 *   node scripts/smoke.ts
 *
 * Asserts that the imported Notion listings actually reach the rendered page,
 * rather than that the database merely accepted them — the seed/live data seam
 * means "rows exist" and "the app shows them" are genuinely separate claims.
 */

const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";

let failures = 0;

async function expectAll(path: string, needles: string[]) {
  try {
    const res = await fetch(BASE + path);
    const html = await res.text();
    const missing = needles.filter((n) => !html.includes(n));
    const ok = res.ok && missing.length === 0;
    if (!ok) failures++;
    console.log(
      `${ok ? "ok  " : "FAIL"} ${path.padEnd(24)} http ${res.status}` +
        (missing.length ? `  missing: ${missing.join(", ")}` : ""),
    );
  } catch (e) {
    failures++;
    console.log(`FAIL ${path.padEnd(24)} ${(e as Error).message}`);
  }
}

async function expectAsset(path: string) {
  try {
    const res = await fetch(BASE + path);
    const bytes = Number(res.headers.get("content-length") ?? 0);
    const ok = res.ok && bytes > 0;
    if (!ok) failures++;
    console.log(
      `${ok ? "ok  " : "FAIL"} ${path.padEnd(24)} http ${res.status}  ` +
        `${res.headers.get("content-type")}  ${(bytes / 1024).toFixed(0)}KB`,
    );
  } catch (e) {
    failures++;
    console.log(`FAIL ${path.padEnd(24)} ${(e as Error).message}`);
  }
}

async function main() {
  console.log(`smoke: ${BASE}\n`);

  // The three imported agencies must appear in search results.
  await expectAll("/search", [
    "Alorex Eng. Properties",
    "Seth Mensah Properties",
    "Amazing Properties Agency",
  ]);

  // A real listing's detail page, with its price formatted from the DB value.
  await expectAll("/property/UR-N002", ["Seth Mensah", "Cantonment", "4,650,000"]);
  await expectAll("/property/UR-N001", ["Alorex", "Adenta", "1,000,000"]);

  // Imported photography must actually be served.
  await expectAsset("/properties/image-3.webp");
  await expectAsset("/properties/image.webp");

  // The rest of the platform still works alongside the imported rows.
  await expectAll("/comparables", ["Subject property", "Property type"]);
  await expectAll("/market", ["East Legon"]);
  await expectAll("/professionals", ["Estate Surveyor"]);
  await expectAll("/green-hub", ["Hive Earth"]);

  console.log(failures === 0 ? "\nall checks passed." : `\n${failures} FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
