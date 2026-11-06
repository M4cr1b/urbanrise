# UrbanRise visual refinement — 6 November 2026

The supplied reference informed the compact header typography, rounded navigation group and clear primary action. The existing evergreen, leaf-green, teal and neutral colour tokens remain unchanged. All fonts are the existing locally hosted Hanken Grotesk, Inter and Sora files.

Design research included the publicly readable pages of [The Modern House](https://themodernhouse.com/), [onefinestay](https://www.onefinestay.com/) and [Four Seasons Residences](https://www.fourseasons.com/residences/). Their property-focused presentation informed the direction; the supplied screenshot is the visual reference for the header. Direct browser previews of The Modern House and onefinestay encountered their security checks, so those pages were reviewed through their readable page structure rather than a claimed visual reproduction.

## Changes

- Marketing navigation uses a rounded group with 12px medium-weight Inter labels and a contrasting evergreen primary action. Mobile navigation retains its sheet and existing destinations.
- The homepage has more deliberate heading line breaks, a restrained green accent, equal-width search tabs, clearer controls, softer section cards and a coordinated footer. The mobile “New homes” tab retains the accessible name and intent of “New Developments.”
- Shared card and panel finishes unify search, market insights, professionals, materials and property details. Property prices and addresses have a clearer hierarchy. Exterior photographs still fill edge-to-edge 4:3 thumbnails at quality 90, and detail galleries preserve full photos.
- The workbench retains its module rail, mobile bottom navigation and valuation workflow. Workflow labels now use sentence case and pill-shaped active states. Informational pages share the heading treatment.
- Light and dark appearances, reduced-motion behaviour, focus indicators and touch targets remain supported. Registration and shortlist badges use matching theme foreground/background tokens; placeholders are clearer.
- The appearance test helper now clicks a choice and waits for its checked state. The existing view-transition callback commits controlled radio state asynchronously, so the previous immediate `check()` assertion could fail while the selected theme was already updating.

## Verification

- Production build and TypeScript passed: 72 generated routes, including all 60 property listings. The photo policy passed for 61 asset collections, including archived assets.
- All 42 responsive tests passed across seven profiles: 320px, 390px and 430px phones; 844px landscape; 768px tablet; 1440px desktop; and WebKit/Safari phone.
- All 14 appearance tests passed, including persistence, system preferences, cross-tab updates, keyboard selection, dismissal, animated switching and browsers without view transitions. All four desktop landing-reveal and reduced-motion tests passed.
- A separate production review checked 32 screens: eight routes at 390px and 1440px in both light and dark modes. It found no document or main-content horizontal overflow or page exceptions. It confirmed the original brand tokens, 60 search cards, equal search tabs, compact header typography and filled quality-90 thumbnails. All six valuation navigation stages retained the existing empty state and active-link behaviour.
- All seven imported-listing tests and the Adom, properties 37–44 and properties 45–51 source verifiers passed. The independent watermark audit verified all 554 branded photos with zero edits outside lettering masks. This update changes no listing data, photo assets, gallery registrations or contact numbers.
- Targeted ESLint and whitespace checks passed.
- The final colour-only finishing pass was rebuilt and checked on mobile and desktop. Registration badge contrast is 4.54:1 in light mode and 7.22:1 in dark mode; search placeholder contrast is 5.86:1 and 7.93:1 respectively.

The existing comparables dataset has no records or subject property. Three older matrix/shortlisting tests therefore failed on missing data-dependent elements; those results do not establish matrix or calculation behaviour. The empty state and workflow routing were verified, and no example comparables were inserted to satisfy those tests. The old search test that assumes an “Unregistered” filter is also outside the current search interface and was not run.

Local browser evidence is retained in the ignored `.shots/` directory (`ui-verification.json`, before/after screenshots and theme/reveal reports). Review the update at `http://localhost:3000/` and `http://localhost:3000/search`.
