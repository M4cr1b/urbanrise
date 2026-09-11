-- Fix: Restore properties table column names after manual Table Editor edits
-- The user renamed `locality` -> "Address" and `address` -> "Furnishing",
-- breaking all property queries with 42703 "column does not exist" errors.
-- This migration restores the expected lowercase names and adds missing data support.

-- Restore the lowercase column names (Postgres treats "Address" as distinct from address)
alter table properties rename column "Address" to address;
alter table properties rename column "Furnishing" to furnishing;

-- Clean up trailing whitespace from furnishing values entered via the table editor
update properties set furnishing = trim(furnishing);

-- Support a second contact number on agents (property page UI already renders it)
alter table agents add column if not exists secondary_phone text;

-- Create Stardom Real Estate agent if it doesn't exist
insert into agents (name, firm, phone, secondary_phone)
values ('Stardom Real Estate', 'Stardom Real Estate', '+233272169194', '+233543069194')
on conflict do nothing;

-- Link adjiringanor-mansion-stardom to Stardom Real Estate
update properties
set agent_id = (select id from agents where name = 'Stardom Real Estate' limit 1)
where properties.id = 'adjiringanor-mansion-stardom' and properties.agent_id is null;
