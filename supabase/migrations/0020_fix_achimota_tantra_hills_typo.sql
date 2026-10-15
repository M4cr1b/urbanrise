-- Fix typo: property 17 address was "Achimota Tranta Hills" (should be "Achimota Tantra Hills")
UPDATE properties
SET address = 'Achimota Tantra Hills'
WHERE id = 'achimota-tantra-hills-duplex-hometrust-ii'
  AND address = 'Achimota Tranta Hills';
