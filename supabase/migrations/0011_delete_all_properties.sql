-- Delete all existing properties and their related data
-- Deletes in FK-safe order (children first, cascading up)

DELETE FROM sale_history;
DELETE FROM property_green_features;
DELETE FROM property_media;
DELETE FROM properties;
DELETE FROM agents;
