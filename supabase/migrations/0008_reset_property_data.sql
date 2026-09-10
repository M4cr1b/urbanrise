-- Reset all property data for new listings to be seeded
-- Deletes in FK-safe order (children first)

DELETE FROM sale_history;
DELETE FROM property_green_features;
DELETE FROM property_media;
DELETE FROM properties;
DELETE FROM agents;
