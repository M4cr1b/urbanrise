-- Add fields for detail view display
ALTER TABLE properties ADD COLUMN IF NOT EXISTS toilets INT CHECK (toilets >= 0);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS green_features_note TEXT DEFAULT 'Not specified';
