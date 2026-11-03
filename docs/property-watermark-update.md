# Property photograph captions

For subsequent listings, follow [the new-property photo workflow](adding-property-photos.md). It prepares transparent Urban rise captions, records the exterior cover and requires visual review before publication. `npm run build` checks registered photo and mask hashes and exterior selections before building.

The property photographs now display `POSTED ON URBAN RISE` in transparent lettering. Only the embedded Jiji brand lettering was replaced; the existing `POSTED ON` lettering and agent names were retained.

There are 354 photographs used by the current 36 listings. Of these, 353 have edited display copies. `cantonments-mansion-stardom/06.webp` has an agent watermark without the Jiji caption and remains unchanged. The two source photographs that are not used in any current listing were left alone.

Original files under `public/properties` remain byte-for-byte intact. The display copies under `public/property-photos` use lossless WebP at the original dimensions. Each caption was reviewed visually. Local masked editing replaces the old brand glyphs and adds transparent lettering; pixels inside that small lettering area necessarily change. All decoded photo pixels outside the recorded masks are identical to the originals.

`data/property-watermarks.json` records the original and edited URLs, SHA-256 hashes, dimensions, placement and mask for each edited photograph. `data/property-watermark-masks` contains the exact allowed edit areas. The independent Sharp-based verifier checks these files and rejects changes outside the masks:

```powershell
node scripts/verify-property-watermarks.mjs
node scripts/verify-properties-11-36.mjs
```

Both property data sources apply the mapping in `src/lib/data/property-images.ts` after promoting the reviewed exterior cover. Gallery order, thumbnail filling, listing fields, contact numbers and database records are unchanged. New display URLs avoid reusing cached versions of the old photographs. No database migration is required.

To verify rendered property data, detail galleries, served image hashes and optimized thumbnails against a running instance:

```powershell
node scripts/verify-properties-11-36.mjs --site=http://localhost:3000
```

The changes take effect on the hosted website after deploying the updated `Actual-view` branch or merging it into the deployment branch.

Verified on 18 October 2026: all 353 edited files passed independent decoded-pixel, dimension and hash checks; zero pixels changed outside the lettering masks. The production build generated all 48 routes, and targeted lint checks passed. Desktop (1440px) and mobile (390px) browser checks confirmed ten exterior covers, thumbnail filling, detail and featured images, and mobile filtering. The 26 audited detail pages, 257 served photographs and 26 optimized thumbnails passed. A comparison of all 36 rendered listings against the pre-edit catalog confirmed that every non-image field and gallery order remained unchanged.
