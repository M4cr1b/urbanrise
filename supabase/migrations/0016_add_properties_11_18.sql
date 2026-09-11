-- Add properties 11–18 (8 new listings)
-- Follows the same pattern as 0014_add_properties_1_4_and_facilities.sql
-- Images pre-copied via scripts/copy-properties-11-18.mjs (byte-for-byte, no processing)

-- 1. Insert new agents (idempotent)
insert into agents (name, firm, phone, ghis_verified)
select 'Ace Holding', 'Ace Holding', '+233205504307', false
where not exists (select 1 from agents where firm = 'Ace Holding')
union all
select 'Save Hands Properties', 'Save Hands Properties', '+233591005469', false
where not exists (select 1 from agents where firm = 'Save Hands Properties')
union all
select 'Home Trust Properties Agency', 'Home Trust Properties Agency', '+233550899856', false
where not exists (select 1 from agents where firm = 'Home Trust Properties Agency')
union all
select 'Greenyard Properties Inc', 'Greenyard Properties Inc', '+233554262896', false
where not exists (select 1 from agents where firm = 'Greenyard Properties Inc')
union all
select 'Justice', 'Justice', '+233241334768', false
where not exists (select 1 from agents where firm = 'Justice')
union all
select 'United Homes', 'United Homes', '+233545640939', false
where not exists (select 1 from agents where firm = 'United Homes')
union all
select 'Seekers Realty', 'Seekers Realty', '+233245142942', false
where not exists (select 1 from agents where firm = 'Seekers Realty')
on conflict do nothing;

-- 2. Insert properties 11–18
insert into properties (
  id, address, district, region, geom,
  type, style, storey, bedrooms, bathrooms, toilets, floor_area_sqm, plot_area_sqm, year_built,
  asking_price, listed_date, status, tenure, title_status, eco_rating,
  condition, furnishing, remaining_lease_terms, green_features_note, facilities, self_contained,
  agent_id, verified_by, summary, source_ref
)
select * from (
  -- Property 11: East Legon Hills Mansion
  select
    'east-legon-hills-mansion-aceholding'::text, 'East Legon Hills', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1689, 5.6281), 4326)::geography,
    'Mansion', 'Detached', 'Multi Storey', 5, 5, 6, 500, null::numeric, null::numeric,
    7517000, '2026-09-11'::date, 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Furnished', 'Not specified', null,
    array['Kitchen Cabinets', 'Tiled Floor', 'Dining Area', 'Pop Ceiling', 'Air Conditioning', 'Balcony', 'CCTV', 'Chandelier', 'Dishwasher', 'En Suite', 'Wardrobe', 'Wi-Fi', 'TV', 'Swimming Pool', 'Sectionals', 'Refrigerator', 'Pre-Paid Meter', 'Microwave', 'Kitchen Shelf', 'Hot Water']::text[],
    false,
    (select id from agents where firm = 'Ace Holding' limit 1), null, 'Luxury 5-bed mansion in East Legon Hills, furnished, swimming pool.',
    'seed:east-legon-hills-mansion-aceholding'
  union all
  -- Property 12: Adjiriganor Apartment
  select
    'adjiriganor-apartment-savehands', 'Adjiriganor', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1745, 5.6210), 4326)::geography,
    'Apartment', 'Detached', 'Multi Storey', 6, 6, 6, 100, null, null,
    7223973, '2026-09-11', 'Available', 'Leasehold', 'Unknown', 'D',
    'Newly Built', 'Semi-Furnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Refrigerator', 'Sectionals', 'Tiled Floor', 'TV', 'Wardrobe', 'Wi-Fi', 'Parking Space']::text[],
    false,
    (select id from agents where firm = 'Save Hands Properties' limit 1), null, 'Modern 6-bed apartment in Adjiriganor, semi-furnished.',
    'seed:adjiriganor-apartment-savehands'
  union all
  -- Property 13: Achimota Tantra Hills Duplex
  select
    'achimota-tantra-hills-duplex-hometrust', 'Achimota Tantra Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1850, 5.6450), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 4, 5, 140, null, null,
    3500000, '2026-09-11', 'Available', 'Leasehold', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Pop Ceiling', 'Pre-Paid Meter', 'Sectionals', 'Tiled Floor', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'Home Trust Properties Agency' limit 1), null, '4-bed duplex in Achimota Tantra Hills, unfurnished.',
    'seed:achimota-tantra-hills-duplex-hometrust'
  union all
  -- Property 14: Achimota Mill 7 Mansion
  select
    'achimota-mansion-greenyard', 'Achimota Mill 7', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1825, 5.6470), 4326)::geography,
    'Mansion', 'Detached', 'Multi Storey', 5, 5, 6, 2000, null, null,
    5500000, '2026-09-11', 'Available', 'Leasehold', 'Unknown', 'D',
    'Newly Built', 'Semi-Furnished', 'Not specified', null,
    array['Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Refrigerator', 'Sectionals', 'Tiled Floor', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'Greenyard Properties Inc' limit 1), null, 'Spacious 5-bed mansion on 2000 sqm plot, semi-furnished.',
    'seed:achimota-mansion-greenyard'
  union all
  -- Property 15: Achimota Kingsby Villa
  select
    'achimota-kingsby-villa-justice', 'Achimota, Kingsby', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1870, 5.6430), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 3, 3, 3, 850, null, null,
    2200000, '2026-09-11', 'Available', 'Leasehold', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Tiled Floor', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'Justice' limit 1), null, '3-bed villa on 850 sqm, unfurnished.',
    'seed:achimota-kingsby-villa-justice'
  union all
  -- Property 16: Achimota Duplex (United Homes)
  select
    'achimota-duplex-unitedhomes', 'Achimota', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1840, 5.6450), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 6, 6, 6, 100, null, null,
    5400000, '2026-09-11', 'Available', 'Leasehold', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Dining Area', 'Dishwasher', 'En Suite', 'Kitchen Cabinets', 'Kitchen Shelf', 'Pop Ceiling', 'Pre-Paid Meter', 'Tiled Floor', 'Sectionals', 'Wardrobe']::text[],
    true,
    (select id from agents where firm = 'United Homes' limit 1), null, '6-bed duplex, self-contained, unfurnished.',
    'seed:achimota-duplex-unitedhomes'
  union all
  -- Property 17: Achimota Tantra Hills Duplex II (Home Trust - second property)
  select
    'achimota-tantra-hills-duplex-hometrust-ii', 'Achimota Tranta Hills', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1850, 5.6450), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 4, 5, 160, null, null,
    3000000, '2026-09-11', 'Available', 'Leasehold', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['Kitchen Cabinets', '24-hour Electricity', 'Tiled Floor', 'Dining Area', 'Pop Ceiling', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Shelf', 'Microwave', 'Pre-Paid Meter', 'Refrigerator', 'Sectionals', 'Wardrobe']::text[],
    true,
    (select id from agents where firm = 'Home Trust Properties Agency' limit 1), null, '4-bed duplex, self-contained, unfurnished.',
    'seed:achimota-tantra-hills-duplex-hometrust-ii'
  union all
  -- Property 18: Achimota Villa (Seekers)
  select
    'achimota-villa-seekers', 'Achimota', 'Okaikwei North Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1840, 5.6450), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 5, 5, 5, 900, null, null,
    2760000, '2026-09-11', 'Available', 'Leasehold', 'Unknown', 'D',
    'Newly Built', 'Unfurnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Refrigerator', 'Sectionals', 'Tiled Floor', 'Wardrobe']::text[],
    false,
    (select id from agents where firm = 'Seekers Realty' limit 1), null, '5-bed villa on 900 sqm, unfurnished.',
    'seed:achimota-villa-seekers'
) t(id, address, district, region, geom, type, style, storey, bedrooms, bathrooms, toilets, floor_area_sqm, plot_area_sqm, year_built, asking_price, listed_date, status, tenure, title_status, eco_rating, condition, furnishing, remaining_lease_terms, green_features_note, facilities, self_contained, agent_id, verified_by, summary, source_ref)
on conflict (id) do nothing;

-- 3. Insert property_media rows (one per copied image, sorted)
insert into property_media (property_id, url, sort)
select * from (
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/01.webp', 0 union all
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/02.webp', 1 union all
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/03.webp', 2 union all
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/04.webp', 3 union all
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/05.webp', 4 union all
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/06.webp', 5 union all
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/07.webp', 6 union all
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/08.webp', 7 union all
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/09.webp', 8 union all
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/10.webp', 9 union all
  select 'east-legon-hills-mansion-aceholding', '/properties/east-legon-hills-mansion-aceholding/11.webp', 10 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/01.webp', 0 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/02.webp', 1 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/03.webp', 2 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/04.webp', 3 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/05.webp', 4 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/06.webp', 5 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/07.webp', 6 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/08.webp', 7 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/09.webp', 8 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/10.webp', 9 union all
  select 'adjiriganor-apartment-savehands', '/properties/adjiriganor-apartment-savehands/11.webp', 10 union all
  select 'achimota-tantra-hills-duplex-hometrust', '/properties/achimota-tantra-hills-duplex-hometrust/01.webp', 0 union all
  select 'achimota-tantra-hills-duplex-hometrust', '/properties/achimota-tantra-hills-duplex-hometrust/02.webp', 1 union all
  select 'achimota-tantra-hills-duplex-hometrust', '/properties/achimota-tantra-hills-duplex-hometrust/03.webp', 2 union all
  select 'achimota-tantra-hills-duplex-hometrust', '/properties/achimota-tantra-hills-duplex-hometrust/04.webp', 3 union all
  select 'achimota-tantra-hills-duplex-hometrust', '/properties/achimota-tantra-hills-duplex-hometrust/05.webp', 4 union all
  select 'achimota-tantra-hills-duplex-hometrust', '/properties/achimota-tantra-hills-duplex-hometrust/06.webp', 5 union all
  select 'achimota-tantra-hills-duplex-hometrust', '/properties/achimota-tantra-hills-duplex-hometrust/07.webp', 6 union all
  select 'achimota-tantra-hills-duplex-hometrust', '/properties/achimota-tantra-hills-duplex-hometrust/08.webp', 7 union all
  select 'achimota-tantra-hills-duplex-hometrust', '/properties/achimota-tantra-hills-duplex-hometrust/09.webp', 8 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/01.webp', 0 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/02.webp', 1 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/03.webp', 2 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/04.webp', 3 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/05.webp', 4 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/06.webp', 5 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/07.webp', 6 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/08.webp', 7 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/09.webp', 8 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/10.webp', 9 union all
  select 'achimota-mansion-greenyard', '/properties/achimota-mansion-greenyard/11.webp', 10 union all
  select 'achimota-kingsby-villa-justice', '/properties/achimota-kingsby-villa-justice/01.webp', 0 union all
  select 'achimota-kingsby-villa-justice', '/properties/achimota-kingsby-villa-justice/02.webp', 1 union all
  select 'achimota-kingsby-villa-justice', '/properties/achimota-kingsby-villa-justice/03.webp', 2 union all
  select 'achimota-kingsby-villa-justice', '/properties/achimota-kingsby-villa-justice/04.webp', 3 union all
  select 'achimota-kingsby-villa-justice', '/properties/achimota-kingsby-villa-justice/05.webp', 4 union all
  select 'achimota-kingsby-villa-justice', '/properties/achimota-kingsby-villa-justice/06.webp', 5 union all
  select 'achimota-kingsby-villa-justice', '/properties/achimota-kingsby-villa-justice/07.webp', 6 union all
  select 'achimota-kingsby-villa-justice', '/properties/achimota-kingsby-villa-justice/08.webp', 7 union all
  select 'achimota-kingsby-villa-justice', '/properties/achimota-kingsby-villa-justice/09.webp', 8 union all
  select 'achimota-duplex-unitedhomes', '/properties/achimota-duplex-unitedhomes/01.webp', 0 union all
  select 'achimota-duplex-unitedhomes', '/properties/achimota-duplex-unitedhomes/02.webp', 1 union all
  select 'achimota-duplex-unitedhomes', '/properties/achimota-duplex-unitedhomes/03.webp', 2 union all
  select 'achimota-duplex-unitedhomes', '/properties/achimota-duplex-unitedhomes/04.webp', 3 union all
  select 'achimota-duplex-unitedhomes', '/properties/achimota-duplex-unitedhomes/05.webp', 4 union all
  select 'achimota-duplex-unitedhomes', '/properties/achimota-duplex-unitedhomes/06.webp', 5 union all
  select 'achimota-duplex-unitedhomes', '/properties/achimota-duplex-unitedhomes/07.webp', 6 union all
  select 'achimota-duplex-unitedhomes', '/properties/achimota-duplex-unitedhomes/08.webp', 7 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/01.webp', 0 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/02.webp', 1 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/03.webp', 2 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/04.webp', 3 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/05.webp', 4 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/06.webp', 5 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/07.webp', 6 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/08.webp', 7 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/09.webp', 8 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/10.webp', 9 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/11.webp', 10 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/12.webp', 11 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/13.webp', 12 union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', '/properties/achimota-tantra-hills-duplex-hometrust-ii/14.webp', 13 union all
  select 'achimota-villa-seekers', '/properties/achimota-villa-seekers/01.webp', 0 union all
  select 'achimota-villa-seekers', '/properties/achimota-villa-seekers/02.webp', 1 union all
  select 'achimota-villa-seekers', '/properties/achimota-villa-seekers/03.webp', 2 union all
  select 'achimota-villa-seekers', '/properties/achimota-villa-seekers/04.webp', 3 union all
  select 'achimota-villa-seekers', '/properties/achimota-villa-seekers/05.webp', 4 union all
  select 'achimota-villa-seekers', '/properties/achimota-villa-seekers/06.webp', 5 union all
  select 'achimota-villa-seekers', '/properties/achimota-villa-seekers/07.webp', 6 union all
  select 'achimota-villa-seekers', '/properties/achimota-villa-seekers/08.webp', 7 union all
  select 'achimota-villa-seekers', '/properties/achimota-villa-seekers/09.webp', 8 union all
  select 'achimota-villa-seekers', '/properties/achimota-villa-seekers/10.webp', 9
) t(property_id, url, sort)
on conflict do nothing;

-- 4. Insert property_green_features (only for properties with green features != 'Not specified')
-- Properties 11, 12, 13, 14, 16, 17 have 'Balcony' green feature (icon: 'leaf')
-- Properties 15, 18 have no green features (skip)
insert into property_green_features (property_id, label, icon)
select * from (
  select 'east-legon-hills-mansion-aceholding', 'Balcony', 'leaf' union all
  select 'adjiriganor-apartment-savehands', 'Balcony', 'leaf' union all
  select 'achimota-tantra-hills-duplex-hometrust', 'Balcony', 'leaf' union all
  select 'achimota-mansion-greenyard', 'Balcony', 'leaf' union all
  select 'achimota-duplex-unitedhomes', 'Balcony', 'leaf' union all
  select 'achimota-tantra-hills-duplex-hometrust-ii', 'Balcony', 'leaf'
) t(property_id, label, icon)
on conflict do nothing;
