-- Add new fields to properties table for enhanced property details
ALTER TABLE properties ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Newly Built';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS remaining_lease_terms TEXT DEFAULT 'Not specified';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS storey TEXT CHECK (storey IN ('Single Storey', 'Multi Storey') OR storey IS NULL);

-- Update property type constraint to include Mansion and Villa, remove Land and Compound House
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_type_check;
ALTER TABLE properties ADD CONSTRAINT properties_type_check CHECK (type IN ('House', 'Apartment', 'Townhouse', 'Duplex', 'Villa', 'Mansion'));
