-- Add 4 new properties (Properties 5, 6, 8, 10 from URBAN RISE NEW PROPERTY DETAILS)
-- These properties include new agents not yet in the system.

-- First, ensure all agents exist
insert into agents (name, firm, phone, ghis_verified)
values
  ('Charclem Ventures', 'Charclem Ventures', '+233591558402', false),
  ('Home Trust Properties Agency', 'Home Trust Properties Agency', '+233550899856', false),
  ('Mr Fred', 'Mr Fred', '+233244833160', false),
  ('Encore Properties', 'Encore Properties', '+233598870757', false)
on conflict (firm) do nothing;

-- Insert the 4 new properties
insert into properties (
  id, address, locality, district, region, geom,
  type, style, bedrooms, bathrooms, floor_area_sqm, plot_area_sqm, year_built,
  asking_price, listed_date, status, tenure, title_status, eco_rating,
  agent_id, verified_by, summary, source_ref
)
values
  ('cantonments-villa-charclem', 'Cantonments', 'Cantonments', 'La Dade Kotopon Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1899, 5.6289), 4326)::geography,
    'Villa', 'Detached', 4, 4, 150, null, 2025,
    16137277, '2026-09-08', 'Available', 'Leasehold 99yr', 'Unknown', 'C',
    (select id from agents where firm = 'Charclem Ventures' limit 1), null,
    'Four-bedroom, four-bathroom semi-furnished villa in Cantonments, completed 2025 on a 99-year lease. Premium finishes including swimming pool, solar power, CCTV security, and full air conditioning.',
    'seed:cantonments-villa-charclem'),
  ('adjiringanor-mansion-stardom', 'Adjiringanor', 'Adjiringanor', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1340291, 5.6457856), 4326)::geography,
    'Mansion', 'Detached', 4, 4, 2500, null, 2025,
    11625000, '2026-09-08', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    (select id from agents where firm = 'Stardom Real Estate' limit 1), null,
    'Four-bedroom, four-bathroom semi-furnished mansion in Adjiringanor, completed 2025 on a 99-year lease. Spacious 2500 sqm property with air conditioning, balcony, chandelier, and fully fitted kitchen.',
    'seed:adjiringanor-mansion-stardom'),
  ('east-legon-trasacco-villa', 'East Legon-West Trasacco', 'East Legon-West Trasacco', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1135, 5.6850), 4326)::geography,
    'Villa', 'Detached', 4, 4, 150, null, 2025,
    5212474, '2026-09-08', 'Available', 'Leasehold 99yr', 'Unknown', 'B',
    (select id from agents where firm = 'Charclem Ventures' limit 1), null,
    'Four-bedroom, four-bathroom furnished villa in East Legon-West Trasacco, completed 2025 on a 99-year lease. Premium features include solar-powered outdoor lighting, landscaped vegetation, chandelier, and 24-hour electricity.',
    'seed:east-legon-trasacco-villa'),
  ('adjiringanor-duplex-hometrust', 'Adjiringanor', 'Adjiringanor', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1340291, 5.6457856), 4326)::geography,
    'Duplex', 'Detached', 4, 4, 150, null, 2025,
    4500000, '2026-09-08', 'Available', 'Leasehold 99yr', 'Unknown', 'C',
    (select id from agents where firm = 'Home Trust Properties Agency' limit 1), null,
    'Four-bedroom, four-bathroom unfurnished duplex in Adjiringanor, completed 2025 on a 99-year lease. Features include large first-floor balcony with glass railing, dishwasher, and modern appliances.',
    'seed:adjiringanor-duplex-hometrust')
on conflict do nothing;

-- Insert media for each new property
insert into property_media (property_id, url, sort)
select * from (
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
  select 'east-legon-trasacco-villa', '/properties/east-legon-trasacco-villa/01.webp', 0 union all
  select 'east-legon-trasacco-villa', '/properties/east-legon-trasacco-villa/02.webp', 1 union all
  select 'east-legon-trasacco-villa', '/properties/east-legon-trasacco-villa/03.webp', 2 union all
  select 'east-legon-trasacco-villa', '/properties/east-legon-trasacco-villa/04.webp', 3 union all
  select 'east-legon-trasacco-villa', '/properties/east-legon-trasacco-villa/05.webp', 4 union all
  select 'east-legon-trasacco-villa', '/properties/east-legon-trasacco-villa/06.webp', 5 union all
  select 'east-legon-trasacco-villa', '/properties/east-legon-trasacco-villa/07.webp', 6 union all
  select 'east-legon-trasacco-villa', '/properties/east-legon-trasacco-villa/08.webp', 7 union all
  select 'east-legon-trasacco-villa', '/properties/east-legon-trasacco-villa/09.webp', 8 union all
  select 'east-legon-trasacco-villa', '/properties/east-legon-trasacco-villa/10.webp', 9 union all
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
