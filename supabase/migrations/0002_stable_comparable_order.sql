-- ---------------------------------------------------------------------------
-- Make comparable ordering deterministic.
--
-- `order by p.geom <-> s.geom` alone is not a total order. Any two properties
-- equidistant from the subject may come back in either order, and Postgres is
-- free to vary that between executions.
--
-- This is not hypothetical here: listings imported without surveyed coordinates
-- are placed at their locality centroid, so every property sharing a locality
-- shares an exact position. Two Adenta records tie at precisely 4.96 km.
--
-- The visible effect is a comparables grid whose columns reshuffle on refresh.
-- In a tool whose output is a signed valuation, evidence that reorders itself
-- between page loads undermines the whole exercise — a valuer citing "the third
-- comparable" must get the same row tomorrow.
--
-- Adding the primary key as a final sort key makes the order total and stable
-- without changing which rows are returned or their distances.
-- ---------------------------------------------------------------------------

create or replace function comparables_within(
  subject_id text,
  radius_m   double precision default 15000,
  max_rows   int default 30
)
returns table (property_id text, distance_km double precision)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select p.id,
         st_distance(p.geom, s.geom) / 1000.0 as distance_km
  from properties p
  cross join (select geom from properties where id = subject_id) s
  where p.id <> subject_id
    and p.geom is not null
    and st_dwithin(p.geom, s.geom, radius_m)
  -- Distance first, then id: a total order, so the result is reproducible.
  order by st_distance(p.geom, s.geom), p.id
  limit max_rows;
$$;
