-- Extend the existing classification without changing any listing records.
-- Apply only this migration to an existing database; do not replay older resets.
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_type_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_type_check
  CHECK (type IN ('House','Apartment','Townhouse','Duplex','Villa','Mansion','Bungalow','Compound House'));
