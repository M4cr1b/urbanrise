# Property thumbnails

The following covers were selected by visually inspecting each listing's existing photographs. The property numbers match `data/property-reference-11-36.json`.

| Property | Exterior selected | Reason |
| --- | --- | --- |
| 12 — Save Hands, Adjiriganor apartment | `03.webp` | Wider view of the building facade than the previous courtyard entrance. |
| 27 — United Homes, Tantra Hills bungalow | `05.webp` | Front of the bungalow and courtyard; replaces a bedroom. |
| 28 — United Homes, Achimota villa | `04.webp` | Exterior facade; replaces the living room. |
| 29 — Home Trust, Achimota bungalow | `05.webp` | Clearer building and veranda view with less obstruction from trees. |
| 30 — Kings City, ACP duplex | `04.webp` | Daylight exterior showing the roof and facade; replaces a bathroom. |
| 31 — Kings City, Tantra Hills mansion | `06.webp` | Mansion and courtyard; replaces the entrance gate and guardhouse. |
| 32 — Rokoson, Tantra Hills duplex | `06.webp` | Daylight exterior of the building; replaces a bathroom. |
| 34 — Haskay Bright, Golf Hills duplex | `05.webp` | Building facade from inside the compound; replaces a bedroom. |
| 35 — Emmanuel Appiah, Tantra Hills villa | `03.webp` | Front exterior; replaces an interior with boxes. |

Other covers already show suitable exteriors and retain their order. All original photographs remain available in each gallery.

`data/property-covers.json` records the selections. Both data sources promote an available selected cover to the first gallery position. This makes search, featured cards, suggestions and the initial detail view consistent without changing database records or renaming image files. Missing selections fall back to the existing gallery.

Search cards use at most three columns; featured cards use at most two. Both fill the entire 4:3 thumbnail area with `object-cover`, responsive image sizes and optimization quality 90. Portrait and differently proportioned photographs are cropped to fill the card without blank sides. The selected exterior covers remain unchanged, and the detail gallery still shows complete photographs. Actual detail remains limited by the supplied photographs' resolution. Original photographs are preserved; separate lossless display copies carry the [updated transparent platform caption](property-watermark-update.md).

Below the tablet breakpoint, filters scroll with the results so they cannot permanently occupy most of the photo's viewing area. Desktop filters retain their fixed position above the scrolling results.

Validate the original photographs and cover membership with:

```powershell
node scripts/verify-properties-11-36.mjs
```

To also check the rendered listing data, all 26 detail pages, original photograph hashes and optimized thumbnails against a running site:

```powershell
node scripts/verify-properties-11-36.mjs --site=http://localhost:3000
```

The reference file continues to describe database gallery order. The verifier checks the website against that reference with the reviewed cover promoted first.

Verified on 17 October 2026: production build (48 routes), all 26 audited detail pages and their documented fields, 257 original photograph hashes, and 26 optimized thumbnails. Browser checks at 1440px and 390px with a device pixel ratio of 2 confirmed all nine selected covers, responsive resolution, the initial detail cover and featured cards. The mobile property-type filter and reset also passed. Thumbnail fitting was subsequently adjusted to fill the card edge to edge at the owner's request.

The fill adjustment passed desktop and mobile browser checks for those nine covers plus property 26 (the owner's screenshot), as well as featured cards. The selected exterior URLs and full-image fitting in the detail gallery were also confirmed.

These selections take effect when the application changes are deployed from `Actual-view`. They require no database migration.
