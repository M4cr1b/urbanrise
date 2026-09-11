-- Add the 4 missing properties (1-4) and wire up facilities & self_contained
-- These properties come from the PROPERTY DETAILS.docx source and images on Desktop

-- First, add the new columns if they don't exist
alter table properties add column if not exists facilities text[];
alter table properties add column if not exists self_contained boolean;

-- Backfill facilities and self_contained for the 6 existing properties
-- Using the exact data already in src/lib/data/properties.ts
update properties set
  facilities = array['Tiled Floor', '24-hour Electricity', 'Dining Area', 'Pop Ceiling', 'Pre-Paid Meter', 'Air Conditioning', 'Backup Generator / Solar Power', 'Balcony', 'Borehole', 'CCTV', 'Chandelier', 'En Suite Bathroom', 'Gated Community', 'Fitted Kitchen', 'Hot Water', 'Microwave', 'Sectionals', 'Refrigerator', 'Swimming Pool', 'Smoke Detection', 'Wardrobe', 'Wi-Fi', 'Parking Space'],
  self_contained = false
where id = 'cantonments-villa-charclem';

update properties set
  facilities = array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Dining Area', 'Chandelier', 'En Suite', 'Kitchen Cabinets', 'Kitchen Shelf', 'Pop Ceiling', 'Pre-Paid Meter', 'Tiled Floor', 'Wardrobe'],
  self_contained = false
where id = 'adjiringanor-mansion-stardom';

update properties set
  facilities = array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Pop Ceiling', 'Pre-Paid Meter', 'Sectionals', 'Tiled Floor', 'Refrigerator', 'Wardrobe', 'TV', 'Wi-Fi', 'Microwave'],
  self_contained = false
where id = 'east-legon-hills-townhouse-charclem';

update properties set
  facilities = array['24-Hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'En Suite Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Refrigerator', 'Sectionals', 'Tiled Floor', 'TV', 'Wardrobe', 'Wi-Fi'],
  self_contained = true
where id = 'east-legon-west-trasacco-villa-charclem';

update properties set
  facilities = array['Dining Area', 'Tiled Floor', 'Pop Ceiling', '24-hour Electricity'],
  self_contained = true
where id = 'east-legon-hills-villa-mrfred';

update properties set
  facilities = array['Kitchen Cabinets', '24-hour Electricity', 'Tiled Floor', 'Dining Area', 'Pop Ceiling', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dishwasher', 'En Suite Hot Water', 'Kitchen Shelf', 'Pre-Paid Meter', 'Sectional', 'Wardrobe'],
  self_contained = true
where id = 'adjiringanor-duplex-hometrust';

-- Fix Home Trust's secondary phone (already in seed data, just not in the database yet)
update agents set secondary_phone = '+233550827422'
where firm = 'Home Trust Properties Agency' and secondary_phone is null;

-- Ensure Encore Properties agent exists
insert into agents (name, firm, phone, ghis_verified)
select 'Encore Properties', 'Encore Properties', '+233598870757', false
where not exists (select 1 from agents where firm = 'Encore Properties');

-- Insert the 4 new properties
insert into properties (
  id, address, district, region, geom,
  type, style, storey, bedrooms, bathrooms, toilets, floor_area_sqm, plot_area_sqm, year_built,
  asking_price, listed_date, status, tenure, title_status, eco_rating,
  condition, furnishing, remaining_lease_terms, green_features_note, facilities, self_contained,
  agent_id, verified_by, summary, source_ref
)
values
  ('east-legon-hills-duplex-stardom', 'East Legon Hills', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1004742, 5.6927588), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 4, 4, 5, 850, null, 2025,
    2780000, '2026-09-11', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Semi-Furnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Dining Area', 'En Suite Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Tiled Floor', 'Wardrobe', 'Parking Space'],
    false,
    (select id from agents where firm = 'Stardom Real Estate' limit 1), null,
    'Four-bedroom, four-bathroom semi-furnished duplex in East Legon Hills. Newly built on a 99-year lease with modern amenities including air conditioning, balcony, and kitchen cabinets.',
    'seed:east-legon-hills-duplex-stardom'),
  ('adjiringanor-duplex-stardom', 'Adjiringanor', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1340291, 5.6457856), 4326)::geography,
    'Duplex', 'Detached', 'Multi Storey', 3, 3, 4, 700, null, 2025,
    2070000, '2026-09-11', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Semi-Furnished', 'Not specified', null,
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Dining Area', 'En Suite Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Tiled Floor', 'Wardrobe', 'Car park'],
    false,
    (select id from agents where firm = 'Stardom Real Estate' limit 1), null,
    'Three-bedroom, three-bathroom semi-furnished duplex in Adjiringanor. Newly built on a 99-year lease with modern finishes including air conditioning, balcony, and dining area.',
    'seed:adjiringanor-duplex-stardom'),
  ('adjiringanor-villa-encore', 'Adjiringanor', 'Adentan Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1340291, 5.6457856), 4326)::geography,
    'Villa', 'Detached', 'Multi Storey', 5, 5, 5, 500, null, 2025,
    6050000, '2026-09-11', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Semi-Furnished', 'Not specified', 'Balcony',
    array['Tiled Floor', '24-hour Electricity', 'Dining Area', 'Pop Ceiling', 'Balcony', 'Air Conditioning'],
    true,
    (select id from agents where firm = 'Encore Properties' limit 1), null,
    'Five-bedroom, five-bathroom semi-furnished modern luxury villa in Adjiringanor. Self-contained, newly built on a 99-year lease with premium finishes and air conditioning.',
    'seed:adjiringanor-villa-encore'),
  ('cantonments-mansion-stardom', 'Cantonments', 'La Dade Kotopon Municipal District', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.1899, 5.6289), 4326)::geography,
    'Mansion', 'Semi-Detached', 'Multi Storey', 5, 5, 5, 900, null, 2025,
    17250000, '2026-09-11', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    'Newly Built', 'Semi-Furnished', 'Not specified', 'Balcony',
    array['24-hour Electricity', 'Air Conditioning', 'Balcony', 'Chandelier', 'Dining Area', 'Dishwasher', 'En Suite', 'Hot Water', 'Kitchen Cabinets', 'Kitchen Shelf', 'Microwave', 'Pop Ceiling', 'Pre-Paid Meter', 'Refrigerator', 'Sectionals', 'Tiled Floor', 'TV', 'Wardrobe', 'Wi-Fi'],
    false,
    (select id from agents where firm = 'Stardom Real Estate' limit 1), null,
    'Five-bedroom, five-bathroom semi-furnished mansion in Cantonments. Newly built on a 99-year lease with premium features including air conditioning, chandelier, and comprehensive kitchen amenities.',
    'seed:cantonments-mansion-stardom')
on conflict (id) do nothing;

-- Insert media for the 4 new properties
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
  -- Property 3: adjiringanor-villa-encore (5 images)
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/01.webp', 0 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/02.webp', 1 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/03.webp', 2 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/04.webp', 3 union all
  select 'adjiringanor-villa-encore', '/properties/adjiringanor-villa-encore/05.webp', 4 union all
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

-- Insert green features for the 4 new properties (only 3 & 4 have balcony)
insert into property_green_features (property_id, label, icon)
select * from (
  select 'adjiringanor-villa-encore', 'Balcony', 'leaf' union all
  select 'cantonments-mansion-stardom', 'Balcony', 'leaf'
) t(property_id, label, icon)
on conflict do nothing;
