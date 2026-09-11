-- Fix thumbnail selection for properties 11, 12, 16 (non-exterior shots at sort=0)
-- These properties have interior/tight shots at sort=0; swapping to proper wide exterior shots

-- Property 11: east-legon-hills-mansion-aceholding
-- Interior (01.webp) currently at sort=0 → move to sort=7
-- Exterior (08.webp) currently at sort=7 → move to sort=0
update property_media set sort = 7 where property_id = 'east-legon-hills-mansion-aceholding' and url like '%/01.webp';
update property_media set sort = 0 where property_id = 'east-legon-hills-mansion-aceholding' and url like '%/08.webp';

-- Property 12: adjiriganor-apartment-savehands
-- Interior/courtyard (01.webp) currently at sort=0 → move to sort=1
-- Exterior (02.webp) currently at sort=1 → move to sort=0
update property_media set sort = 1 where property_id = 'adjiriganor-apartment-savehands' and url like '%/01.webp';
update property_media set sort = 0 where property_id = 'adjiriganor-apartment-savehands' and url like '%/02.webp';

-- Property 16: achimota-duplex-unitedhomes
-- Interior (01.webp) currently at sort=0 → move to sort=1
-- Exterior (02.webp) currently at sort=1 → move to sort=0
update property_media set sort = 1 where property_id = 'achimota-duplex-unitedhomes' and url like '%/01.webp';
update property_media set sort = 0 where property_id = 'achimota-duplex-unitedhomes' and url like '%/02.webp';
