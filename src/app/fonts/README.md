# UrbanRise fonts

These Latin-subset WOFF2 files preserve the existing Hanken Grotesk headlines,
Inter body text and Sora figures. Variable weight ranges match the weights
previously requested through `next/font/google`. They are served with
`next/font/local`, so builds do not fetch Google Fonts or depend on the format
of Google's font URLs.

`sources.json` records the exact Google Fonts CSS and font URLs, SHA-256 hashes,
weight ranges and byte lengths retrieved on 3 November 2026. The corresponding
SIL Open Font License notices from the official google/fonts repository are
included alongside each file. Preserve these notices when distributing the fonts.

The change addresses Next.js issue
[vercel/next.js#99114](https://github.com/vercel/next.js/issues/99114), observed
during the responsive-layout production build.
