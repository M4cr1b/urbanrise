# Property import 45–51

Reviewed on 4 November 2026. All seven listings and their 78 photographs are included in the application. They appear alongside the existing 44 listings when the branch is run or deployed. No database records were inserted or modified.

The source is `C:\Users\Admin\Desktop\Round two\Database.docx`. This is newer than `Urbanw.docx` and its agents match the photographs in folders 47–50. The older document repeats conflicting Justice entries for several of those properties. Property 51's folder is named `PROPERTY 51MAGES` in the source directory.

The [reference JSON](../data/property-reference-45-51.json) retains all 140 source fields, paragraph positions, original file hashes and dimensions, selected photo order, exterior filenames, older-document differences and normalization records. Independent Python and .NET XML extraction agreed on all 189 nonempty paragraphs for these entries.

| Property | Listing | Price (GH₵) | Photos | Contacts |
| --- | --- | ---: | ---: | ---: |
| 45 | Dollar Dream Estate — Adenta duplex | 3,770,000 | 12 | 1 |
| 46 | Justice — Adenta Amrahia bungalow | 1,600,000 | 9 | 1 |
| 47 | United Homes — Adenta, Pantang Hospital villa | 2,080,000 | 10 | 1 |
| 48 | Alorex Eng Properties — Adenta, Amanfro duplex | 1,300,000 | 14 | 2 |
| 49 | Charclem Ventures — Adenta-Lakeside Estate bungalow | 1,800,000 | 11 | 1 |
| 50 | Dollar Dream Estates — Adenta villa | 4,320,000 | 17 | 1 |
| 51 | United Homes — Adenta, SDA apartment | 4,000,000 | 5 | 1 |

The owner confirmed these three corrections in conversation on 4 November:

- Property 46 is **Single Storey**, replacing the document's `multi--Storey`.
- Property 46 has one confirmed contact, **0508724944**, stored in the established international format as **+233508724944**. Both copied Home Trust numbers were removed from this listing. No secondary number was invented.
- Property 51 costs **GH₵4,000,000**, replacing the ambiguous source text `GH₵ 4,00,000`.

Other numeric values, agent names, addresses, district names and tenure terms follow the newer document. The source gives property size without identifying a plot or floor measurement basis; this import retains the established numeric field without adding a measurement claim. Greater Accra is application region metadata. Undocumented self-contained status, coordinates, construction dates and numeric lease terms remain absent.

Missing commas between explicitly named amenities were restored for properties 47, 49, 50 and 51. Repeated identical amenities were removed for 50 and 51. Storey spelling and semi-furnished capitalization were normalized. Each cleanup is recorded beside the untouched source text in the reference JSON.

All 78 source files are unique and retained byte for byte. Every photograph was inspected, with an explicit front exterior selected first. Embedded Jiji lettering was replaced using precise local masked editing and transparent Urban Rise lettering. Agent watermarks remain intact. Reviewed lossless copies retain the original dimensions and every pixel outside the caption mask. The standard `photos:prepare` preview/apply workflow registered the photos, masks, exterior covers and generated gallery URLs. Cards retain edge-to-edge 4:3 `object-cover` thumbnails, responsive image sizes and quality 90; detail galleries retain the full photographs.

Verification commands:

```powershell
npm run photos:check
node scripts/verify-property-watermarks.mjs
node scripts/verify-properties-45-51.mjs
node scripts/verify-properties-45-51.mjs --site=http://localhost:3000
node --test scripts/tests/imported-properties.test.mjs
npm run typecheck
npm run build
npm run e2e:mobile
```

Deploy the listing data and registered assets together from `Actual-view`. The application's existing merge logic gives database records precedence if these same IDs are subsequently stored in Supabase.

Validation completed on 4 November 2026:

- Production build passed with 63 generated routes, including all 51 property pages. Type checking, targeted lint and five import integration tests passed.
- Source and served-page audits verified 140 fields, eight confirmed contact numbers, 78 associated photographs and seven optimized exterior thumbnails. Served photograph hashes matched the reviewed assets.
- The independent watermark audit verified all 494 branded photographs with zero changed pixels outside their masks. The historical unmarked photograph remains intact. Both Desktop Word documents and all 78 new source photographs retain their audited hashes.
- The original 44 served listing objects, covers and 416 watermark registrations were unchanged.
- All seven new cards, galleries, full-size viewers and contacts passed Chromium checks at 320px, 390px and 1440px, plus WebKit at 390px. Cards filled their 4:3 area at quality 90 and pages had no horizontal overflow.
- All 42 existing responsive cases were verified across seven phone, landscape, tablet, desktop and Safari profiles: 28 passed initially; the remaining 14 passed after their search selector and expected Amrahia market results were updated for the current site.
