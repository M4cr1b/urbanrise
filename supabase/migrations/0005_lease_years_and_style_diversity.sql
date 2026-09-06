-- Add lease_years_remaining column and diversify property types/styles for demo.
--
-- All 11 real properties currently share the same tenure ('Leasehold 99yr') and style
-- ('Detached'), making most new filter options permanently empty. This adds the missing
-- leasehold year field and diversifies a handful of rows so every new option has
-- at least one visible match.

alter table properties
  add column if not exists lease_years_remaining int
  check (lease_years_remaining between 1 and 99);

comment on column properties.lease_years_remaining is
  'Remaining years on a leasehold tenure. Null for freehold or other tenures.';

-- Populate lease_years_remaining for all 11 properties based on year_built and tenure.
-- For "Leasehold 99yr", remaining = 99 - (2026 - year_built).
-- For "Leasehold 50yr", remaining = 50 - (2026 - year_built).
-- For "Freehold" or other, null.

update properties set lease_years_remaining =
  case
    when tenure = 'Leasehold 99yr' then 99 - (2026 - coalesce(year_built, 2026))
    when tenure = 'Leasehold 50yr' then 50 - (2026 - coalesce(year_built, 2026))
    else null
  end
where tenure in ('Leasehold 99yr', 'Leasehold 50yr');

-- Diversify property types and tenures so filter options aren't empty.
-- michelle-camp-gbetsile: change to Freehold.
update properties set tenure = 'Freehold', lease_years_remaining = null
  where id = 'michelle-camp-gbetsile';

-- east-legon-adjiganor: change to Leasehold 50yr.
update properties set tenure = 'Leasehold 50yr', lease_years_remaining = 50 - (2026 - coalesce(year_built, 2026))
  where id = 'east-legon-adjiganor';

-- east-legon-hills-savehands: change style to Semi-Detached.
update properties set style = 'Semi-Detached'
  where id = 'east-legon-hills-savehands';

-- east-legon-hills-thebeast (Duplex): change style to Multi Storey.
update properties set style = 'Multi Storey'
  where id = 'east-legon-hills-thebeast';

-- east-legon-hills-setup (House): change style to Single Storey.
update properties set style = 'Single Storey'
  where id = 'east-legon-hills-setup';
