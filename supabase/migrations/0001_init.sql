-- ============================================================================
-- UrbanRise Ghana — Integrated Residential Property & Market Intelligence
-- Initial schema.
--
-- Text + CHECK constraints rather than Postgres enums throughout: the first
-- data load comes from Notion, which will contain spelling drift, and a CHECK
-- can be relaxed with one ALTER where an enum needs a migration dance.
-- ============================================================================

create extension if not exists postgis;
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Agents & professionals
-- ---------------------------------------------------------------------------

create table if not exists agents (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  firm          text not null,
  phone         text,
  email         text,
  ghis_verified boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists professionals (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  firm             text not null,
  discipline       text not null check (discipline in (
                     'Estate Surveyor & Valuer','Estate Agent','Property Lawyer',
                     'Architect','Structural Engineer','Quantity Surveyor',
                     'Property Manager','Mortgage Consultant')),
  licence_no       text,
  region           text not null,
  verified         boolean not null default false,
  years_experience int check (years_experience >= 0),
  specialisms      text[] not null default '{}',
  phone            text,
  email            text,
  -- Set by the Notion sync so re-runs update rather than duplicate.
  source_ref       text unique,
  created_at       timestamptz not null default now()
);

create index if not exists professionals_discipline_idx on professionals (discipline);
create index if not exists professionals_region_idx on professionals (region);

-- ---------------------------------------------------------------------------
-- Properties
-- ---------------------------------------------------------------------------

create table if not exists properties (
  id             text primary key,                 -- e.g. 'UR-1042'
  address        text not null,
  locality       text not null,
  district       text not null,
  region         text not null,

  -- WGS84 point. Powers the distance chips and the GIS mapping the proposal
  -- specifies; ST_DWithin against this replaces the haversine in the seed layer.
  geom           geography(Point, 4326),

  -- PostgREST returns `geom` as WKB hex, which the client would have to parse.
  -- Materialising the coordinates keeps the API response plainly readable.
  lng            double precision generated always as (st_x(geom::geometry)) stored,
  lat            double precision generated always as (st_y(geom::geometry)) stored,

  type           text not null check (type in
                   ('House','Apartment','Townhouse','Compound House','Land')),
  style          text not null default 'Unknown',
  bedrooms       int  not null default 0 check (bedrooms >= 0),
  bathrooms      int  not null default 0 check (bathrooms >= 0),
  floor_area_sqm numeric(10,2) check (floor_area_sqm > 0),
  plot_area_sqm  numeric(10,2) check (plot_area_sqm > 0),
  year_built     int check (year_built between 1800 and 2100),

  asking_price   numeric(14,2) not null check (asking_price >= 0),
  -- The figure valuers actually compare on, kept correct by the database
  -- rather than by every caller remembering to divide.
  price_per_sqm  numeric(12,2)
                 generated always as (
                   case when floor_area_sqm > 0
                        then round(asking_price / floor_area_sqm, 2)
                   end
                 ) stored,

  listed_date    date,
  status         text not null default 'Available'
                 check (status in ('Available','Under Offer','Sold')),

  tenure         text not null default 'Unknown'
                 check (tenure in ('Freehold','Leasehold 99yr','Leasehold 50yr',
                                   'Customary','Unknown')),
  title_status   text not null default 'Unknown'
                 check (title_status in ('Registered','Pending','Unregistered','Unknown')),

  eco_rating     text check (eco_rating in ('A','B','C','D','E','F','G')),

  agent_id       uuid references agents (id) on delete set null,
  verified_by    text,                              -- GhIS-registered surveyor
  summary        text,

  source_ref     text unique,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists properties_geom_idx      on properties using gist (geom);
create index if not exists properties_locality_idx  on properties (locality);
create index if not exists properties_status_idx    on properties (status);
create index if not exists properties_eco_idx       on properties (eco_rating);
create index if not exists properties_price_idx     on properties (asking_price);

create table if not exists property_media (
  id          uuid primary key default uuid_generate_v4(),
  property_id text not null references properties (id) on delete cascade,
  url         text not null,
  sort        int  not null default 0
);
create index if not exists property_media_property_idx on property_media (property_id, sort);

create table if not exists property_green_features (
  property_id text not null references properties (id) on delete cascade,
  label       text not null,
  icon        text not null default 'leaf',
  primary key (property_id, label)
);

create table if not exists sale_history (
  id          uuid primary key default uuid_generate_v4(),
  property_id text not null references properties (id) on delete cascade,
  price       numeric(14,2) not null check (price >= 0),
  sold_at     date not null,
  source      text not null default 'Agent declared'
              check (source in ('Lands Commission','Agent declared','Verified survey'))
);
create index if not exists sale_history_property_idx on sale_history (property_id, sold_at desc);

-- ---------------------------------------------------------------------------
-- Green Building Materials Hub
-- ---------------------------------------------------------------------------

create table if not exists suppliers (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  region     text not null,
  contact    text,
  source_ref text unique
);

create table if not exists green_materials (
  id                          uuid primary key default uuid_generate_v4(),
  name                        text not null,
  category                    text not null check (category in
                                ('Structure','Roofing','Insulation','Energy','Water','Finishes')),
  supplier_id                 uuid references suppliers (id) on delete set null,
  region                      text not null,
  certification               text,
  carbon_kg_co2e              numeric(10,2) check (carbon_kg_co2e >= 0),
  saving_vs_conventional_pct  numeric(5,2) check (saving_vs_conventional_pct between -100 and 100),
  unit                        text not null default 'unit',
  price_per_unit              numeric(12,2) check (price_per_unit >= 0),
  summary                     text,
  source_ref                  text unique
);
create index if not exists green_materials_category_idx on green_materials (category);

-- ---------------------------------------------------------------------------
-- Valuations — the workbench's output
-- ---------------------------------------------------------------------------

create table if not exists valuations (
  id                 uuid primary key default uuid_generate_v4(),
  subject_property_id text not null references properties (id) on delete cascade,
  user_id            uuid not null references auth.users (id) on delete cascade,
  status             text not null default 'draft'
                     check (status in ('draft','submitted','approved')),
  opinion_value      numeric(14,2) check (opinion_value >= 0),
  rationale          text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists valuations_user_idx on valuations (user_id, updated_at desc);

create table if not exists valuation_comparables (
  valuation_id uuid not null references valuations (id) on delete cascade,
  property_id  text not null references properties (id) on delete cascade,
  -- Per-attribute adjustments the valuer applied, e.g. {"tenure": -0.05}
  adjustments  jsonb not null default '{}'::jsonb,
  included     boolean not null default true,
  primary key (valuation_id, property_id)
);

-- ---------------------------------------------------------------------------
-- Market intelligence
-- ---------------------------------------------------------------------------

create table if not exists market_stats (
  locality          text not null,
  region            text not null,
  period            date not null,          -- first day of the month
  median_price      numeric(14,2),
  avg_price_per_sqm numeric(12,2),
  listings          int,
  yoy_pct           numeric(6,2),
  eco_share_pct     numeric(5,2),
  primary key (locality, period)
);
create index if not exists market_stats_period_idx on market_stats (period desc);

-- ---------------------------------------------------------------------------
-- Comparable search by radius — replaces the haversine in the seed layer.
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
  order by p.geom <-> s.geom
  limit max_rows;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Reference data is public — the platform's whole purpose is to end the
-- information asymmetry, so listings, professionals and materials are readable
-- without an account. Valuations are private working papers.
-- ---------------------------------------------------------------------------

alter table properties              enable row level security;
alter table property_media          enable row level security;
alter table property_green_features enable row level security;
alter table sale_history            enable row level security;
alter table agents                  enable row level security;
alter table professionals           enable row level security;
alter table suppliers               enable row level security;
alter table green_materials         enable row level security;
alter table market_stats            enable row level security;
alter table valuations              enable row level security;
alter table valuation_comparables   enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'properties','property_media','property_green_features','sale_history',
    'agents','professionals','suppliers','green_materials','market_stats'
  ] loop
    execute format(
      'create policy %I on %I for select to anon, authenticated using (true)',
      t || '_public_read', t
    );
  end loop;
end $$;

-- A valuer sees and edits only their own working papers.
create policy valuations_owner_all on valuations
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy valuation_comparables_owner_all on valuation_comparables
  for all to authenticated
  using (exists (
    select 1 from valuations v
    where v.id = valuation_id and v.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from valuations v
    where v.id = valuation_id and v.user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger properties_touch before update on properties
  for each row execute function touch_updated_at();

create trigger valuations_touch before update on valuations
  for each row execute function touch_updated_at();
