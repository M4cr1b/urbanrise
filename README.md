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

1. Copy `.env.example` to `.env.local` and fill it in. The one people miss is
   `SUPABASE_DB_URL`: the anon and service-role keys both go through PostgREST,
   which **cannot execute DDL**, so neither can apply a migration. Schema work
   needs a Postgres connection string.

2. Apply the schema and load the dataset:

   ```bash
   npm run db:check      # prove the connection works before anything else
   npm run db:migrate    # apply supabase/migrations/*.sql in order
   npm run db:seed       # load the Ghanaian dataset
   npm run db:status     # row counts per table
   ```

   The migration creates the tables, enables PostGIS with a GiST index on
   `properties.geom`, adds the `comparables_within` radius-search function, and
   turns on row level security: reference data is publicly readable (the
   platform exists to remove information asymmetry), while valuations are
   private to their author.

   Migrations are recorded in `schema_migrations` and each runs in its own
   transaction, so re-running is safe and a failure leaves no partial schema.

3. Restart `npm run dev`. The data seam switches over automatically.

### If the database will not connect

```bash
npm run db:diagnose
```

Reports which API keys authenticate and probes every Supavisor region for the
one that owns the project. Worth knowing: **the direct-connection host
(`db.<ref>.supabase.co`) is IPv6-only on current projects** and simply fails to
resolve on most networks — the error is `ENOTFOUND`, which reads like a typo but
is not. Use the **Session pooler** URI (port 5432). Transaction pooler (6543)
does not handle DDL reliably.

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

## Deploying to Vercel

Import the repository at [vercel.com/new](https://vercel.com/new). Framework and
build settings are detected automatically; nothing needs overriding.

Set these under **Settings → Environment Variables** (Production, Preview and
Development). Without them the deployment still builds and runs — it falls back
to the seeded dataset — so a site that looks fine but shows stale data usually
means a variable is missing rather than broken.

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Bare project URL, e.g. `https://<ref>.supabase.co`. **No trailing path** — not `/rest/v1/`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Publishable / anon key. Reaches the browser by design; RLS is what protects the data. |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Only for `npm run notion:sync`. Bypasses RLS — never expose it to the client. |
| `SUPABASE_DB_URL` | no | Migrations are run from a workstation, not from Vercel. Leave unset in the dashboard. |
| `NOTION_*` | no | Ingestion runs locally. |

Do not add `SUPABASE_DB_URL` to Vercel: the deployed app never needs direct
Postgres access, and storing the database password where the build can read it
buys nothing.

### A note on rendering

Every route currently renders dynamically (`ƒ` in the build output), because the
Supabase server client reads cookies. That is correct but not free — the public
pages (`/`, `/market`, `/green-hub`, `/professionals`) hit the database on every
request when their data changes daily at most. Moving those to the cookie-free
client in `src/lib/supabase/static.ts` with `export const revalidate` would let
them cache. Worth doing before any real traffic; unnecessary for a prototype.

## Known gaps

- **Auth is not wired.** The valuation shortlist lives in `localStorage`; the
  `valuations` tables and their RLS policies exist but nothing writes to them yet.
- **No map view.** `properties.geom` and `comparables_within` are in place, so
  the spatial half of the GIS requirement is ready; the map UI is not built.
- **`npm audit` reports advisories** in `postcss` and `sharp`, both transitive
  dependencies of a freshly scaffolded Next.js 16. Nothing here introduces them
  and `--force` would change Next's major version.
