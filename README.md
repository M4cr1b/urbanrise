# UrbanRise Ghana

An Integrated Residential Property Information and Market Intelligence Platform
for Ghana — the prototype described in `../Initial Docs/UrbanRise Idea.pdf`.

It consolidates residential listings, comparable evidence for valuation, a
directory of estate professionals and a Green Building Materials Hub into one
system, so that the information a buyer, valuer or developer needs stops being
scattered across agencies, brokers and social media.

---

## Two deliberate visual worlds

**The landing page** keeps the airy botanical-green design system from
`../Urban Rise Design system/`. Scrolling drives a cinematic: the hero image
expands out of its left-rounded pill until it fills the viewport, then a rounded
window opens at its centre and the rest of the page grows out of it.

**Everything behind it** is a professional workbench — dark evergreen chrome, a
module rail down the left, a linear valuation workflow across the top, and a
comparables matrix with a frozen subject column. Dense and built for surveyors,
modelled on Rightmove Plus but in UrbanRise's own palette.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

The app runs on a seeded Ghanaian dataset out of the box — every screen works
with no credentials configured.

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run e2e` | Playwright suite (desktop + mobile) |
| `npm run notion:dry` | Parse the Notion/CSV source and report, writing nothing |
| `npm run notion:sync` | Ingest Notion → Supabase |

## Routes

| Route | Module |
|---|---|
| `/` | Landing page with the scroll-driven portal reveal |
| `/search` | Segmented-filter property search and results |
| `/property/[id]` | Full property record |
| `/comparables` | The comparables matrix — frozen subject column, aligned rows |
| `/comparables?stage=…` | `shortlist · analysis · rationale · valuation · submit` |
| `/market` | Market intelligence: trends, rates, year-on-year movement |
| `/professionals` | Directory of estate professionals |
| `/green-hub` | Green Building Materials Hub |

## Architecture notes

### The data seam

`src/lib/data/index.ts` picks a source at import time:

- **no credentials** → `seed-source.ts`, backed by the Ghanaian dataset in
  `src/lib/data/*.ts`
- **credentials present** → `supabase-source.ts`

Both satisfy the contract in `contract.ts`, so no screen knows which answered.
This is what let the UI be finished before the Supabase project existed.

### The scroll reveal

`src/components/scroll/` — `position: sticky` does the pinning and `clip-path`
runs on the compositor, so there is no GSAP dependency, no layout recalculated
per frame, and no React state change while scrubbing. `useScrollScrub` drives
CSS custom properties imperatively from a rAF loop.

The hook is pessimistic about motion: the server renders the static layout and
only a client that confirms `prefers-reduced-motion: no-preference` upgrades to
the animated one. The opposite default would serve a 320vh scroll-jack to the
people the query exists to protect.

### The comparables matrix

One CSS grid, `280px repeat(N, 240px)`, inside a single scroll container. Every
attribute is a grid row spanning all columns, so rows stay aligned even when
cells differ in height — sold prices carry a date on a second line, which is
exactly what breaks a per-column layout with fixed row heights. The subject
column's cells are `sticky left-0`; the address band is `sticky top-0`.

### Charts

`src/components/charts/` — hand-rolled SVG, no chart library. The categorical
palette in `palette.ts` was validated against the dataviz checker (lightness
band, chroma floor, CVD separation, normal-vision floor, contrast). Three greens
cannot be told apart by a deuteranope, so slots 3 and 4 leave the botanical hues
on purpose. A table view is available on the market module for the same reason.

## Connecting Supabase

1. Copy `.env.example` to `.env.local` and fill in the project URL and
   publishable (anon) key. Keep the service-role key out of any `NEXT_PUBLIC_`
   variable and out of version control.
2. Apply the schema:

   ```bash
   npx supabase db push          # or paste supabase/migrations/0001_init.sql
   ```

   It creates the tables, enables PostGIS with a GiST index on `properties.geom`,
   adds the `comparables_within` radius-search function, and turns on row level
   security: reference data is publicly readable (the platform exists to remove
   information asymmetry), while valuations are private to their author.

3. Restart `npm run dev`. The data seam switches over automatically.

Optionally regenerate types once the schema is live:

```bash
npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
```

## Ingesting from Notion

Point the `NOTION_*_URL` variables at either a **Notion database URL** (with
`NOTION_TOKEN` set) or a **local CSV export** — the sync accepts both.

```bash
npm run notion:dry      # parse and report, write nothing
npm run notion:sync     # upsert into Supabase
```

It is idempotent: every row gets a stable `source_ref` (the Notion page id, or a
slug of the natural key for CSV imports), so re-runs update rather than
duplicate. Loose source values are normalised on the way in — `"Sold STC"` →
`Sold`, `"99 year lease"` → `Leasehold 99yr`, `"₵1,750,000"` → `1750000`.

## Testing

```bash
npm run e2e
```

34 tests across desktop and mobile covering: the reveal reaching full bleed and
opening the portal, no horizontal overflow at any scroll position, the
reduced-motion fallback, the frozen subject column surviving a horizontal
scroll, row alignment across every column, the shortlist → analysis → submit
workflow gate, search filtering, and a console-error sweep of every route.

## Known gaps

- **Auth is not wired.** The valuation shortlist lives in `localStorage`; the
  `valuations` tables and their RLS policies exist but nothing writes to them yet.
- **No map view.** `properties.geom` and `comparables_within` are in place, so
  the spatial half of the GIS requirement is ready; the map UI is not built.
- **`npm audit` reports advisories** in `postcss` and `sharp`, both transitive
  dependencies of a freshly scaffolded Next.js 16. Nothing here introduces them
  and `--force` would change Next's major version.
