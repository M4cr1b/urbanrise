-- Add Properties 1-4 from URBAN RISE NEW PROPERTY DETAILS.docx
-- These properties come from Desktop source and are new to the system

-- First, ensure agents exist (idempotent via WHERE NOT EXISTS)
insert into agents (name, firm, phone, ghis_verified)
select 'Stardom Real Estate', 'Stardom Real Estate', '+233272169194', false
where not exists (select 1 from agents where firm = 'Stardom Real Estate')
union all
select 'Encore Properties', 'Encore Properties', '+233598870757', false
where not exists (select 1 from agents where firm = 'Encore Properties');

-- Insert the 4 new properties
insert into properties (
  id, address, locality, district, region, geom,
  type, style, storey, bedrooms, bathrooms, toilets, floor_area_sqm, plot_area_sqm, year_built,
  asking_price, listed_date, status, tenure, title_status, eco_rating,
  condition, remaining_lease_terms, green_features_note,
  agent_id, verified_by, summary, source_ref
)
values
  ('east-legon-hills-duplex-stardom', 'East Legon Hills', 'East Legon Hills', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1004742, 5.6927588), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 4, 5, 850, null, 2025,
    2780000, '2026-09-10', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Not specified', 'Not specified',
    (select id from agents where firm = 'Stardom Real Estate' limit 1), null,
    'Four-bedroom, four-bathroom semi-furnished duplex in East Legon Hills, completed 2025 on a 99-year lease. Features air conditioning, balcony, dining area, fitted kitchen, and tiled floors.',
    'seed:east-legon-hills-duplex-stardom'),
  ('adjiringanor-duplex-stardom', 'Adjiringanor', 'Adjiringanor', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1340291, 5.6457856), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 3, 3, 4, 700, null, 2025,
    2070000, '2026-09-10', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Not specified', 'Not specified',
    (select id from agents where firm = 'Stardom Real Estate' limit 1), null,
    'Three-bedroom, three-bathroom semi-furnished duplex in Adjiringanor, completed 2025 on a 99-year lease. Modern amenities including air conditioning, balcony, pre-paid meter, and car park.',
    'seed:adjiringanor-duplex-stardom'),
  ('adjiringanor-villa-encore', 'Adjiringanor', 'Adjiringanor', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1340291, 5.6457856), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 5, 5, 5, 500, null, 2025,
    6050000, '2026-09-10', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Not specified', 'Balcony',
    (select id from agents where firm = 'Encore Properties' limit 1), null,
    'Five-bedroom, five-bathroom semi-furnished modern luxury villa in Adjiringanor, completed 2025 on a 99-year lease. Premium finishes with air conditioning, balcony, dining area, and pop ceiling.',
    'seed:adjiringanor-villa-encore'),
  ('cantonments-mansion-stardom', 'Cantonments', 'Cantonments', 'La Dade Kotopon Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1899, 5.6289), 4326)::geography,
    'Mansion', 'Semi-Detached', 'Multi Storey', 5, 5, 5, 900, null, 2025,
    17250000, '2026-09-10', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Not specified', 'Balcony',
    (select id from agents where firm = 'Stardom Real Estate' limit 1), null,
    'Five-bedroom, five-bathroom semi-furnished mansion in Cantonments, completed 2025 on a 99-year lease. Luxury features include chandelier, dishwasher, full air conditioning, fitted kitchen, and premium appliances.',
    'seed:cantonments-mansion-stardom')
on conflict (id) do nothing;

-- Insert media for each new property
insert into property_media (property_id, url, sort)
select * from (
  -- Property 1: east-legon-hills-duplex-stardom (13 images)
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/01.webp', 0 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/02.webp', 1 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/03.webp', 2 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/04.webp', 3 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/05.webp', 4 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/06.webp', 5 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/07.webp', 6 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/08.webp', 7 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/09.webp', 8 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/10.webp', 9 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/11.webp', 10 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/12.webp', 11 union all
  select 'east-legon-hills-duplex-stardom', '/properties/east-legon-hills-duplex-stardom/13.webp', 12 union all
  -- Property 2: adjiringanor-duplex-stardom (9 images)
  select 'adjiringanor-duplex-stardom', '/properties/adjiringanor-duplex-stardom/01.webp', 0 union all
  select 'adjiringanor-duplex-stardom', '/properties/adjiringanor-duplex-stardom/02.webp', 1 union all
  select 'adjiringanor-duplex-stardom', '/properties/adjiringanor-duplex-stardom/03.webp', 2 union all
  select 'adjiringanor-duplex-stardom', '/properties/adjiringanor-duplex-stardom/04.webp', 3 union all
  select 'adjiringanor-duplex-stardom', '/properties/adjiringanor-duplex-stardom/05.webp', 4 union all
  select 'adjiringanor-duplex-stardom', '/properties/adjiringanor-duplex-stardom/06.webp', 5 union all
  select 'adjiringanor-duplex-stardom', '/properties/adjiringanor-duplex-stardom/07.webp', 6 union all
  select 'adjiringanor-duplex-stardom', '/properties/adjiringanor-duplex-stardom/08.webp', 7 union all
  select 'adjiringanor-duplex-stardom', '/properties/adjiringanor-duplex-stardom/09.webp', 8 union all
  -- Property 3: adjiringanor-villa-encore (11 images)
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/01.webp', 0 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/02.webp', 1 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/03.webp', 2 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/04.webp', 3 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/05.webp', 4 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/06.webp', 5 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/07.webp', 6 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/08.webp', 7 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/09.webp', 8 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/10.webp', 9 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/11.webp', 10 union all
  -- Property 4: cantonments-mansion-stardom (18 images)
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/01.webp', 0 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/02.webp', 1 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/03.webp', 2 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/04.webp', 3 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/05.webp', 4 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/06.webp', 5 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/07.webp', 6 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/08.webp', 7 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/09.webp', 8 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/10.webp', 9 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/11.webp', 10 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/12.webp', 11 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/13.webp', 12 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/14.webp', 13 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/15.webp', 14 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/16.webp', 15 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/17.webp', 16 union all
  select 'cantonments-mansion-stardom', '/properties/cantonments-mansion-stardom/18.webp', 17
) t(property_id, url, sort)
on conflict do nothing;
