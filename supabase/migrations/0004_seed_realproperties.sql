-- Seed the 11 real properties with agents.
-- Run once manually after the 0001_init schema is in place.

do $$
declare
  agent_ids record;
  v_agent_id uuid;
begin
  -- Agents (8 unique firms)
  insert into agents (name, firm, phone, ghis_verified)
  values
    ('Bustra Ghana Limited', 'Bustra Ghana Limited', '+233537533065', false),
    ('Greenyard Realty Inc.', 'Greenyard Realty Inc.', '+233554262896', false),
    ('Fair Heaven Properties', 'Fair Heaven Properties', '+233547008503', false),
    ('Save Hands Properties', 'Save Hands Properties', '+233591005469', false),
    ('Kinora Property Limited', 'Kinora Property Limited', '+233243398137', false),
    ('Stardom Real Estate', 'Stardom Real Estate', '+233543069194', false),
    ('Set Up Properties Ltd', 'Set Up Properties Ltd', '+233550781005', false),
    ('Ace Holdings', 'Ace Holdings', '+233205504307', false)
  on conflict do nothing;

  -- Properties (11 real listings)
  insert into properties (
    id, address, locality, district, region, geom,
    type, style, bedrooms, bathrooms, floor_area_sqm, plot_area_sqm, year_built,
    asking_price, listed_date, status, tenure, title_status, eco_rating,
    agent_id, verified_by, summary, source_ref
  )
  select
    'michelle-camp-gbetsile', 'Michelle Camp, Gbetsile', 'Gbetsile', 'Kpone-Katamanso Municipal Assembly', 'Greater Accra',
    ST_SetSRID(ST_MakePoint(-0.0298396, 5.7471821), 4326)::geography,
    'Apartment', 'Detached', 2, 3, 121.4, null, 2025,
    600000, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
    (select id from agents where firm = 'Bustra Ghana Limited' limit 1), null,
    'Two-bedroom, three-bathroom semi-furnished apartment in Gbetsile, completed 2025 on a 99-year lease. 24-hour electricity backup and a pre-paid meter, with a fully fitted kitchen including dishwasher, microwave and refrigerator.',
    'seed:michelle-camp-gbetsile'
  on conflict do nothing;

  insert into property_media (property_id, url, sort)
  select 'michelle-camp-gbetsile', url, sort from (values
    ('/properties/michelle-camp-gbetsile/01.webp', 0),
    ('/properties/michelle-camp-gbetsile/02.webp', 1),
    ('/properties/michelle-camp-gbetsile/03.webp', 2),
    ('/properties/michelle-camp-gbetsile/04.webp', 3),
    ('/properties/michelle-camp-gbetsile/05.webp', 4),
    ('/properties/michelle-camp-gbetsile/06.webp', 5)
  ) as t(url, sort)
  on conflict do nothing;

  -- Continue with remaining 10 properties...
  insert into properties (
    id, address, locality, district, region, geom,
    type, style, bedrooms, bathrooms, floor_area_sqm, plot_area_sqm, year_built,
    asking_price, listed_date, status, tenure, title_status, eco_rating,
    agent_id, verified_by, summary, source_ref
  )
  values
    ('east-legon-hills', 'East Legon Hills', 'East Legon Hills', 'Adentan Municipal Assembly', 'Greater Accra',
      ST_SetSRID(ST_MakePoint(-0.1004742, 5.6927588), 4326)::geography,
      'Apartment', 'Detached', 3, 3, 200, null, 2024, 1650000, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
      (select id from agents where firm = 'Greenyard Realty Inc.' limit 1), null,
      'Three-bedroom, three-bathroom semi-furnished apartment in East Legon Hills, completed 2024 on a 99-year lease. Air-conditioned throughout with CCTV, a fitted kitchen and a private balcony.',
      'seed:east-legon-hills'),
    ('fairhaven-east-legon', 'FairHaven, East Legon', 'East Legon', 'Adentan Municipal Assembly', 'Greater Accra',
      ST_SetSRID(ST_MakePoint(-0.1617155, 5.6354803), 4326)::geography,
      'Apartment', 'Detached', 4, 4, 111, null, 2025, 2750000, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
      (select id from agents where firm = 'Fair Heaven Properties' limit 1), null,
      'Four-bedroom, four-bathroom semi-furnished apartment in FairHaven, East Legon, completed 2025 on a 99-year lease. All bedrooms en suite, with a guest washroom, air conditioning and good road access.',
      'seed:fairhaven-east-legon'),
    ('east-legon-hills-savehands', 'East Legon Hills', 'East Legon Hills', 'Adenta Municipal Assembly', 'Greater Accra',
      ST_SetSRID(ST_MakePoint(-0.1201, 5.7104), 4326)::geography,
      'Apartment', 'Detached', 5, 5, 270, null, 2023, 6655000, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
      (select id from agents where firm = 'Save Hands Properties' limit 1), null,
      'Five-bedroom, five-bathroom fully furnished house in East Legon Hills, completed 2023. Air-conditioned throughout with 24-hour electricity backup, a fitted kitchen, and dedicated car parking.',
      'seed:east-legon-hills-savehands'),
    ('east-legon-hills-thebeast', 'East Legon Hills', 'East Legon Hills', 'Adenta Municipal Assembly', 'Greater Accra',
      ST_SetSRID(ST_MakePoint(-0.1201, 5.7104), 4326)::geography,
      'Duplex', 'Detached', 4, 4, 400, null, 2022, 4900000, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
      (select id from agents where firm = 'Kinora Property Limited' limit 1), null,
      'Four-bedroom, four-bathroom semi-furnished duplex in East Legon Hills, completed 2022, within a gated community. Comes with a private swimming pool, gym, and CCTV security.',
      'seed:east-legon-hills-thebeast'),
    ('east-legon-adjiganor', 'East Legon Adjiganor', 'Adjiganor', 'Adentan Municipal District', 'Greater Accra',
      ST_SetSRID(ST_MakePoint(-0.1340291, 5.6457856), 4326)::geography,
      'Duplex', 'Detached', 5, 5, 490, null, 2023, 7000000, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
      (select id from agents where firm = 'Kinora Property Limited' limit 1), null,
      'Five-bedroom, five-bathroom semi-furnished duplex in Adjiganor, East Legon, completed 2023. Comes with a private swimming pool, CCTV security, and dedicated parking.',
      'seed:east-legon-adjiganor'),
    ('east-legon-nanakrom', 'East Legon, Nanakrom', 'Nanakrom', 'Adentan Municipal District', 'Greater Accra',
      ST_SetSRID(ST_MakePoint(-0.1018612, 5.6982038), 4326)::geography,
      'Mansion', 'Detached', 4, 4, 1800, null, 2021, 5512500, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
      (select id from agents where firm = 'Stardom Real Estate' limit 1), null,
      'Four-bedroom, four-bathroom semi-furnished mansion in Nanakrom, East Legon, completed 2021. Air-conditioned throughout with a fully fitted kitchen and 24-hour electricity backup.',
      'seed:east-legon-nanakrom'),
    ('east-legon-hills-setup', 'East Legon Hills', 'East Legon Hills', 'Adentan Municipal Assembly', 'Greater Accra',
      ST_SetSRID(ST_MakePoint(-0.1201, 5.7104), 4326)::geography,
      'House', 'Detached', 3, 4, 350, null, 2024, 1600000, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
      (select id from agents where firm = 'Set Up Properties Ltd' limit 1), null,
      'Three-bedroom, four-bathroom unfurnished house in East Legon Hills, completed 2024. Air-conditioned throughout with a fully fitted kitchen and modern appliances.',
      'seed:east-legon-hills-setup'),
    ('east-legon-hills-ace-mansion-1', 'East Legon Hills', 'East Legon Hills', 'Adentan Municipal Assembly', 'Greater Accra',
      ST_SetSRID(ST_MakePoint(-0.1201, 5.7104), 4326)::geography,
      'Mansion', 'Detached', 5, 5, 500, null, 2023, 7517000, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
      (select id from agents where firm = 'Ace Holdings' limit 1), null,
      'Five-bedroom, five-bathroom semi-furnished mansion in East Legon Hills, completed 2023. Premium finishes with a private swimming pool, CCTV security, and full home automation.',
      'seed:east-legon-hills-ace-mansion-1'),
    ('east-legon-hills-ace-mansion-2', 'East Legon Hills', 'East Legon Hills', 'Adentan Municipal Assembly', 'Greater Accra',
      ST_SetSRID(ST_MakePoint(-0.1201, 5.7104), 4326)::geography,
      'Mansion', 'Detached', 4, 4, 500, null, 2022, 3243000, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
      (select id from agents where firm = 'Ace Holdings' limit 1), null,
      'Four-bedroom, four-bathroom semi-furnished mansion in East Legon Hills, completed 2022. Spacious layout with air conditioning throughout and a fully equipped kitchen.',
      'seed:east-legon-hills-ace-mansion-2'),
    ('adjiringanor-ace', 'Adjiringanor', 'Adjiringanor', 'Adentan Municipal Assembly', 'Greater Accra',
      ST_SetSRID(ST_MakePoint(-0.1340291, 5.6457856), 4326)::geography,
      'Mansion', 'Detached', 4, 4, 500, null, 2023, 6678000, '2026-09-02', 'Available', 'Leasehold 99yr', 'Unknown', 'D',
      (select id from agents where firm = 'Ace Holdings' limit 1), null,
      'Four-bedroom, four-bathroom semi-furnished mansion in Adjiringanor, completed 2023. Features a private swimming pool, fitted kitchen, and complete air conditioning.',
      'seed:adjiringanor-ace')
  on conflict do nothing;

end $$;

-- Insert media for each property
insert into property_media (property_id, url, sort)
select * from (
  select 'east-legon-hills', '/properties/east-legon-hills/02.webp', 0 union all
  select 'east-legon-hills', '/properties/east-legon-hills/01.webp', 1 union all
  select 'east-legon-hills', '/properties/east-legon-hills/03.webp', 2 union all
  select 'east-legon-hills', '/properties/east-legon-hills/04.webp', 3 union all
  select 'fairhaven-east-legon', '/properties/fairhaven-east-legon/02.webp', 0 union all
  select 'fairhaven-east-legon', '/properties/fairhaven-east-legon/01.webp', 1 union all
  select 'fairhaven-east-legon', '/properties/fairhaven-east-legon/03.webp', 2 union all
  select 'fairhaven-east-legon', '/properties/fairhaven-east-legon/04.webp', 3 union all
  select 'fairhaven-east-legon', '/properties/fairhaven-east-legon/05.webp', 4 union all
  select 'east-legon-hills-savehands', url, sort from (values
    ('/properties/east-legon-hills-savehands/01.webp', 0),
    ('/properties/east-legon-hills-savehands/02.webp', 1),
    ('/properties/east-legon-hills-savehands/03.webp', 2),
    ('/properties/east-legon-hills-savehands/04.webp', 3),
    ('/properties/east-legon-hills-savehands/05.webp', 4),
    ('/properties/east-legon-hills-savehands/06.webp', 5),
    ('/properties/east-legon-hills-savehands/07.webp', 6),
    ('/properties/east-legon-hills-savehands/08.webp', 7),
    ('/properties/east-legon-hills-savehands/09.webp', 8),
    ('/properties/east-legon-hills-savehands/10.webp', 9)
  ) as t(url, sort) union all
  select 'east-legon-hills-thebeast', url, sort from (values
    ('/properties/east-legon-hills-thebeast/01.webp', 0),
    ('/properties/east-legon-hills-thebeast/02.webp', 1),
    ('/properties/east-legon-hills-thebeast/03.webp', 2),
    ('/properties/east-legon-hills-thebeast/04.webp', 3),
    ('/properties/east-legon-hills-thebeast/05.webp', 4),
    ('/properties/east-legon-hills-thebeast/06.webp', 5),
    ('/properties/east-legon-hills-thebeast/07.webp', 6),
    ('/properties/east-legon-hills-thebeast/08.webp', 7),
    ('/properties/east-legon-hills-thebeast/09.webp', 8),
    ('/properties/east-legon-hills-thebeast/10.webp', 9)
  ) as t(url, sort) union all
  select 'east-legon-adjiganor', url, sort from (values
    ('/properties/east-legon-adjiganor/01.webp', 0),
    ('/properties/east-legon-adjiganor/02.webp', 1),
    ('/properties/east-legon-adjiganor/03.webp', 2),
    ('/properties/east-legon-adjiganor/04.webp', 3),
    ('/properties/east-legon-adjiganor/05.webp', 4),
    ('/properties/east-legon-adjiganor/06.webp', 5),
    ('/properties/east-legon-adjiganor/07.webp', 6)
  ) as t(url, sort) union all
  select 'east-legon-nanakrom', url, sort from (values
    ('/properties/east-legon-nanakrom/01.webp', 0),
    ('/properties/east-legon-nanakrom/02.webp', 1),
    ('/properties/east-legon-nanakrom/03.webp', 2),
    ('/properties/east-legon-nanakrom/04.webp', 3),
    ('/properties/east-legon-nanakrom/05.webp', 4),
    ('/properties/east-legon-nanakrom/06.webp', 5)
  ) as t(url, sort) union all
  select 'east-legon-hills-setup', url, sort from (values
    ('/properties/east-legon-hills-setup/01.webp', 0),
    ('/properties/east-legon-hills-setup/02.webp', 1),
    ('/properties/east-legon-hills-setup/03.webp', 2),
    ('/properties/east-legon-hills-setup/04.webp', 3),
    ('/properties/east-legon-hills-setup/05.webp', 4)
  ) as t(url, sort) union all
  select 'east-legon-hills-ace-mansion-1', url, sort from (values
    ('/properties/east-legon-hills-ace-mansion-1/01.webp', 0),
    ('/properties/east-legon-hills-ace-mansion-1/02.webp', 1),
    ('/properties/east-legon-hills-ace-mansion-1/03.webp', 2),
    ('/properties/east-legon-hills-ace-mansion-1/04.webp', 3),
    ('/properties/east-legon-hills-ace-mansion-1/05.webp', 4),
    ('/properties/east-legon-hills-ace-mansion-1/06.webp', 5),
    ('/properties/east-legon-hills-ace-mansion-1/07.webp', 6),
    ('/properties/east-legon-hills-ace-mansion-1/08.webp', 7)
  ) as t(url, sort) union all
  select 'east-legon-hills-ace-mansion-2', url, sort from (values
    ('/properties/east-legon-hills-ace-mansion-2/01.webp', 0),
    ('/properties/east-legon-hills-ace-mansion-2/02.webp', 1),
    ('/properties/east-legon-hills-ace-mansion-2/03.webp', 2),
    ('/properties/east-legon-hills-ace-mansion-2/04.webp', 3),
    ('/properties/east-legon-hills-ace-mansion-2/05.webp', 4),
    ('/properties/east-legon-hills-ace-mansion-2/06.webp', 5),
    ('/properties/east-legon-hills-ace-mansion-2/07.webp', 6),
    ('/properties/east-legon-hills-ace-mansion-2/08.webp', 7)
  ) as t(url, sort) union all
  select 'adjiringanor-ace', url, sort from (values
    ('/properties/adjiringanor-ace/01.webp', 0),
    ('/properties/adjiringanor-ace/02.webp', 1),
    ('/properties/adjiringanor-ace/03.webp', 2),
    ('/properties/adjiringanor-ace/04.webp', 3),
    ('/properties/adjiringanor-ace/05.webp', 4),
    ('/properties/adjiringanor-ace/06.webp', 5),
    ('/properties/adjiringanor-ace/07.webp', 6),
    ('/properties/adjiringanor-ace/08.webp', 7)
  ) as t(url, sort)
) t(property_id, url, sort)
on conflict do nothing;
