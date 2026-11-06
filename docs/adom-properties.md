# Adom Data import — 6 November 2026

Source: `C:\Users\Admin\Desktop\Adom Data\Document.docx` and its numbered image folders. Source numbers 1–10 belong to this separate document; they do not replace the platform's earlier properties 1–10. Nine listings are included; **Adom property 9 is on hold at the owner's request** because no exterior photograph was supplied.

| Adom source | Listing | Beds / baths / toilets | Source size | Price (GH₵) | Photos | Eco |
| --- | --- | --- | --- | ---: | ---: | --- |
| 1 | DKI Properties — Kwashieman compound house | 15 / 14 / 10 | 200 sqm | 4,500,000 | 7 | D |
| 2 | Dollar dream Estate — Kwashieman-Lapaz compound house | 18 / 20 / 10 | 450 sqm | 10,700,000 | 2 | D |
| 3 | Emmanuel Appiah — Kwashieman villa | 8 / 6 / 7 | 200 sqm | 3,800,000 | 4 | D |
| 4 | Prudential Properties Agency — Kwashieman-Hong Kong apartment | 4 / 3 / 4 | 5000 sqm | 2,300,000 | 6 | D |
| 5 | Edmark Agency — Labone apartment | 1 / 1 / 2 | 300 sqm | 1,530,000 | 6 | D |
| 6 | B. Realty Ghana — Labone compound house | 4 / 5 / 5 | 100 sqm | 10,290,000 | 9 | D |
| 7 | Angela Nartey — Labone apartment | 3 / 3 / 4 | 350 sqm | 2,600,000 | 8 | D |
| 8 | United Homes — Labone apartment | 2 / 3 / 3 | 1000 sqm | 2,250,000 | 7 | D |
| 10 | Tetteh — Labone-AU Village compound house | 4 / 4 / 5 | 2332 sqm | 15,940,000 | 5 | D |

All 200 original fields and the complete inventory, including held property 9, remain in [the structured reference](../data/property-reference-adom.json). Two independent XML readers agreed on every source field. Original eco ratings were blank. The owner's latest instruction, “D for all,” sets all nine imported listings to D, superseding the earlier C rating for property 3. The owner also changed property 3 from Bungalow to Villa and added private garden, mature trees and landscaped compound to its documented Balcony feature. Original source values and the confirming replies are retained separately.

All 10 active contact numbers are copied from the document and normalized from Ghanaian local format to `+233`. Only property 6 documents a secondary contact. Names, addresses, districts, prices and numeric sizes follow the source. Size has no specified plot/floor measurement basis; the established numeric field is retained without an added measurement claim. Source two/three-storey values map to the existing Multi Storey option, with the exact source wording preserved. Compound house casing, condition punctuation and missing amenity commas are normalized; each cleanup is recorded. No self-contained status, coordinates, construction dates or numeric lease terms were invented.

The folder has 64 complete image files representing 60 unique photographs. Four duplicate files and two unusable `.crdownload` files are recorded and excluded. Property 9 accounts for six of the unique photographs and remains unpublished, leaving 54 active photos across nine listings. No exact source-photo matches or address-and-agent duplicate candidates were found in the existing 51-listing catalog.

Every active photograph was reviewed and an exterior selected explicitly. Property 5's only supplied exterior is the pool courtyard with the apartment building visible. Cards retain edge-to-edge 4:3 covers, responsive image sizes and quality 90; galleries retain full photographs. Jiji lettering was replaced precisely with transparent Urban Rise captions, preserving agent watermarks.

All six unique photographs for property 4 arrived sideways. A lossless 90-degree clockwise pixel rotation makes them upright, with no resizing. Their untouched raw originals are archived under `data/property-source-originals/kwashieman-hong-kong-apartment-prudential/`. Registered originals are the exact upright rotations. Caption edits are verified against those upright originals; the agent watermark remains in its rotated orientation. The new caption is horizontal near the top to avoid the vertical agent lettering. The verifier independently reconstructs each rotation and compares every pixel.

All exact workflow previews were inspected before registration with `photos:prepare --apply --reviewed`. The application bundles listing data and registered media together; no Supabase rows are inserted ahead of asset deployment. After deployment the active catalog contains 60 listings. The photograph policy also retains the archived former property-41 asset collection, so it counts 61 registered asset collections separately from the active listing total.

Verification:

```powershell
npm run photos:check
node scripts/verify-property-watermarks.mjs
node scripts/verify-adom-properties.mjs
node scripts/verify-adom-properties.mjs --site=http://localhost:3000
node --test scripts/tests/imported-properties.test.mjs
npm run build
npm run e2e:mobile
```

Verified on 6 November 2026:

- Production build passed, generating 72 routes for the 60-listing catalog. Targeted ESLint and all seven imported-listing tests passed.
- The production preview matched all nine new listing objects, all 54 served photo hashes, nine quality-90 exterior thumbnails and all 10 documented contact numbers. Every existing listing object in the 51-listing baseline remained unchanged; held Adom property 9 was absent.
- Each new card, detail gallery, last slide, contact link and full-size viewer passed at Chromium widths 320, 390 and 1440 pixels and WebKit width 390 pixels, without horizontal overflow. Covers filled their 4:3 areas; detail galleries preserved full photographs. The villa's confirmed features and the apartment's upright orientation were checked in the browser.
- All 42 existing responsive tests passed across small/large phones, landscape, tablet, desktop and Safari. The previous properties 37–44 and 45–51 passed their independent source verifiers.
- The full photo policy passed: 61 registered asset collections, 554 branded photos and one preserved historical unmarked photograph. The independent pixel audit confirmed zero changes outside the lettering masks. All six upright originals matched exact 90-degree rotations of their archived raw sources.
- SHA-256 checks confirmed that the Desktop Word document, all 64 complete source images and both partial downloads were unchanged. Every previous exterior selection and photo registration was preserved.
