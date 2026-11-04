# Property 41 replacement — 4 November 2026

The owner requested a complete replacement using the revised property-41 entry in `C:\Users\Admin\Desktop\Round two\Database.docx` and the six current photographs in `PROPERTY 41 IMAGES`. The older `Urbanw.docx` still describes the superseded Ernest Delvys Doyi villa.

| Field | Updated value |
| --- | --- |
| Address | Adenta, SSNIT |
| Type / style / storey | Villa / Detached / Multi Storey |
| Bedrooms / bathrooms / toilets | 5 / 5 / 6 |
| Source property size | 97 sqm; measurement basis unspecified |
| Asking price | GH₵2,690,000 |
| Condition / furnishing | Newly Built / Unfurnished |
| Agent | Mainstay Property Management |
| Only documented contact | +233592023296 |
| District | La-Nkwantanang-Madina Municipal District |
| Tenure / remaining lease terms | Leasehold / Not specified |
| Status / eco rating / green features | Available / D / Balcony |

All 20 source fields, exact paragraph text, image hashes, dimensions and exterior selection are retained in [the replacement reference](../data/property-reference-41-update.json). Independent Python and .NET XML extraction agreed on every paragraph. The source facilities replace the previous list completely: Air Conditioning, Balcony, Chandelier, Dining Area, En Suite, Hot Water, Kitchen Cabinets, Kitchen Shelf, Microwave, Pop Ceiling, Pre-Paid Meter, Refrigerator, Tiled Floor and Wardrobe. No secondary phone or undocumented fields were added.

The active ID is `adenta-ssnit-villa-mainstay`. The previous `/property/adenta-villa-ernestdoyi` address redirects permanently to the replacement. There is one replacement listing, so the catalog remains at 51. A read-only Supabase check found neither ID stored there; the reviewed application bundle remains the source for property 41. No database write or migration was required.

All six current photographs were visually reviewed. Source `57781775_OTU5LTEyODAtNzczNjA0YjMzMw.webp` is the front exterior and appears first. Precise local editing replaced only the old Jiji lettering, preserving the Mainstay watermark, original dimensions and all pixels outside the caption masks. Every standard workflow preview was inspected before `photos:prepare --apply --reviewed` registered the assets. Card and full-gallery display follow the existing format.

The previous reference entry and eight old original/branded photos remain archived, with their existing hashes and registry entries. The application no longer references that gallery. Photo policy counts 52 registered asset collections, including that archive; this is separate from the 51 active listings. Properties 37–44 now have 61 active photographs rather than 63.

Verification uses `node scripts/verify-properties-37-44.mjs` (optionally `--site=http://localhost:3000`), `npm run photos:check`, `node scripts/verify-property-watermarks.mjs`, the import integration tests and the production build.

Completed validation: production build (63 routes), targeted lint, six import integration tests, all 160 current fields and 61 photographs for properties 37–44, and the unchanged 45–51 source audit passed. The independent pixel audit verified all 500 watermark variants with no changes outside caption masks. All 50 other served listing objects matched the before-update snapshot. The replacement card, six-photo gallery, phone link and full-size viewer passed at 320px, 390px and 1440px in Chromium and 390px in WebKit. The permanent redirect retained query parameters. All seven existing page-layout cases passed across phone, landscape, tablet, desktop and Safari profiles. Both Word documents and all six Desktop source images retained their audited hashes.
