# Mobile layout and usability

The responsive changes preserve the existing property data, cover selections,
watermarked photographs, full detail galleries and desktop workspaces.

## Changes

- Phone search uses a compact toolbar, a horizontally browsable location row,
  and a scrollable filter sheet. Type, style, storey, tenure, all A–G eco bands,
  status, bedrooms and price remain available. The sheet keeps its result/reset
  controls visible, contains keyboard focus and restores focus on closing.
- Search suggestions put their price and rating below the locality on narrow
  screens. Enter applies the entered locality, the clear control restores the
  full catalog, and the suggestion footer reports the complete match count.
- The workbench gives phones a clear module title and five bottom destinations.
  Valuation stages appear on phones when working in Comparables. Safe-area
  spacing and dynamic viewport height support browser chrome and home indicators.
- The marketing navigation has a phone/tablet menu linking to every main section
  and help/legal pages. Fixed headers no longer cover the About, Help or Legal
  headings. The phone landing page uses a normal scrolling layout; the desktop
  animation and reduced-motion option remain available.
- Property pages use wrapping specifications, narrower padding and responsive
  prices/headings. A direct call action appears on smaller layouts. Gallery and
  thumbnail navigation scroll only their own horizontal strips. Full-screen
  photographs use a native modal, support horizontal touch swipes, Escape and
  restored focus, and retain the complete photograph.
- Professional discipline selection uses a native mobile select. Profile names,
  registration badges and contact links have room to wrap. Market summary tiles
  use two columns on phones, and sorting uses a native select. Material-category
  controls scroll horizontally on phones. Form fields remain at least 16px on
  phones, and touch controls retain generous targets.
- The original Hanken Grotesk, Inter and Sora fonts are bundled locally as WOFF2
  files with their licenses and source hashes. This fixes the observed
  [Next.js Google Fonts build failure](https://github.com/vercel/next.js/issues/99114)
  without changing the font families or adding a package dependency.

## Verification

Verified on 3 November 2026 using a production build with the configured catalog.
The build generated 56 routes, including all 44 property pages. Targeted ESLint
and TypeScript checks passed. The photo policy verified 44 property folders and
416 registered branded photographs. The source-listing verifier retained all
160 documented fields, 10 phone numbers and 63 photo associations for properties
37–44.

The dedicated suite passed **42 tests** across these seven browser profiles:

| Profile | Engine | Viewport |
| --- | --- | --- |
| Small phone | Chromium, touch | 320 × 740 |
| Android-sized phone | Chromium, touch | 390 × 844 |
| Large phone | Chromium, touch | 430 × 932 |
| Landscape phone | Chromium, touch | 844 × 390 |
| Tablet | Chromium, touch | 768 × 1024 |
| Desktop | Chromium | 1440 × 1000 |
| Safari-sized phone | WebKit, touch | 390 × 844 |

A separate production-browser check visited all **44 property detail pages** at
320px: none overflowed the document or main content area horizontally. The
1280px desktop navigation breakpoint also fit within the viewport. Loaded-photo
screenshots were reviewed for the phone landing page, search, filters,
professional cards, specifications and full-screen gallery, alongside desktop
search. Local review artifacts are in `.shots/mobile-2026-11/verified/`.

Coverage includes every main route, horizontal overflow, fixed-header clearance,
filter selection/reset/dismissal and focus containment, readable suggestions,
Enter/clear, navigation, gallery navigation without vertical jumps, full-screen
controls, real emulated touch swipes in Chromium, contact links, professional
discipline selection and market search. WebKit checks wait for hydration and use
fresh documents to distinguish rendering errors from cancelled prefetches during
rapid test navigation.

Run against a fresh production build:

```powershell
npm run build
npm run e2e:mobile
```

Install the browser engines on a new workstation with
`npx playwright install chromium webkit`. The mobile suite uses its own local
production server on port 3418 and shuts that server down after the run; the
normal localhost development server can keep running on port 3000.

These are browser-emulation checks, not tests on physical phones. The layout
approach follows [W3C reflow guidance](https://www.w3.org/WAI/WCAG21/Understanding/reflow)
and [MDN safe-area guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Environment_variables/Using).
