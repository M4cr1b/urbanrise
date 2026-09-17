-- Add properties 19–26 (Achimota batch)
-- Includes new agents, properties, media, and green features

-- 1. Insert agents (if not already present)
insert into agents (name, firm, phone, secondary_phone)
select 'VP Property Consult', 'VP Property Consult', '+233206151937', null
where not exists (select 1 from agents where firm = 'VP Property Consult')
union all
select 'Angela Nartey', 'Angela Nartey', '+233203262141', null
where not exists (select 1 from agents where firm = 'Angela Nartey')
union all
select 'Roger', 'Roger', '+233246252029', null
where not exists (select 1 from agents where firm = 'Roger')
union all
select 'Enb Trust', 'Enb Trust', '+233277383079', null
where not exists (select 1 from agents where firm = 'Enb Trust')
union all
select 'Engineer Edwin', 'Engineer Edwin', '+233545761934', '+233577009069'
where not exists (select 1 from agents where firm = 'Engineer Edwin')
union all
select 'Walako Real Estate', 'Walako Real Estate', '+233597831808', null
where not exists (select 1 from agents where firm = 'Walako Real Estate')
union all
select 'Eagle Eye Properties', 'Eagle Eye Properties', '+233503016162', null
where not exists (select 1 from agents where firm = 'Eagle Eye Properties')
on conflict do nothing;

-- 2. Insert properties
insert into properties (id, address, district, region, geom, type, style, storey, bedrooms, bathrooms, toilets, floor_area_sqm, plot_area_sqm, year_built, asking_price, listed_date, status, tenure, title_status, eco_rating, condition, furnishing, remaining_lease_terms, green_features_note, facilities, self_contained, agent_id, verified_by, summary, source_ref)
select * from (
  -- Property 19: Achimota Tantra Hills Villa (VP Property Consult)
  select
    'achimota-tantra-hills-villa-vpproperty'::text, 'Achimota Tantra Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1850, 5.6450), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 3, 3, 3, 105, null::numeric, null::numeric,
    3400000, '2026-09-15'::date, 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Kitchen Cabinets', 'Kitchen Shelf', 'Pop Ceiling', 'Pre-Paid Meter', 'Tiled Floor', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'VP Property Consult' limit 1), null, '3-bed villa in Achimota Tantra Hills.',
    'seed:achimota-tantra-hills-villa-vpproperty'
  union all
  -- Property 20: Achimota Villa (Angela Nartey)
  select
    'achimota-villa-nartey', 'Achimota', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1840, 5.6450), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 4, 5, 5, 300, null, null,
    3200000, '2026-09-15', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Dining Area', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Pop Ceiling', 'Pre-Paid Meter', 'Tiled Floor', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'Angela Nartey' limit 1), null, '4-bed villa in Achimota.',
    'seed:achimota-villa-nartey'
  union all
  -- Property 21: Achimota Kingsby Apartment (Roger)
  select
    'achimota-kingsby-apartment-roger', 'Achimota, Kingsby', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1870, 5.6430), 4326)::geography,
    'Apartment', 'Detached', 'Multi Storey', 4, 5, 5, 500, null, null,
    3400000, '2026-09-15', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony']::text[],
    true,
    (select id from agents where firm = 'Roger' limit 1), null, '4-bed apartment in Kingsby, self-contained.',
    'seed:achimota-kingsby-apartment-roger'
  union all
  -- Property 22: Achimota Duplex (Enb Trust)
  select
    'achimota-duplex-enbtrust', 'Achimota, Mile 7', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1825, 5.6470), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 4, 5, 1000, null, null,
    2970000, '2026-09-15', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Fairly Used', 'Unfurnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Pop Ceiling', 'Pre-Paid Meter', 'Tiled Floor', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'Enb Trust' limit 1), null, '4-bed duplex in Achimota Mile 7.',
    'seed:achimota-duplex-enbtrust'
  union all
  -- Property 23: Achimota Tantra Hills Duplex (Home Trust - III)
  select
    'achimota-tantra-hills-duplex-hometrust-iii', 'Achimota, Tantra Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1850, 5.6450), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 5, 5, 140, null, null,
    2700000, '2026-09-15', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['Kitchen Cabinets', '24-hour Electricity', 'Tiled Floor', 'Dining Area', 'Pop Ceiling', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Shelf', 'Pre-Paid Meter', 'Sectionals', 'Parking Space']::text[],
    false,
    (select id from agents where firm = 'Home Trust Properties Agency' limit 1), null, '4-bed duplex in Tantra Hills.',
    'seed:achimota-tantra-hills-duplex-hometrust-iii'
  union all
  -- Property 24: Achimota Duplex (Engineer Edwin)
  select
    'achimota-duplex-edwin', 'Achimota', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1840, 5.6450), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 4, 5, 100, null, null,
    3400000, '2026-09-15', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Fairly Used', 'Semi-Furnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Refrigerator']::text[],
    false,
    (select id from agents where firm = 'Engineer Edwin' limit 1), null, '4-bed duplex in Achimota.',
    'seed:achimota-duplex-edwin'
  union all
  -- Property 25: Achimota Tantra Hills Villa (Walako Real Estate)
  select
    'achimota-tantra-hills-villa-walako', 'Achimota, Tantra Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1850, 5.6450), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 4, 5, 5, 100, null, null,
    3400000, '2026-09-15', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['Fitted Kitchen', 'Tiled Floor', 'Dining Area', '24-hour Electricity', 'Pop Ceiling', 'Air Conditioning', 'Balcony', 'Borehole', 'CCTV', 'Chandelier', 'Dishwasher', 'En Suite Bathroom', 'Hot Water', 'Pre-Paid Meter']::text[],
    false,
    (select id from agents where firm = 'Walako Real Estate' limit 1), null, '4-bed villa in Tantra Hills.',
    'seed:achimota-tantra-hills-villa-walako'
  union all
  -- Property 26: Achimota Tantra Hills Villa (Eagle Eye Properties)
  select
    'achimota-tantra-hills-villa-eagleeye', 'Achimota, Tantra Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1850, 5.6450), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 3, 3, 4, 198, null, null,
    2100000, '2026-09-15', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Dining Area', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Refrigerator', 'Tiled Floor', 'TV', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'Eagle Eye Properties' limit 1), null, '3-bed villa in Tantra Hills.',
    'seed:achimota-tantra-hills-villa-eagleeye'
) t(id, address, district, region, geom, type, style, storey, bedrooms, bathrooms, toilets, floor_area_sqm, plot_area_sqm, year_built, asking_price, listed_date, status, tenure, title_status, eco_rating, condition, furnishing, remaining_lease_terms, green_features_note, facilities, self_contained, agent_id, verified_by, summary, source_ref)
on conflict (id) do nothing;

-- 3. Insert property_media rows (images, pre-ordered with exterior at 01.webp/sort=0)
insert into property_media (property_id, url, sort)
select * from (
  -- Property 19: 9 images
  select 'achimota-tantra-hills-villa-vpproperty', '/properties/achimota-tantra-hills-villa-vpproperty/01.webp', 0 union all
  select 'achimota-tantra-hills-villa-vpproperty', '/properties/achimota-tantra-hills-villa-vpproperty/02.webp', 1 union all
  select 'achimota-tantra-hills-villa-vpproperty', '/properties/achimota-tantra-hills-villa-vpproperty/03.webp', 2 union all
  select 'achimota-tantra-hills-villa-vpproperty', '/properties/achimota-tantra-hills-villa-vpproperty/04.webp', 3 union all
  select 'achimota-tantra-hills-villa-vpproperty', '/properties/achimota-tantra-hills-villa-vpproperty/05.webp', 4 union all
  select 'achimota-tantra-hills-villa-vpproperty', '/properties/achimota-tantra-hills-villa-vpproperty/06.webp', 5 union all
  select 'achimota-tantra-hills-villa-vpproperty', '/properties/achimota-tantra-hills-villa-vpproperty/07.webp', 6 union all
  select 'achimota-tantra-hills-villa-vpproperty', '/properties/achimota-tantra-hills-villa-vpproperty/08.webp', 7 union all
  select 'achimota-tantra-hills-villa-vpproperty', '/properties/achimota-tantra-hills-villa-vpproperty/09.webp', 8 union all
  -- Property 20: 11 images
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/01.webp', 0 union all
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/02.webp', 1 union all
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/03.webp', 2 union all
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/04.webp', 3 union all
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/05.webp', 4 union all
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/06.webp', 5 union all
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/07.webp', 6 union all
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/08.webp', 7 union all
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/09.webp', 8 union all
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/10.webp', 9 union all
  select 'achimota-villa-nartey', '/properties/achimota-villa-nartey/11.webp', 10 union all
  -- Property 21: 10 images (duplicate 59055442 excluded)
  select 'achimota-kingsby-apartment-roger', '/properties/achimota-kingsby-apartment-roger/01.webp', 0 union all
  select 'achimota-kingsby-apartment-roger', '/properties/achimota-kingsby-apartment-roger/02.webp', 1 union all
  select 'achimota-kingsby-apartment-roger', '/properties/achimota-kingsby-apartment-roger/03.webp', 2 union all
  select 'achimota-kingsby-apartment-roger', '/properties/achimota-kingsby-apartment-roger/04.webp', 3 union all
  select 'achimota-kingsby-apartment-roger', '/properties/achimota-kingsby-apartment-roger/05.webp', 4 union all
  select 'achimota-kingsby-apartment-roger', '/properties/achimota-kingsby-apartment-roger/06.webp', 5 union all
  select 'achimota-kingsby-apartment-roger', '/properties/achimota-kingsby-apartment-roger/07.webp', 6 union all
  select 'achimota-kingsby-apartment-roger', '/properties/achimota-kingsby-apartment-roger/08.webp', 7 union all
  select 'achimota-kingsby-apartment-roger', '/properties/achimota-kingsby-apartment-roger/09.webp', 8 union all
  select 'achimota-kingsby-apartment-roger', '/properties/achimota-kingsby-apartment-roger/10.webp', 9 union all
  -- Property 22: 10 images
  select 'achimota-duplex-enbtrust', '/properties/achimota-duplex-enbtrust/01.webp', 0 union all
  select 'achimota-duplex-enbtrust', '/properties/achimota-duplex-enbtrust/02.webp', 1 union all
  select 'achimota-duplex-enbtrust', '/properties/achimota-duplex-enbtrust/03.webp', 2 union all
  select 'achimota-duplex-enbtrust', '/properties/achimota-duplex-enbtrust/04.webp', 3 union all
  select 'achimota-duplex-enbtrust', '/properties/achimota-duplex-enbtrust/05.webp', 4 union all
  select 'achimota-duplex-enbtrust', '/properties/achimota-duplex-enbtrust/06.webp', 5 union all
  select 'achimota-duplex-enbtrust', '/properties/achimota-duplex-enbtrust/07.webp', 6 union all
  select 'achimota-duplex-enbtrust', '/properties/achimota-duplex-enbtrust/08.webp', 7 union all
  select 'achimota-duplex-enbtrust', '/properties/achimota-duplex-enbtrust/09.webp', 8 union all
  select 'achimota-duplex-enbtrust', '/properties/achimota-duplex-enbtrust/10.webp', 9 union all
  -- Property 23: 8 images
  select 'achimota-tantra-hills-duplex-hometrust-iii', '/properties/achimota-tantra-hills-duplex-hometrust-iii/01.webp', 0 union all
  select 'achimota-tantra-hills-duplex-hometrust-iii', '/properties/achimota-tantra-hills-duplex-hometrust-iii/02.webp', 1 union all
  select 'achimota-tantra-hills-duplex-hometrust-iii', '/properties/achimota-tantra-hills-duplex-hometrust-iii/03.webp', 2 union all
  select 'achimota-tantra-hills-duplex-hometrust-iii', '/properties/achimota-tantra-hills-duplex-hometrust-iii/04.webp', 3 union all
  select 'achimota-tantra-hills-duplex-hometrust-iii', '/properties/achimota-tantra-hills-duplex-hometrust-iii/05.webp', 4 union all
  select 'achimota-tantra-hills-duplex-hometrust-iii', '/properties/achimota-tantra-hills-duplex-hometrust-iii/06.webp', 5 union all
  select 'achimota-tantra-hills-duplex-hometrust-iii', '/properties/achimota-tantra-hills-duplex-hometrust-iii/07.webp', 6 union all
  select 'achimota-tantra-hills-duplex-hometrust-iii', '/properties/achimota-tantra-hills-duplex-hometrust-iii/08.webp', 7 union all
  -- Property 24: 12 images
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/01.webp', 0 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/02.webp', 1 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/03.webp', 2 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/04.webp', 3 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/05.webp', 4 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/06.webp', 5 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/07.webp', 6 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/08.webp', 7 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/09.webp', 8 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/10.webp', 9 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/11.webp', 10 union all
  select 'achimota-duplex-edwin', '/properties/achimota-duplex-edwin/12.webp', 11 union all
  -- Property 25: 11 images
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/01.webp', 0 union all
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/02.webp', 1 union all
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/03.webp', 2 union all
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/04.webp', 3 union all
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/05.webp', 4 union all
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/06.webp', 5 union all
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/07.webp', 6 union all
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/08.webp', 7 union all
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/09.webp', 8 union all
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/10.webp', 9 union all
  select 'achimota-tantra-hills-villa-walako', '/properties/achimota-tantra-hills-villa-walako/11.webp', 10 union all
  -- Property 26: 6 images
  select 'achimota-tantra-hills-villa-eagleeye', '/properties/achimota-tantra-hills-villa-eagleeye/01.webp', 0 union all
  select 'achimota-tantra-hills-villa-eagleeye', '/properties/achimota-tantra-hills-villa-eagleeye/02.webp', 1 union all
  select 'achimota-tantra-hills-villa-eagleeye', '/properties/achimota-tantra-hills-villa-eagleeye/03.webp', 2 union all
  select 'achimota-tantra-hills-villa-eagleeye', '/properties/achimota-tantra-hills-villa-eagleeye/04.webp', 3 union all
  select 'achimota-tantra-hills-villa-eagleeye', '/properties/achimota-tantra-hills-villa-eagleeye/05.webp', 4 union all
  select 'achimota-tantra-hills-villa-eagleeye', '/properties/achimota-tantra-hills-villa-eagleeye/06.webp', 5
) t(property_id, url, sort)
on conflict do nothing;

-- 4. Insert green_features (Balcony for all properties 19–26 except 19 which has no green feature)
insert into property_green_features (property_id, label, icon)
select * from (
  select 'achimota-villa-nartey', 'Balcony', 'leaf' union all
  select 'achimota-kingsby-apartment-roger', 'Balcony', 'leaf' union all
  select 'achimota-duplex-enbtrust', 'Balcony', 'leaf' union all
  select 'achimota-tantra-hills-duplex-hometrust-iii', 'Balcony', 'leaf' union all
  select 'achimota-duplex-edwin', 'Balcony', 'leaf' union all
  select 'achimota-tantra-hills-villa-walako', 'Balcony', 'leaf' union all
  select 'achimota-tantra-hills-villa-eagleeye', 'Balcony', 'leaf'
) t(property_id, label, icon)
on conflict do nothing;
