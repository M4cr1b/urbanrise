-- Add Properties 5-10 from URBAN RISE NEW PROPERTY DETAILS.docx
-- These 6 properties come from Desktop/assets source and are new to the system

-- First, ensure agents exist (idempotent via WHERE NOT EXISTS)
insert into agents (name, firm, phone, ghis_verified)
select 'Charclem Ventures', 'Charclem Ventures', '+233591558402', false
where not exists (select 1 from agents where firm = 'Charclem Ventures')
union all
select 'Mr Fred', 'Mr Fred', '+233244833160', false
where not exists (select 1 from agents where firm = 'Mr Fred')
union all
select 'Home Trust Properties Agency', 'Home Trust Properties Agency', '+233550899856', false
where not exists (select 1 from agents where firm = 'Home Trust Properties Agency');

-- Insert the 6 new properties
insert into properties (
  id, address, locality, district, region, geom,
  type, style, storey, bedrooms, bathrooms, toilets, floor_area_sqm, plot_area_sqm, year_built,
  asking_price, listed_date, status, tenure, title_status, eco_rating,
  condition, remaining_lease_terms, green_features_note,
  agent_id, verified_by, summary, source_ref
)
values
  ('cantonments-villa-charclem', 'Cantonments', 'Cantonments', 'La Dade Kotopon Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1899, 5.6289), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 4, 4, 5, 150, null, 2025,
    16137277, '2026-09-10', 'Available', 'Leasehold 99yr', 'Unknown', 'C',
    'Newly Built', 'Not specified', 'Solar Power, Balcony',
    (select id from agents where firm = 'Charclem Ventures' limit 1), null,
    'Four-bedroom, four-bathroom semi-furnished villa in Cantonments, completed 2025 on a 99-year lease. Premium features include solar power, swimming pool, gated community, and backup generator.',
    'seed:cantonments-villa-charclem'),
  ('adjiringanor-mansion-stardom', 'Adjiringanor', 'Adjiringanor', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1340291, 5.6457856), 4326)::geography,
    'Mansion', 'Detached', 'Multi Storey', 4, 4, 5, 2500, null, 2025,
    11625000, '2026-09-10', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Not specified', 'Balcony',
    (select id from agents where firm = 'Stardom Real Estate' limit 1), null,
    'Four-bedroom, four-bathroom semi-furnished mansion in Adjiringanor, completed 2025 on a 99-year lease. Features air conditioning, chandelier, dining area, and wardrobe.',
    'seed:adjiringanor-mansion-stardom'),
  ('east-legon-hills-townhouse-charclem', 'East Legon Hills', 'East Legon Hills', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1004742, 5.6927588), 4326)::geography,
    'Townhouse', 'Detached', 'Multi Storey', 3, 3, 4, null, null, null,
    2780000, '2026-09-10', 'Available', 'Leasehold 99yr', 'Unknown', 'C',
    'Fairly Good', 'Not specified', 'Landscaped greenery/vegetation, Balcony',
    (select id from agents where firm = 'Charclem Ventures' limit 1), null,
    'Three-bedroom, three-bathroom semi-furnished townhouse in East Legon Hills in fairly good condition on a 99-year lease. Modern amenities include air conditioning, balcony, and dining area.',
    'seed:east-legon-hills-townhouse-charclem'),
  ('east-legon-west-trasacco-villa-charclem', 'East Legon-West Trasacco', 'East Legon-West Trasacco', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1428, 5.6373), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 4, 4, 5, 150, null, 2025,
    5212474, '2026-09-10', 'Available', 'Leasehold 99yr', 'Unknown', 'B',
    'Newly-Built', 'Not specified', 'Landscaped vegetation, Solar-powered outdoor lighting, Balcony',
    (select id from agents where firm = 'Charclem Ventures' limit 1), null,
    'Four-bedroom, four-bathroom furnished villa in East Legon-West Trasacco, completed 2025 on a 99-year lease. Features solar-powered lighting, chandelier, en suite, and premium finishes.',
    'seed:east-legon-west-trasacco-villa-charclem'),
  ('east-legon-hills-villa-mrfred', 'East Legon Hills', 'East Legon Hills', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1004742, 5.6927588), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 5, 5, 5, 200, null, 2025,
    3700000, '2026-09-10', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly built', 'Not specified', 'None specified',
    (select id from agents where firm = 'Mr Fred' limit 1), null,
    'Five-bedroom, five-bathroom semi-furnished villa in East Legon Hills, completed 2025 on a 99-year lease. Features 24-hour electricity, dining area, and tiled floors.',
    'seed:east-legon-hills-villa-mrfred'),
  ('adjiringanor-duplex-hometrust', 'Adjiringanor', 'Adjiringanor', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1340291, 5.6457856), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 4, 5, 150, null, 2025,
    4500000, '2026-09-10', 'Available', 'Leasehold 99yr', 'Unknown', 'C',
    'Newly built', 'Not specified', 'Recessed/spot lighting is visible under the ceiling, Large first-floor balcony with glass railing',
    (select id from agents where firm = 'Home Trust Properties Agency' limit 1), null,
    'Four-bedroom, four-bathroom unfurnished duplex in Adjiringanor, completed 2025 on a 99-year lease. Features air conditioning, balcony, dishwasher, and modern finishes.',
    'seed:adjiringanor-duplex-hometrust')
on conflict (id) do nothing;

-- Insert media for each new property
insert into property_media (property_id, url, sort)
select * from (
  -- Property 5: cantonments-villa-charclem (11 images)
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/01.webp', 0 union all
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/02.webp', 1 union all
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/03.webp', 2 union all
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/04.webp', 3 union all
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/05.webp', 4 union all
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/06.webp', 5 union all
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/07.webp', 6 union all
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/08.webp', 7 union all
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/09.webp', 8 union all
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/10.webp', 9 union all
  select 'cantonments-villa-charclem', '/properties/cantonments-villa-charclem/11.webp', 10 union all
  -- Property 6: adjiringanor-mansion-stardom (10 images)
  select 'adjiringanor-mansion-stardom', '/properties/adjiringanor-mansion-stardom/01.webp', 0 union all
  select 'adjiringanor-mansion-stardom', '/properties/adjiringanor-mansion-stardom/02.webp', 1 union all
  select 'adjiringanor-mansion-stardom', '/properties/adjiringanor-mansion-stardom/03.webp', 2 union all
  select 'adjiringanor-mansion-stardom', '/properties/adjiringanor-mansion-stardom/04.webp', 3 union all
  select 'adjiringanor-mansion-stardom', '/properties/adjiringanor-mansion-stardom/05.webp', 4 union all
  select 'adjiringanor-mansion-stardom', '/properties/adjiringanor-mansion-stardom/06.webp', 5 union all
  select 'adjiringanor-mansion-stardom', '/properties/adjiringanor-mansion-stardom/07.webp', 6 union all
  select 'adjiringanor-mansion-stardom', '/properties/adjiringanor-mansion-stardom/08.webp', 7 union all
  select 'adjiringanor-mansion-stardom', '/properties/adjiringanor-mansion-stardom/09.webp', 8 union all
  select 'adjiringanor-mansion-stardom', '/properties/adjiringanor-mansion-stardom/10.webp', 9 union all
  -- Property 7: east-legon-hills-townhouse-charclem (5 images)
  select 'east-legon-hills-townhouse-charclem', '/properties/east-legon-hills-townhouse-charclem/01.webp', 0 union all
  select 'east-legon-hills-townhouse-charclem', '/properties/east-legon-hills-townhouse-charclem/02.webp', 1 union all
  select 'east-legon-hills-townhouse-charclem', '/properties/east-legon-hills-townhouse-charclem/03.webp', 2 union all
  select 'east-legon-hills-townhouse-charclem', '/properties/east-legon-hills-townhouse-charclem/04.webp', 3 union all
  select 'east-legon-hills-townhouse-charclem', '/properties/east-legon-hills-townhouse-charclem/05.webp', 4 union all
  -- Property 8: east-legon-west-trasacco-villa-charclem (10 images)
  select 'east-legon-west-trasacco-villa-charclem', '/properties/east-legon-west-trasacco-villa-charclem/01.webp', 0 union all
  select 'east-legon-west-trasacco-villa-charclem', '/properties/east-legon-west-trasacco-villa-charclem/02.webp', 1 union all
  select 'east-legon-west-trasacco-villa-charclem', '/properties/east-legon-west-trasacco-villa-charclem/03.webp', 2 union all
  select 'east-legon-west-trasacco-villa-charclem', '/properties/east-legon-west-trasacco-villa-charclem/04.webp', 3 union all
  select 'east-legon-west-trasacco-villa-charclem', '/properties/east-legon-west-trasacco-villa-charclem/05.webp', 4 union all
  select 'east-legon-west-trasacco-villa-charclem', '/properties/east-legon-west-trasacco-villa-charclem/06.webp', 5 union all
  select 'east-legon-west-trasacco-villa-charclem', '/properties/east-legon-west-trasacco-villa-charclem/07.webp', 6 union all
  select 'east-legon-west-trasacco-villa-charclem', '/properties/east-legon-west-trasacco-villa-charclem/08.webp', 7 union all
  select 'east-legon-west-trasacco-villa-charclem', '/properties/east-legon-west-trasacco-villa-charclem/09.webp', 8 union all
  select 'east-legon-west-trasacco-villa-charclem', '/properties/east-legon-west-trasacco-villa-charclem/10.webp', 9 union all
  -- Property 9: east-legon-hills-villa-mrfred (6 images)
  select 'east-legon-hills-villa-mrfred', '/properties/east-legon-hills-villa-mrfred/01.webp', 0 union all
  select 'east-legon-hills-villa-mrfred', '/properties/east-legon-hills-villa-mrfred/02.webp', 1 union all
  select 'east-legon-hills-villa-mrfred', '/properties/east-legon-hills-villa-mrfred/03.webp', 2 union all
  select 'east-legon-hills-villa-mrfred', '/properties/east-legon-hills-villa-mrfred/04.webp', 3 union all
  select 'east-legon-hills-villa-mrfred', '/properties/east-legon-hills-villa-mrfred/05.webp', 4 union all
  select 'east-legon-hills-villa-mrfred', '/properties/east-legon-hills-villa-mrfred/06.webp', 5 union all
  -- Property 10: adjiringanor-duplex-hometrust (10 images)
  select 'adjiringanor-duplex-hometrust', '/properties/adjiringanor-duplex-hometrust/01.webp', 0 union all
  select 'adjiringanor-duplex-hometrust', '/properties/adjiringanor-duplex-hometrust/02.webp', 1 union all
  select 'adjiringanor-duplex-hometrust', '/properties/adjiringanor-duplex-hometrust/03.webp', 2 union all
  select 'adjiringanor-duplex-hometrust', '/properties/adjiringanor-duplex-hometrust/04.webp', 3 union all
  select 'adjiringanor-duplex-hometrust', '/properties/adjiringanor-duplex-hometrust/05.webp', 4 union all
  select 'adjiringanor-duplex-hometrust', '/properties/adjiringanor-duplex-hometrust/06.webp', 5 union all
  select 'adjiringanor-duplex-hometrust', '/properties/adjiringanor-duplex-hometrust/07.webp', 6 union all
  select 'adjiringanor-duplex-hometrust', '/properties/adjiringanor-duplex-hometrust/08.webp', 7 union all
  select 'adjiringanor-duplex-hometrust', '/properties/adjiringanor-duplex-hometrust/09.webp', 8 union all
  select 'adjiringanor-duplex-hometrust', '/properties/adjiringanor-duplex-hometrust/10.webp', 9
) t(property_id, url, sort)
on conflict do nothing;

-- Insert green features for properties with actual green features
insert into property_green_features (property_id, label, icon)
select * from (
  -- Property 5: cantonments-villa-charclem
  select 'cantonments-villa-charclem', 'Solar Power', 'sun' union all
  select 'cantonments-villa-charclem', 'Balcony', 'leaf' union all
  -- Property 6: adjiringanor-mansion-stardom
  select 'adjiringanor-mansion-stardom', 'Balcony', 'leaf' union all
  -- Property 7: east-legon-hills-townhouse-charclem
  select 'east-legon-hills-townhouse-charclem', 'Landscaped greenery/vegetation', 'leaf' union all
  select 'east-legon-hills-townhouse-charclem', 'Balcony', 'leaf' union all
  -- Property 8: east-legon-west-trasacco-villa-charclem
  select 'east-legon-west-trasacco-villa-charclem', 'Landscaped vegetation', 'leaf' union all
  select 'east-legon-west-trasacco-villa-charclem', 'Solar-powered outdoor lighting', 'sun' union all
  select 'east-legon-west-trasacco-villa-charclem', 'Balcony', 'leaf' union all
  -- Property 10: adjiringanor-duplex-hometrust
  select 'adjiringanor-duplex-hometrust', 'Recessed/spot lighting', 'sun' union all
  select 'adjiringanor-duplex-hometrust', 'Large first-floor balcony with glass railing', 'leaf'
) t(property_id, label, icon)
on conflict do nothing;
