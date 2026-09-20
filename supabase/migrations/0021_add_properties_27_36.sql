-- Add properties 27–36 (Achimota batch with Bungalows)
-- Images pre-copied via scripts/copy-properties-27-36.mjs (byte-for-byte, no processing)

-- 1. Insert new agents (idempotent)
insert into agents (name, firm, phone, secondary_phone)
select 'Kings City Estate & Const', 'Kings City Estate & Const', '+233243536135', null
where not exists (select 1 from agents where firm = 'Kings City Estate & Const')
union all
select 'Roko Son', 'Roko Son', '+233244740755', null
where not exists (select 1 from agents where firm = 'Roko Son')
union all
select 'Haskay Bright', 'Haskay Bright', '+233246992346', null
where not exists (select 1 from agents where firm = 'Haskay Bright')
union all
select 'Emmanuel Appiah', 'Emmanuel Appiah', '+233552885458', null
where not exists (select 1 from agents where firm = 'Emmanuel Appiah')
on conflict do nothing;

-- 2. Insert properties 27–36
insert into properties (id, address, district, region, geom, type, style, storey, bedrooms, bathrooms, toilets, floor_area_sqm, plot_area_sqm, year_built, asking_price, listed_date, status, tenure, title_status, eco_rating, condition, furnishing, remaining_lease_terms, green_features_note, facilities, self_contained, agent_id, verified_by, summary, source_ref)
select * from (
  -- Property 27: Achimota Tantra Hills Bungalow (United Homes)
  select
    'achimota-tantra-hills-bungalow-unitedhomes'::text, 'Achimota, Tantra Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1850, 5.6450), 4326)::geography,
    'Bungalow', 'Detached', 'Single Storey', 3, 3, 3, 100, null::numeric, null::numeric,
    1870000, '2026-09-20'::date, 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Kitchen Cabinets', 'Kitchen Shelf', 'Pop Ceiling', 'Pre-Paid Meter', 'Tiled Floor', 'Wardrobe', 'Dishwasher', 'En Suite', 'Dining Area']::text[],
    true,
    (select id from agents where firm = 'United Homes' limit 1), null, '3-bed bungalow in Achimota Tantra Hills.',
    'seed:achimota-tantra-hills-bungalow-unitedhomes'
  union all
  -- Property 28: Achimota Villa (United Homes)
  select
    'achimota-villa-unitedhomes', 'Achimota', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1840, 5.6450), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 4, 4, 4, 100, null, null,
    3250000, '2026-09-20', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['Kitchen Cabinets', 'Hot Water', 'Tiled Floor', 'Wardrobe', '24-hour Electricity', 'Dishwasher', 'Kitchen Shelf', 'Dining Area', 'Pop Ceiling', 'Air Conditioning', 'Pre-Paid Meter', 'Balcony', 'En Suite']::text[],
    false,
    (select id from agents where firm = 'United Homes' limit 1), null, '4-bed villa in Achimota.',
    'seed:achimota-villa-unitedhomes'
  union all
  -- Property 29: Achimota Bungalow (Home Trust Properties Agency)
  select
    'achimota-bungalow-hometrust', 'Achimota', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1840, 5.6450), 4326)::geography,
    'Bungalow', 'Detached', 'Single Storey', 5, 4, 4, 200, null, null,
    2500000, '2026-09-20', 'Available', 'Leasehold 99yr', 'Unknown', 'C',
    'Old', 'Unfurnished', 'Not specified', null,
    array['Kitchen Cabinets', '24-hour Electricity', 'Dining Area', 'Balcony', 'Chandelier', 'Dishwasher', 'En Suite', 'Kitchen Shelf', 'Pre-Paid Meter']::text[],
    true,
    (select id from agents where firm = 'Home Trust Properties Agency' limit 1), null, '5-bed bungalow in Achimota.',
    'seed:achimota-bungalow-hometrust'
  union all
  -- Property 30: Achimota ACP Duplex (Kings City Estate & Const)
  select
    'achimota-acp-duplex-kingscity', 'Achimota, ACP', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1810, 5.6480), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 5, 4, 636, null, null,
    2800000, '2026-09-20', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Semi-Furnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Pop Ceiling', 'Pre-Paid Meter', 'Refrigerator', 'Sectionals', 'Tiled Floor', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'Kings City Estate & Const' limit 1), null, '4-bed duplex in Achimota ACP.',
    'seed:achimota-acp-duplex-kingscity'
  union all
  -- Property 31: Achimota Tantra Hills Mansion (Kings City Estate & Const)
  select
    'achimota-tantra-hills-mansion-kingscity', 'Achimota, Tantra Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1850, 5.6450), 4326)::geography,
    'Mansion', 'Detached', 'Multi Storey', 5, 6, 7, 300, null, null,
    5400000, '2026-09-20', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Semi-Furnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Refrigerator', 'Sectionals', 'Tiled Floor', 'Wardrobe', 'Wi-Fi']::text[],
    false,
    (select id from agents where firm = 'Kings City Estate & Const' limit 1), null, '5-bed mansion in Achimota Tantra Hills.',
    'seed:achimota-tantra-hills-mansion-kingscity'
  union all
  -- Property 32: Achimota Tantra Hills Duplex (Roko Son)
  select
    'achimota-tantra-hills-duplex-rokoson', 'Achimota, Tantra Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1850, 5.6450), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 5, 5, 586, null, null,
    3050000, '2026-09-20', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Semi-Furnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Sectionals', 'Tiled Floor', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'Roko Son' limit 1), null, '4-bed duplex in Achimota Tantra Hills.',
    'seed:achimota-tantra-hills-duplex-rokoson'
  union all
  -- Property 33: Achimota Kingsby Duplex (Home Trust Properties Agency)
  select
    'achimota-kingsby-duplex-hometrust', 'Achimota, Kingsby', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1870, 5.6430), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 4, 5, 140, null, null,
    3700000, '2026-09-20', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['Balcony', 'Chandelier', 'Dining Area', 'Pop Ceiling', 'Pre-Paid Meter', 'Tiled Floor']::text[],
    false,
    (select id from agents where firm = 'Home Trust Properties Agency' limit 1), null, '4-bed duplex in Achimota Kingsby.',
    'seed:achimota-kingsby-duplex-hometrust'
  union all
  -- Property 34: Achimota Golf Hills Duplex (Haskay Bright)
  select
    'achimota-golf-hills-duplex-haskaybright', 'Achimota Golf Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1895, 5.6415), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 3, 4, 4, 150, null, null,
    2750000, '2026-09-20', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Fairly Used', 'Furnished', 'Not specified', null,
    array['Dining Area', 'Tiled Floor', 'Pop Ceiling', 'Pre-Paid Meter', 'Air Conditioning', 'Balcony', 'Chandelier', 'En Suite Bathroom', 'Fitted Kitchen', 'Gated Community', 'Microwave', 'Refrigerator', 'Wardrobe', 'TV']::text[],
    false,
    (select id from agents where firm = 'Haskay Bright' limit 1), null, '3-bed duplex in Achimota Golf Hills.',
    'seed:achimota-golf-hills-duplex-haskaybright'
  union all
  -- Property 35: Achimota Tantra Hills Villa (Emmanuel Appiah)
  select
    'achimota-tantra-hills-villa-appiah', 'Achimota Tantra Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1850, 5.6450), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 4, 4, 4, 100, null, null,
    3000000, '2026-09-20', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['Kitchen Cabinets', 'Pop Ceiling', 'En Suite', 'Kitchen Shelf', 'Pre-Paid Meter', 'Swimming Pool', 'Wardrobe', 'TV', 'Air Conditioning', '24-hour Electricity', 'Hot Water', 'Microwave', 'Balcony']::text[],
    false,
    (select id from agents where firm = 'Emmanuel Appiah' limit 1), null, '4-bed villa in Achimota Tantra Hills.',
    'seed:achimota-tantra-hills-villa-appiah'
  union all
  -- Property 36: Achimota Mile 7 Townhouse (Kings City Estate & Const)
  select
    'achimota-mile7-townhouse-kingscity', 'Achimota Mile 7', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1825, 5.6470), 4326)::geography,
    'Townhouse', 'Detached', 'Multi Storey', 4, 4, 5, 532, null, null,
    3750000, '2026-09-20', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Semi-Furnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Sectionals', 'Tiled Floor', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'Kings City Estate & Const' limit 1), null, '4-bed townhouse in Achimota Mile 7.',
    'seed:achimota-mile7-townhouse-kingscity'
) t(id, address, district, region, geom, type, style, storey, bedrooms, bathrooms, toilets, floor_area_sqm, plot_area_sqm, year_built, asking_price, listed_date, status, tenure, title_status, eco_rating, condition, furnishing, remaining_lease_terms, green_features_note, facilities, self_contained, agent_id, verified_by, summary, source_ref)
on conflict (id) do nothing;

-- 3. Insert property_media rows (images, pre-ordered with exterior at 01.webp/sort=0)
insert into property_media (property_id, url, sort)
select * from (
  -- Property 27: 8 images
  select 'achimota-tantra-hills-bungalow-unitedhomes', '/properties/achimota-tantra-hills-bungalow-unitedhomes/01.webp', 0 union all
  select 'achimota-tantra-hills-bungalow-unitedhomes', '/properties/achimota-tantra-hills-bungalow-unitedhomes/02.webp', 1 union all
  select 'achimota-tantra-hills-bungalow-unitedhomes', '/properties/achimota-tantra-hills-bungalow-unitedhomes/03.webp', 2 union all
  select 'achimota-tantra-hills-bungalow-unitedhomes', '/properties/achimota-tantra-hills-bungalow-unitedhomes/04.webp', 3 union all
  select 'achimota-tantra-hills-bungalow-unitedhomes', '/properties/achimota-tantra-hills-bungalow-unitedhomes/05.webp', 4 union all
  select 'achimota-tantra-hills-bungalow-unitedhomes', '/properties/achimota-tantra-hills-bungalow-unitedhomes/06.webp', 5 union all
  select 'achimota-tantra-hills-bungalow-unitedhomes', '/properties/achimota-tantra-hills-bungalow-unitedhomes/07.webp', 6 union all
  select 'achimota-tantra-hills-bungalow-unitedhomes', '/properties/achimota-tantra-hills-bungalow-unitedhomes/08.webp', 7 union all
  -- Property 28: 10 images
  select 'achimota-villa-unitedhomes', '/properties/achimota-villa-unitedhomes/01.webp', 0 union all
  select 'achimota-villa-unitedhomes', '/properties/achimota-villa-unitedhomes/02.webp', 1 union all
  select 'achimota-villa-unitedhomes', '/properties/achimota-villa-unitedhomes/03.webp', 2 union all
  select 'achimota-villa-unitedhomes', '/properties/achimota-villa-unitedhomes/04.webp', 3 union all
  select 'achimota-villa-unitedhomes', '/properties/achimota-villa-unitedhomes/05.webp', 4 union all
  select 'achimota-villa-unitedhomes', '/properties/achimota-villa-unitedhomes/06.webp', 5 union all
  select 'achimota-villa-unitedhomes', '/properties/achimota-villa-unitedhomes/07.webp', 6 union all
  select 'achimota-villa-unitedhomes', '/properties/achimota-villa-unitedhomes/08.webp', 7 union all
  select 'achimota-villa-unitedhomes', '/properties/achimota-villa-unitedhomes/09.webp', 8 union all
  select 'achimota-villa-unitedhomes', '/properties/achimota-villa-unitedhomes/10.webp', 9 union all
  -- Property 29: 8 images
  select 'achimota-bungalow-hometrust', '/properties/achimota-bungalow-hometrust/01.webp', 0 union all
  select 'achimota-bungalow-hometrust', '/properties/achimota-bungalow-hometrust/02.webp', 1 union all
  select 'achimota-bungalow-hometrust', '/properties/achimota-bungalow-hometrust/03.webp', 2 union all
  select 'achimota-bungalow-hometrust', '/properties/achimota-bungalow-hometrust/04.webp', 3 union all
  select 'achimota-bungalow-hometrust', '/properties/achimota-bungalow-hometrust/05.webp', 4 union all
  select 'achimota-bungalow-hometrust', '/properties/achimota-bungalow-hometrust/06.webp', 5 union all
  select 'achimota-bungalow-hometrust', '/properties/achimota-bungalow-hometrust/07.webp', 6 union all
  select 'achimota-bungalow-hometrust', '/properties/achimota-bungalow-hometrust/08.webp', 7 union all
  -- Property 30: 11 images
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/01.webp', 0 union all
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/02.webp', 1 union all
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/03.webp', 2 union all
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/04.webp', 3 union all
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/05.webp', 4 union all
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/06.webp', 5 union all
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/07.webp', 6 union all
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/08.webp', 7 union all
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/09.webp', 8 union all
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/10.webp', 9 union all
  select 'achimota-acp-duplex-kingscity', '/properties/achimota-acp-duplex-kingscity/11.webp', 10 union all
  -- Property 31: 13 images
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/01.webp', 0 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/02.webp', 1 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/03.webp', 2 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/04.webp', 3 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/05.webp', 4 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/06.webp', 5 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/07.webp', 6 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/08.webp', 7 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/09.webp', 8 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/10.webp', 9 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/11.webp', 10 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/12.webp', 11 union all
  select 'achimota-tantra-hills-mansion-kingscity', '/properties/achimota-tantra-hills-mansion-kingscity/13.webp', 12 union all
  -- Property 32: 9 images
  select 'achimota-tantra-hills-duplex-rokoson', '/properties/achimota-tantra-hills-duplex-rokoson/01.webp', 0 union all
  select 'achimota-tantra-hills-duplex-rokoson', '/properties/achimota-tantra-hills-duplex-rokoson/02.webp', 1 union all
  select 'achimota-tantra-hills-duplex-rokoson', '/properties/achimota-tantra-hills-duplex-rokoson/03.webp', 2 union all
  select 'achimota-tantra-hills-duplex-rokoson', '/properties/achimota-tantra-hills-duplex-rokoson/04.webp', 3 union all
  select 'achimota-tantra-hills-duplex-rokoson', '/properties/achimota-tantra-hills-duplex-rokoson/05.webp', 4 union all
  select 'achimota-tantra-hills-duplex-rokoson', '/properties/achimota-tantra-hills-duplex-rokoson/06.webp', 5 union all
  select 'achimota-tantra-hills-duplex-rokoson', '/properties/achimota-tantra-hills-duplex-rokoson/07.webp', 6 union all
  select 'achimota-tantra-hills-duplex-rokoson', '/properties/achimota-tantra-hills-duplex-rokoson/08.webp', 7 union all
  select 'achimota-tantra-hills-duplex-rokoson', '/properties/achimota-tantra-hills-duplex-rokoson/09.webp', 8 union all
  -- Property 33: 12 images
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/01.webp', 0 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/02.webp', 1 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/03.webp', 2 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/04.webp', 3 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/05.webp', 4 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/06.webp', 5 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/07.webp', 6 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/08.webp', 7 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/09.webp', 8 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/10.webp', 9 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/11.webp', 10 union all
  select 'achimota-kingsby-duplex-hometrust', '/properties/achimota-kingsby-duplex-hometrust/12.webp', 11 union all
  -- Property 34: 6 images
  select 'achimota-golf-hills-duplex-haskaybright', '/properties/achimota-golf-hills-duplex-haskaybright/01.webp', 0 union all
  select 'achimota-golf-hills-duplex-haskaybright', '/properties/achimota-golf-hills-duplex-haskaybright/02.webp', 1 union all
  select 'achimota-golf-hills-duplex-haskaybright', '/properties/achimota-golf-hills-duplex-haskaybright/03.webp', 2 union all
  select 'achimota-golf-hills-duplex-haskaybright', '/properties/achimota-golf-hills-duplex-haskaybright/04.webp', 3 union all
  select 'achimota-golf-hills-duplex-haskaybright', '/properties/achimota-golf-hills-duplex-haskaybright/05.webp', 4 union all
  select 'achimota-golf-hills-duplex-haskaybright', '/properties/achimota-golf-hills-duplex-haskaybright/06.webp', 5 union all
  -- Property 35: 8 images
  select 'achimota-tantra-hills-villa-appiah', '/properties/achimota-tantra-hills-villa-appiah/01.webp', 0 union all
  select 'achimota-tantra-hills-villa-appiah', '/properties/achimota-tantra-hills-villa-appiah/02.webp', 1 union all
  select 'achimota-tantra-hills-villa-appiah', '/properties/achimota-tantra-hills-villa-appiah/03.webp', 2 union all
  select 'achimota-tantra-hills-villa-appiah', '/properties/achimota-tantra-hills-villa-appiah/04.webp', 3 union all
  select 'achimota-tantra-hills-villa-appiah', '/properties/achimota-tantra-hills-villa-appiah/05.webp', 4 union all
  select 'achimota-tantra-hills-villa-appiah', '/properties/achimota-tantra-hills-villa-appiah/06.webp', 5 union all
  select 'achimota-tantra-hills-villa-appiah', '/properties/achimota-tantra-hills-villa-appiah/07.webp', 6 union all
  select 'achimota-tantra-hills-villa-appiah', '/properties/achimota-tantra-hills-villa-appiah/08.webp', 7 union all
  -- Property 36: 12 images
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/01.webp', 0 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/02.webp', 1 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/03.webp', 2 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/04.webp', 3 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/05.webp', 4 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/06.webp', 5 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/07.webp', 6 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/08.webp', 7 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/09.webp', 8 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/10.webp', 9 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/11.webp', 10 union all
  select 'achimota-mile7-townhouse-kingscity', '/properties/achimota-mile7-townhouse-kingscity/12.webp', 11
) t(property_id, url, sort)
on conflict do nothing;

-- 4. Insert green_features (Balcony for properties 27-29, 31-36; property 29 also gets a second feature)
insert into property_green_features (property_id, label, icon)
select * from (
  select 'achimota-tantra-hills-bungalow-unitedhomes', 'Balcony', 'leaf' union all
  select 'achimota-villa-unitedhomes', 'Balcony', 'leaf' union all
  select 'achimota-bungalow-hometrust', 'Balcony', 'leaf' union all
  select 'achimota-bungalow-hometrust', 'Mature trees, lawn and landscaping', 'leaf' union all
  select 'achimota-acp-duplex-kingscity', 'Balcony', 'leaf' union all
  select 'achimota-tantra-hills-mansion-kingscity', 'Balcony', 'leaf' union all
  select 'achimota-tantra-hills-duplex-rokoson', 'Balcony', 'leaf' union all
  select 'achimota-kingsby-duplex-hometrust', 'Balcony', 'leaf' union all
  select 'achimota-golf-hills-duplex-haskaybright', 'Balcony', 'leaf' union all
  select 'achimota-tantra-hills-villa-appiah', 'Balcony', 'leaf' union all
  select 'achimota-mile7-townhouse-kingscity', 'Balcony', 'leaf'
) t(property_id, label, icon)
on conflict do nothing;
