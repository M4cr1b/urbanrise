# Properties 37–44: retrieved data and photograph review

Source: `C:/Users/Admin/Desktop/Round two/Urbanw.docx` and the matching numbered image folders. This is a source reference and proposed gallery plan; it does not add or publish website listings. Original documents and photographs remain intact.

All eight entries contain 20 source fields. All 65 image files decoded successfully, representing 64 unique images. The proposed galleries contain 63 photos after removing one duplicate from property 38 and the unselected exterior from property 42. All source files are retained. Full filenames, hashes, dimensions, field paragraphs and decisions are in [the structured reference](../data/property-reference-37-44.json).

| No. | Address as written | Type as written | Agent | Beds / baths / toilets | Size as written | Price (GHS) | Source / unique / proposed photos |
| --- | --- | --- | --- | --- | --- | ---: | ---: |
| 37 | Adabraka | Apartment | MickyBella | 10 / 4 / 4 | 5000 sqm | 9,200,000 | 6 / 6 / 6 |
| 38 | Adabraka | Compound House | Soundwave Logistics | 10 / 10 / 10 | 100 sqm | 4,000,000 | 12 / 11 / 11 |
| 39 | Adabraka | Compound House | Ultimate Heights Consult | 5 / 5 / 5 | 1906 sqm | 4,200,000 | 5 / 5 / 5 |
| 40 | Adenta,, Ashiyie | Townhouse | Legacy Homes | 3 / 3 / 3 | 250 sqm | 1,500,000 | 7 / 7 / 7 |
| 41 | Adenta, | Villa | Ernest Delvys Doyi | 4 / 4 / 5 | 1222 sqm | 21,100,000 | 8 / 8 / 8 |
| 42 | Adenta, Amrahia | Bungalow | Dekscom Consult | 3 / 3 / 4 | 245 sqm | 1,170,000 | 9 / 9 / 8 |
| 43 | Adenta - Oyarifa | Duplex | Home Haven Realty | 4 / 4 / 5 | 356 sqm | 4,200,000 | 8 / 8 / 8 |
| 44 | Adenta - Ssnit | Duplex | Home Trust Properties Agency | 4 / 4 / 5 | 356 sqm | 2,700,000 | 10 / 10 / 10 |

## Owner confirmations and selected exterior

- **39:** retain the overgrown site/building photograph; the owner confirmed that it belongs to this listing.
- **40:** use **Single Storey**, explicitly confirmed by the owner. The document originally says `Multi-storey`; both values and their authority are preserved in the reference.
- **42:** the owner delegated selection of the best-fitting exterior. Source photo 4, the gable-front bungalow with white veranda rails, is the proposed cover. Source photo 3, the hip-roof view, is omitted from the proposed gallery but preserved in the source inventory. The provided views do not conclusively establish which exterior the interior photographs belong to.

## Import considerations

- **38 and 39:** preserve `Compound House` as the property type and `Detached` as the style. [Compound House support](compound-house-type.md) has now been added to the model, Type filter and database constraint; these listings have not yet been imported.
- **38:** source photos 1 and 2 are byte-identical. Prefer the original filename without `(1)` in the future gallery; no source file is deleted.
- **41:** `24-hour Electricity` and `Pre-Paid Meter` each occur twice in the source. Raw text is retained; display amenities can be deduplicated on import.
- **37 and 38:** documented areas are respectively **5000 sqm** and **100 sqm**, retained as written. The document does not identify the size as plot area or floor area.

## Existing format understood

The existing property structure includes address/district/region, type/style/storey, bedrooms/bathrooms/toilets, size, asking price, condition/furnishing, facilities, tenure and remaining lease term, status, eco rating/green features, documented agent contacts, summary and an ordered photo gallery. These eight source entries do not explicitly provide region, a marketing summary or self-contained status. Those fields have not been invented in this reference.

A secondary phone remains absent when not documented. For imported photos, follow [the preparation workflow](adding-property-photos.md): selected exterior first, edge-to-edge 4:3 thumbnails, responsive sizing and quality 90, access to the full gallery, and transparent `POSTED ON URBAN RISE` lettering after precise editing and review. These retrieved source photos retain their existing lettering.

## Documented contacts

| No. | Primary | Secondary |
| --- | --- | --- |
| 37 | +233546014526 | Not documented |
| 38 | +233243536135 | Not documented |
| 39 | +233505847322 | Not documented |
| 40 | +233555863021 | Not documented |
| 41 | +233540649229 | Not documented |
| 42 | +233501935904 | Not documented |
| 43 | +233242151526 | +233539463955 |
| 44 | +233550899856 | +233550827422 |

## Property 37 — MickyBella

Source folder: `C:/Users/Admin/Desktop/Round two/PROPERTY 37 IMAGES`.

| Source field | Value as written |
| --- | --- |
| PROPERTY ADDRESS | Adabraka |
| PROPERTY TYPE | Apartment |
| STOREY | Multi-storey |
| PROPERTY SIZE | 5000 sqm |
| CONDITION | Old |
| FURNISHING | Unfurnished |
| BEDROOM | 10 |
| BATHROOMS | 4 |
| TOILET | 4 |
| ASKING PRICE | GH₵ 9,200,000 |
| PROPERTY STYLE | Detached |
| FACILITIES | 24-hour Electricity, Pre-Paid Meter, Balcony |
| AGENT | MickyBella |
| CONTACT | +233546014526 |
| DISTRICT | Korle-Klottey Municipal District |
| ECO RATING | D |
| GREEN FEATURES | Balcony |
| TENURE | Leasehold |
| REMAINING LEASE TERMS | Not specified |
| STATUS | Available |

Proposed exterior cover: `59913971_MTYwMC0xMjAwLWY1ZjJkM2YyZTc.webp`.

| Source index | Filename | Dimensions | Review / proposed action |
| ---: | --- | --- | --- |
| 1 | `59913971_MTYwMC0xMjAwLWY1ZjJkM2YyZTc.webp` | 1600 × 1200 | front exterior; proposed exterior cover |
| 2 | `59913974_MTYwMC0yMTM0LTIxNzc2NDcyMjE.webp` | 1600 × 2134 | angled front exterior |
| 3 | `59913975_MTYwMC0yMTM0LTM1OWExZjM4NGM.webp` | 1600 × 2134 | stairwell |
| 4 | `59913976_MTYwMC0yMTM0LTk2ZjkxYzM1NGI.webp` | 1600 × 2134 | side passage |
| 5 | `59913977_MTYwMC0yMTM0LWI5YzIzMjI0ZmM.webp` | 1600 × 2134 | angled front exterior |
| 6 | `59913978_MTYwMC0yMTM0LWNlMDFlMTYwZjM.webp` | 1600 × 2134 | side passage |

- The document states 5000 sqm. This is retained exactly, without inferring whether it is floor area or plot area.

## Property 38 — Soundwave Logistics

Source folder: `C:/Users/Admin/Desktop/Round two/PROPERTY 38 IMAGES`.

| Source field | Value as written |
| --- | --- |
| PROPERTY ADDRESS | Adabraka |
| PROPERTY TYPE | Compound House |
| STOREY | Multi-storey |
| PROPERTY SIZE | 100 sqm |
| CONDITION | Old |
| FURNISHING | Unfurnished |
| BEDROOM | 10 |
| BATHROOMS | 10 |
| TOILET | 10 |
| ASKING PRICE | GH₵ 4,000,000 |
| PROPERTY STYLE | Detached |
| FACILITIES | 24-hour Electricity |
| AGENT | Soundwave Logistics |
| CONTACT | +233243536135 |
| DISTRICT | Korle-Klottey Municipal District |
| ECO RATING | E |
| GREEN FEATURES | Not specified |
| TENURE | Leasehold |
| REMAINING LEASE TERMS | Not specified |
| STATUS | Available |

Proposed exterior cover: `53496840_ODA5LTEwODAtODQ2NzFkZDg4ZQ.webp`.

| Source index | Filename | Dimensions | Review / proposed action |
| ---: | --- | --- | --- |
| 1 | `53496839_ODA5LTEwODAtMTI5OWFmOGNlMw (1).webp` | 809 × 1080 | courtyard (duplicate copy); duplicate omitted from proposed gallery |
| 2 | `53496839_ODA5LTEwODAtMTI5OWFmOGNlMw.webp` | 809 × 1080 | courtyard |
| 3 | `53496840_ODA5LTEwODAtODQ2NzFkZDg4ZQ.webp` | 809 × 1080 | street-facing exterior; proposed exterior cover |
| 4 | `53496841_ODA5LTEwODAtMWRiYzgxNWYyNg.webp` | 809 × 1080 | side exterior |
| 5 | `53496842_ODA5LTEwODAtZjMzODM0NzRkOQ.webp` | 809 × 1080 | inner courtyard exterior |
| 6 | `53496843_ODA5LTEwODAtNWVlOWYwM2MwZQ.webp` | 809 × 1080 | side passage |
| 7 | `53496844_ODA5LTEwODAtMzkwNGVjMTQzZg.webp` | 809 × 1080 | inner courtyard exterior |
| 8 | `53496845_ODA5LTEwODAtYzIzMWUzZDFhMQ.webp` | 809 × 1080 | inner courtyard exterior |
| 9 | `53496846_ODA5LTEwODAtOTA2NzRjZjc0NQ.webp` | 809 × 1080 | courtyard |
| 10 | `53496847_ODA5LTEwODAtYWZjMmY5YzYwMA.webp` | 809 × 1080 | inner courtyard exterior |
| 11 | `53496848_ODA5LTEwODAtNWNhYmI0ODk4Yw.webp` | 809 × 1080 | service courtyard |
| 12 | `53496850_ODA5LTEwODAtOGNmZjMwMDIyNg.webp` | 809 × 1080 | upper floor and staircase |

- Compound House is preserved exactly and is now supported by the shared data model, Type filter and database constraint (migration 0023). The source Detached style is retained.

- Source images 1 and 2 are byte-identical. Retain both source files, but include only the original filename without (1) in a future gallery.

- The document states 100 sqm. This is retained exactly, without inferring whether it is floor area or plot area.

## Property 39 — Ultimate Heights Consult

Source folder: `C:/Users/Admin/Desktop/Round two/PROPERTY 39 IMAGES`.

| Source field | Value as written |
| --- | --- |
| PROPERTY ADDRESS | Adabraka |
| PROPERTY TYPE | Compound House |
| STOREY | Multi-storey |
| PROPERTY SIZE | 1906 sqm |
| CONDITION | Old |
| FURNISHING | Unfurnished |
| BEDROOM | 5 |
| BATHROOMS | 5 |
| TOILET | 5 |
| ASKING PRICE | GH₵ 4,200,000 |
| PROPERTY STYLE | Detached |
| FACILITIES | 24-hour Electricity, |
| AGENT | Ultimate Heights Consult |
| CONTACT | +233505847322 |
| DISTRICT | Korle-Klottey Municipal District |
| ECO RATING | E |
| GREEN FEATURES | Not specified |
| TENURE | Leasehold |
| REMAINING LEASE TERMS | Not specified |
| STATUS | Available |

Proposed exterior cover: `62633966_OTYwLTEyODAtZTJhNzMwZWVmZA.webp`.

| Source index | Filename | Dimensions | Review / proposed action |
| ---: | --- | --- | --- |
| 1 | `62633966_OTYwLTEyODAtZTJhNzMwZWVmZA.webp` | 960 × 1280 | street-facing exterior; proposed exterior cover |
| 2 | `62633967_OTYwLTEyODAtNTE4MjQ2MTdmNA.webp` | 960 × 1280 | courtyard and side exterior |
| 3 | `62633970_OTYwLTEyODAtMmIwMTk2YjllMA.webp` | 960 × 1280 | entrance exterior |
| 4 | `62633972_OTYwLTEyODAtYjUyZDQ0Yjc5NQ.webp` | 960 × 1280 | side exterior |
| 5 | `62633981_MTIwMC0xNjAwLWM5Y2RmYWM1Nzk.webp` | 1200 × 1600 | overgrown site/building; owner confirmed it belongs to property 39 |

- Compound House is preserved exactly and is now supported by the shared data model, Type filter and database constraint (migration 0023). The source Detached style is retained.

## Property 40 — Legacy Homes

Source folder: `C:/Users/Admin/Desktop/Round two/PROPERTY 40 IMAGES`.

| Source field | Value as written |
| --- | --- |
| PROPERTY ADDRESS | Adenta,, Ashiyie |
| PROPERTY TYPE | Townhouse |
| STOREY | Multi-storey |
| PROPERTY SIZE | 250 sqm |
| CONDITION | Newly Built |
| FURNISHING | Unfurnished |
| BEDROOM | 3 |
| BATHROOMS | 3 |
| TOILET | 3 |
| ASKING PRICE | GH₵ 1,500,000 |
| PROPERTY STYLE | Detached |
| FACILITIES | 24-hour Electricity, Air Conditioning, Chandelier, Dishwasher, En Suite Bathroom, Fitted Kitchen, Gated Community, Hot Water, Pop Ceiling, Pre-Paid Meter, Tiled Floor |
| AGENT | Legacy Homes |
| CONTACT | +233555863021 |
| DISTRICT | La-Nkwantanang-Madina Municipal District |
| ECO RATING | D |
| GREEN FEATURES | Balcony |
| TENURE | Leasehold |
| REMAINING LEASE TERMS | Not specified |
| STATUS | Available |

**Confirmed override for import: STOREY = Single Storey.**

Proposed exterior cover: `62592863_MTIyOC05ODMtYWRhNzI5MTdhNw.webp`.

| Source index | Filename | Dimensions | Review / proposed action |
| ---: | --- | --- | --- |
| 1 | `62592863_MTIyOC05ODMtYWRhNzI5MTdhNw.webp` | 1228 × 983 | building exterior; proposed exterior cover |
| 2 | `62592864_MTE1OC05MjYtNjFiZWM4NGQ3OQ.webp` | 1158 × 926 | estate courtyard |
| 3 | `62592865_MTEyMS04OTctYjE0ZTkzNDQwNQ.webp` | 1121 × 897 | kitchen |
| 4 | `62592866_MTAyNC04MTktYmQwYjU3YzJhMA.webp` | 1024 × 819 | bathroom |
| 5 | `62592867_MTEyMS04OTctMGJhYTQwMTk1OQ.webp` | 1121 × 897 | living area |
| 6 | `62592868_MTA4Ni04NjgtOGU2YTU1ODQ2MQ.webp` | 1086 × 868 | interior room |
| 7 | `62592869_MTE1OC05MjYtMzg2NjE5MDgyNQ.webp` | 1158 × 926 | entrance gate |

- The document says Multi-storey; the owner explicitly confirmed Single Storey. fields.STOREY uses the confirmed value; sourceFields.STOREY retains the document value.

## Property 41 — Ernest Delvys Doyi

Source folder: `C:/Users/Admin/Desktop/Round two/PROPERTY 41 IMAGES`.

| Source field | Value as written |
| --- | --- |
| PROPERTY ADDRESS | Adenta, |
| PROPERTY TYPE | Villa |
| STOREY | Multi-storey |
| PROPERTY SIZE | 1222 sqm |
| CONDITION | Newly Built |
| FURNISHING | Semi-furnished |
| BEDROOM | 4 |
| BATHROOMS | 4 |
| TOILET | 5 |
| ASKING PRICE | GH₵ 21,100,000 |
| PROPERTY STYLE | Detached |
| FACILITIES | Tiled Floor, Dining Area, 24-hour Electricity, Pop Ceiling, Pre-Paid Meter, 24-hour Electricity, Air Conditioning, Balcony, Borehole, Children's Play Area, Dishwasher, En Suite Bathroom, Fitted Kitchen, Hot Water, Microwave, Pre-Paid Meter, Sectionals |
| AGENT | Ernest Delvys Doyi |
| CONTACT | +233540649229 |
| DISTRICT | La-Nkwantanang-Madina Municipal District |
| ECO RATING | D |
| GREEN FEATURES | Balcony |
| TENURE | Leasehold |
| REMAINING LEASE TERMS | Not specified |
| STATUS | Available |

Proposed exterior cover: `62514857_NzIwLTEyODAtMjY2N2Q5OWExNw.webp`.

| Source index | Filename | Dimensions | Review / proposed action |
| ---: | --- | --- | --- |
| 1 | `62069083_MTYwMC0yMTM0LTIzZWE1YmMxODE.webp` | 1600 × 2134 | shower |
| 2 | `62069084_MTYwMC0xMjAwLWNiNjAxNzVkMGQ.webp` | 1600 × 1200 | living area |
| 3 | `62069086_MTYwMC0yMTM0LTNiZGM0MTBjNzQ.webp` | 1600 × 2134 | bathroom |
| 4 | `62069087_MTYwMC0yMTM0LTBlMzAyNGJlYTc.webp` | 1600 × 2134 | interior room |
| 5 | `62069092_MTYwMC0yMTM0LTViMzc0ODVlMWM.webp` | 1600 × 2134 | upper-floor landing |
| 6 | `62069094_MTYwMC0xMjAwLTMwNDYxZTE5Y2M.webp` | 1600 × 1200 | living area, another angle |
| 7 | `62069095_MTYwMC0yMTM0LTZlNDQwZTMwZjQ.webp` | 1600 × 2134 | upper-floor landing, another angle |
| 8 | `62514857_NzIwLTEyODAtMjY2N2Q5OWExNw.webp` | 720 × 1280 | front exterior; proposed exterior cover |

- 24-hour Electricity and Pre-Paid Meter each appear twice in the source facilities. Preserve the source text; deduplicate display amenities when importing.

## Property 42 — Dekscom Consult

Source folder: `C:/Users/Admin/Desktop/Round two/PROPERTY 42 IMAGES`.

| Source field | Value as written |
| --- | --- |
| PROPERTY ADDRESS | Adenta, Amrahia |
| PROPERTY TYPE | Bungalow |
| STOREY | Single-Storey |
| PROPERTY SIZE | 245 sqm |
| CONDITION | Newly Built |
| FURNISHING | Unfurnished |
| BEDROOM | 3 |
| BATHROOMS | 3 |
| TOILET | 4 |
| ASKING PRICE | GH₵ 1,170,000 |
| PROPERTY STYLE | Detached |
| FACILITIES | Balcony, Dining Area, En Suite, Kitchen Cabinets, Kitchen Shelf, Pop Ceiling, Pre-Paid Meter, Sectionals, Tiled Floor, Wardrobe |
| AGENT | Dekscom Consult |
| CONTACT | +233501935904 |
| DISTRICT | La-Nkwantanang-Madina Municipal District |
| ECO RATING | D |
| GREEN FEATURES | Balcony |
| TENURE | Leasehold |
| REMAINING LEASE TERMS | Not specified |
| STATUS | Available |

Proposed exterior cover: `28746031_MTYwMC0xMjAwLWQ4YTQxMmU0Mzk.webp`.

| Source index | Filename | Dimensions | Review / proposed action |
| ---: | --- | --- | --- |
| 1 | `14615513_MTA4MC03MTUtYjc5OTA2NTk0OA.webp` | 1080 × 715 | bathroom; association with chosen exterior unconfirmed |
| 2 | `14615516_MTA4MC03MTUtMzY0MDQ1OTYwNA.webp` | 1080 × 715 | bathroom, another angle; association with chosen exterior unconfirmed |
| 3 | `14615517_MTA4MC03MTUtMDUwYjA5MDllNg.webp` | 1080 × 715 | hip-roof exterior; omitted from proposed gallery |
| 4 | `28746031_MTYwMC0xMjAwLWQ4YTQxMmU0Mzk.webp` | 1600 × 1200 | gable-front exterior with white veranda rails; selected exterior; proposed exterior cover |
| 5 | `58852205_MTYwMC05MDAtNDFhZmJmMjA4Mg.webp` | 1600 × 900 | kitchen; association with chosen exterior unconfirmed |
| 6 | `58852206_MTYwMC05MDAtMTUwNzg5YTA1Yg.webp` | 1600 × 900 | wardrobe/interior room; association with chosen exterior unconfirmed |
| 7 | `58852207_MTYwMC05MDAtYTdmNjMxOTI2MQ.webp` | 1600 × 900 | interior room; association with chosen exterior unconfirmed |
| 8 | `58852210_MTYwMC05MDAtN2I0NTRmNTg1Yw.webp` | 1600 × 900 | kitchen, another angle; association with chosen exterior unconfirmed |
| 9 | `58852213_MTYwMC05MDAtZWJjNDAxNzQ2ZA.webp` | 1600 × 900 | interior room, another angle; association with chosen exterior unconfirmed |

- Under the owner's instruction to choose the best-fitting exterior, source photo 4 is selected and source photo 3 omitted from the proposed gallery. Both originals are retained. The interior-to-selected-exterior association remains unproven by the supplied views; do not describe it as independently verified.

## Property 43 — Home Haven Realty

Source folder: `C:/Users/Admin/Desktop/Round two/PROPERTY 43 IMAGES`.

| Source field | Value as written |
| --- | --- |
| PROPERTY ADDRESS | Adenta - Oyarifa |
| PROPERTY TYPE | Duplex |
| STOREY | multi--Storey |
| PROPERTY SIZE | 356 sqm |
| CONDITION | Newly Built |
| FURNISHING | Semi-furnished |
| BEDROOM | 4 |
| BATHROOMS | 4 |
| TOILET | 5 |
| ASKING PRICE | GH₵ 4,200,000 |
| PROPERTY STYLE | Detached |
| FACILITIES | 24-hour Electricity, Air Conditioning, Balcony, Chandelier, Dining Area, Dishwasher, En Suite, Hot Water, Kitchen Cabinets, Kitchen Shelf, Microwave, Pop Ceiling, Pre-Paid Meter, Refrigerator, Tiled Floor, Wardrobe |
| AGENT | Home Haven Realty |
| CONTACT | +233242151526 and +233539463955 |
| DISTRICT | La-Nkwantanang-Madina Municipal District |
| ECO RATING | D |
| GREEN FEATURES | Balcony |
| TENURE | Leasehold |
| REMAINING LEASE TERMS | Not specified |
| STATUS | Available |

Proposed exterior cover: `60758455_OTYwLTEyODAtOTRmOTY4NmM4ZA.webp`.

| Source index | Filename | Dimensions | Review / proposed action |
| ---: | --- | --- | --- |
| 1 | `60758455_OTYwLTEyODAtOTRmOTY4NmM4ZA.webp` | 960 × 1280 | front exterior; proposed exterior cover |
| 2 | `60758456_MTIwMC0xNjAwLWFjNjEzN2IxNzM.webp` | 1200 × 1600 | kitchen |
| 3 | `60758457_MTIwMC0xNjAwLTg4NzVkMTRkY2Q.webp` | 1200 × 1600 | kitchen, another angle |
| 4 | `60758459_MTIwMC0xNjAwLTU1YjFhZjMyYjI.webp` | 1200 × 1600 | kitchen, another angle |
| 5 | `60758460_MTIwMC0xNjAwLTBlMDgxN2UxY2Q.webp` | 1200 × 1600 | staircase |
| 6 | `60758461_MTIwMC0xNjAwLTM0ODRmMTY0M2I.webp` | 1200 × 1600 | living area |
| 7 | `60758462_MTIwMC0xNjAwLTI2ZDEwM2I5ZDc.webp` | 1200 × 1600 | wardrobe/dressing area |
| 8 | `60758465_MTIwMC0xNjAwLWVkNDgzMGVlNTU.webp` | 1200 × 1600 | bathroom |

## Property 44 — Home Trust Properties Agency

Source folder: `C:/Users/Admin/Desktop/Round two/PROPERTY 44 IMAGES`.

| Source field | Value as written |
| --- | --- |
| PROPERTY ADDRESS | Adenta - Ssnit |
| PROPERTY TYPE | Duplex |
| STOREY | multi--Storey |
| PROPERTY SIZE | 356 sqm |
| CONDITION | Newly Built |
| FURNISHING | Unfurnished |
| BEDROOM | 4 |
| BATHROOMS | 4 |
| TOILET | 5 |
| ASKING PRICE | GH₵ 2,700,000 |
| PROPERTY STYLE | Detached |
| FACILITIES | 24-hour Electricity, Air Conditioning, Balcony, Chandelier, Dining Area, Dishwasher, En Suite, Hot Water, Kitchen Cabinets, Kitchen Shelf, Pop Ceiling, Pre-Paid Meter, Tiled Floor. |
| AGENT | Home Trust Properties Agency |
| CONTACT | +233550899856 and +233550827422 |
| DISTRICT | La-Nkwantanang-Madina Municipal District |
| ECO RATING | D |
| GREEN FEATURES | Balcony |
| TENURE | Leasehold |
| REMAINING LEASE TERMS | Not specified |
| STATUS | Available |

Proposed exterior cover: `59443164_MTA4MC04MTAtZWU2MDk1YmNlMg.webp`.

| Source index | Filename | Dimensions | Review / proposed action |
| ---: | --- | --- | --- |
| 1 | `59443164_MTA4MC04MTAtZWU2MDk1YmNlMg.webp` | 1080 × 810 | front exterior; proposed exterior cover |
| 2 | `59443166_MTA4MC04MTAtMjJlMGM5MGQ0ZA.webp` | 1080 × 810 | side/front exterior |
| 3 | `59443167_MTA4MC04MTAtYTE1YmFkMGUzMQ.webp` | 1080 × 810 | pool and compound |
| 4 | `59443168_ODEwLTEwODAtNGY4ZWYwZTQ4Zg.webp` | 810 × 1080 | interior room |
| 5 | `59443169_ODEwLTEwODAtZjkwNTY1MDFmZQ.webp` | 810 × 1080 | interior room |
| 6 | `59443170_ODEwLTEwODAtOTAyMmE3Yzc3NA.webp` | 810 × 1080 | interior room |
| 7 | `59443171_ODEwLTEwODAtMTY5YzM0MzhlYg.webp` | 810 × 1080 | interior room |
| 8 | `59443172_MTA4MC04MTAtYWE1ODM4NzBiNA.webp` | 1080 × 810 | staircase and light fitting |
| 9 | `59443173_ODEwLTEwODAtOTMzYjFiN2U5NQ.webp` | 810 × 1080 | interior room |
| 10 | `59443178_ODEwLTEwODAtOTcyOWQ2YmQyYg.webp` | 810 × 1080 | interior room |

## Review basis

All 65 supplied files were decoded and the eight folders visually reviewed. Agent lettering is consistent with the documented agent for each folder. That supports the folder-to-agent mapping; it does not establish an address, bedroom count or a physical association between every photo. Owner confirmations and the remaining property 42 association limitation are stated explicitly. Source and image SHA-256 hashes preserve provenance.

## Independent verification

A second extraction using .NET Word XML parsing matched all 160 source fields and verified the owner-confirmed storey override. Four source-document hashes and all 65 original photo hashes matched. An independent Sharp decoder successfully read all 65 photos and confirmed every recorded dimension and format. All 10 contact numbers and all 63 proposed gallery entries were checked. No website assets, property data sources or database records were changed.

## Classification support added

On 18 October 2026, Compound House support was added to the shared model, Type filter and database constraint. The database migration preserved all 36 existing property rows and did not import any of these eight listings. Source field and image verification remains unchanged.
