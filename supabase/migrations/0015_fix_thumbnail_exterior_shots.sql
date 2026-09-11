-- Fix thumbnail selection: swap sort values to show exterior shots
-- Three properties had interiors (01.webp) at sort=0 instead of exteriors.
-- Swap the sort values so the correct exterior photo becomes the thumbnail.

-- Property 1: east-legon-hills-townhouse-charclem
--   Interior (01.webp) currently at sort=0 → move to sort=2
--   Exterior (03.webp) currently at sort=2 → move to sort=0
update property_media set sort = 2 where property_id = 'east-legon-hills-townhouse-charclem' and url like '%/01.webp';
update property_media set sort = 0 where property_id = 'east-legon-hills-townhouse-charclem' and url like '%/03.webp';

-- Property 2: east-legon-hills-villa-mrfred
--   Interior (01.webp) currently at sort=0 → move to sort=5
--   Exterior (06.webp) currently at sort=5 → move to sort=0
update property_media set sort = 5 where property_id = 'east-legon-hills-villa-mrfred' and url like '%/01.webp';
update property_media set sort = 0 where property_id = 'east-legon-hills-villa-mrfred' and url like '%/06.webp';

-- Property 3: east-legon-hills-duplex-stardom
--   Interior (01.webp) currently at sort=0 → move to sort=12
--   Exterior (13.webp) currently at sort=12 → move to sort=0
update property_media set sort = 12 where property_id = 'east-legon-hills-duplex-stardom' and url like '%/01.webp';
update property_media set sort = 0 where property_id = 'east-legon-hills-duplex-stardom' and url like '%/13.webp';
