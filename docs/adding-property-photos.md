# Photographs for new listings

Use this workflow for every new property. Listing pages already share the current format: exterior cover first, edge-to-edge 4:3 thumbnails, responsive resolution and quality 90. Full photographs remain available in the detail gallery. Keep listing fields consistent with the existing property structure; a secondary phone number is optional and must only be entered when documented.

The preparation command adds the transparent `POSTED ON URBAN RISE` caption to new photographs without resizing them. Originals remain intact. It creates lossless display copies, pixel masks, hashes and an explicit exterior selection for both property data sources.

For automatic captioning, start with photographs without an existing platform caption. An agent's own name or logo can remain. Photos containing Jiji or another old platform caption need individual local editing and visual review before registration; this command does not attempt to detect or erase such lettering automatically. Use the replacement mode below to register already edited photographs without stamping them again.

Create a JSON plan next to the source folder, for example:

```json
{
  "slug": "new-property-slug",
  "sourceDirectory": "PROPERTY 37 IMAGES",
  "sourcePlatformWatermarks": "none",
  "exterior": "front-exterior.webp",
  "photos": [
    { "file": "front-exterior.webp" },
    { "file": "living-room.jpg", "captionY": 0.70 }
  ]
}
```

`sourceDirectory` is relative to the plan file, or an absolute path. List every intended photograph explicitly. `exterior` must match a listed filename and must be confirmed by inspecting the photograph. Filenames must be unique. `captionY` optionally changes the caption baseline as a fraction of image height, from 0.1 to 0.9; the default is 0.78. Use it when needed to keep the caption clear of an agent name or important detail. JPEG, PNG and WebP photographs are supported. Supply upright, opaque, single-frame images.

For original photos containing old platform lettering, first prepare individually edited copies carrying `POSTED ON URBAN RISE` and their exact pixel masks, as with the existing audited photos. Keep the originals. Set `sourcePlatformWatermarks` to `reviewed-replacement` and provide each photo's `editedFile` and `maskFile`, relative to the plan file:

```json
{
  "slug": "new-property-slug",
  "sourceDirectory": "PROPERTY 37 IMAGES",
  "sourcePlatformWatermarks": "reviewed-replacement",
  "exterior": "front-exterior.webp",
  "photos": [
    {
      "file": "front-exterior.webp",
      "editedFile": "reviewed/front-urbanrise.webp",
      "maskFile": "reviewed/front-mask.png"
    }
  ]
}
```

This mode verifies the replacements against the original pixels and creates lossless previews; it does not add another caption. Masks must match the photo dimensions and cover only the edited lettering. Both modes use the same preview and apply commands below.

Generate previews first:

```powershell
npm run photos:prepare -- "C:\path\to\property-37.json"
```

The command prints the preview directory under `.shots/property-preparation`. Inspect every edited photo at full size. Confirm that the cover is the exterior, all photos belong to the listing, the transparent caption is readable and no agent watermark is obscured. Previewing does not change published assets or registries.

After reviewing those exact previews:

```powershell
npm run photos:prepare -- "C:\path\to\property-37.json" --apply --reviewed
npm run photos:check
node scripts/verify-property-watermarks.mjs
```

Applying uses the reviewed copies and rechecks their hashes, dimensions and pixels outside the caption. A changed source or edited preview invalidates that review. An existing property's files cannot be overwritten or stamped a second time through this command.

The command writes the originals to `public/properties/<slug>`, the branded copies to `public/property-photos/<slug>`, and updates the watermark and cover registries. It also writes `data/property-photo-galleries/<slug>.json` containing the exact original URLs to use for that property's media records. Use that gallery order when adding the listing through the existing database or seed-data workflow. The shared image mapper selects the branded copies for display. This command prepares photos; it does not create or publish database listings.

Commit and deploy these assets and registries with the listing changes. Ensure the assets are deployed before making a new database listing visible. Run `npm run build`; its prebuild check rejects unregistered photos in the property image folders, missing exterior selections, and files that differ from their reviewed hashes. The existing 36 listings retain their current exterior selections, including the one historically unmarked photograph. Two unused historical source files are recorded as hash-checked exceptions, not as templates for new uploads.

Workflow checks: `npm run photos:test`. Verified on 18 October 2026: six tests covering review requirements, pixel preservation, exterior selection, duplicate stamping, rejected unprepared files and supplied replacements passed. Targeted lint and the production build (48 routes) passed. The production catalog comparison confirmed that the existing 36 listings retained their fields and gallery order.
