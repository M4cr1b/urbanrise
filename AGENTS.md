<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## New property listings and photographs

- Follow `docs/adding-property-photos.md` for every new listing. Use the existing property field structure and only documented contact numbers; a secondary number is optional.
- Inspect the source photographs and explicitly select an exterior as the cover. Keep thumbnails edge to edge with `object-cover`, the existing 4:3 ratio, responsive sizes and quality 90. Preserve full photographs in the detail gallery.
- Use `npm run photos:prepare` to preview transparent `POSTED ON URBAN RISE` captions, then apply only after inspecting every preview. Preserve agent watermarks and original files. Existing platform lettering requires precise individual editing first; do not overlay a second brand on it.
- Register the photos and cover using that workflow, use its generated gallery URLs, and run `npm run photos:check` and `node scripts/verify-property-watermarks.mjs` before publishing. Never bypass the prebuild photo check to deploy an unprepared listing.
