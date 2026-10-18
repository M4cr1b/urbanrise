-- Source: Desktop/Round two/w.docx, cross-checked with PROPERTY 11-20 DETAILS.docx.
-- Property 36's Okaikwei North district was explicitly confirmed by the owner.
-- Run through scripts/repair-properties-11-36.mjs for a backup and transaction
-- verification. Earlier migrations have already been applied outside the ledger;
-- replaying the entire migration directory against the live database is unsafe.

create temporary table if not exists correction_properties_11_36 (
  number integer primary key,
  id text not null unique
) on commit drop;

insert into correction_properties_11_36 (number, id) values
  (11, 'east-legon-hills-mansion-aceholding'),
  (12, 'adjiriganor-apartment-savehands'),
  (13, 'achimota-tantra-hills-duplex-hometrust'),
  (14, 'achimota-mansion-greenyard'),
  (15, 'achimota-kingsby-villa-justice'),
  (16, 'achimota-duplex-unitedhomes'),
  (17, 'achimota-tantra-hills-duplex-hometrust-ii'),
  (18, 'achimota-villa-seekers'),
  (19, 'achimota-tantra-hills-villa-vpproperty'),
  (20, 'achimota-villa-nartey'),
  (21, 'achimota-kingsby-apartment-roger'),
  (22, 'achimota-duplex-enbtrust'),
  (23, 'achimota-tantra-hills-duplex-hometrust-iii'),
  (24, 'achimota-duplex-edwin'),
  (25, 'achimota-tantra-hills-villa-walako'),
  (26, 'achimota-tantra-hills-villa-eagleeye'),
  (27, 'achimota-tantra-hills-bungalow-unitedhomes'),
  (28, 'achimota-villa-unitedhomes'),
  (29, 'achimota-bungalow-hometrust'),
  (30, 'achimota-acp-duplex-kingscity'),
  (31, 'achimota-tantra-hills-mansion-kingscity'),
  (32, 'achimota-tantra-hills-duplex-rokoson'),
  (33, 'achimota-kingsby-duplex-hometrust'),
  (34, 'achimota-golf-hills-duplex-haskaybright'),
  (35, 'achimota-tantra-hills-villa-appiah'),
  (36, 'achimota-mile7-townhouse-kingscity')
on conflict (number) do nothing;

do $$
begin
  if (select count(*) from properties p join correction_properties_11_36 c on c.id = p.id) <> 26 then
    raise exception 'Expected all 26 audited properties; refusing a partial correction';
  end if;
  if exists (
    select 1 from properties p join correction_properties_11_36 c on c.id = p.id
    where p.tenure not in ('Leasehold 99yr', 'Leasehold')
       or p.remaining_lease_terms is distinct from 'Not specified'
  ) then
    raise exception 'Tenure evidence has changed since the audit; review before updating';
  end if;
end $$;

-- Add the generic tenure supported by the source. Preserve all existing options.
alter table properties drop constraint if exists properties_tenure_check;
alter table properties add constraint properties_tenure_check
  check (tenure in ('Freehold', 'Leasehold', 'Leasehold 99yr', 'Leasehold 50yr', 'Customary', 'Unknown'));

update properties p set tenure = 'Leasehold'
from correction_properties_11_36 c
where p.id = c.id and p.tenure = 'Leasehold 99yr';

-- The source says "PROPERTY SIZE", without identifying floor or plot area.
-- Remove the summary's unsupported "plot" interpretation; retain the numeric size.
update properties
set summary = 'Spacious 5-bed mansion in Achimota Mill 7, semi-furnished. Listed size: 2000 sqm.'
where id = 'achimota-mansion-greenyard'
  and summary = 'Spacious 5-bed mansion on 2000 sqm plot, semi-furnished.';

-- Only these three listings document a second number that is currently absent.
-- Match the assigned agent and primary number, rather than every similarly named agent.
do $$
begin
  if (
    select count(*) from (values
      ('adjiriganor-apartment-savehands', 'Save Hands Properties', '+233591005469', '+233246473121'),
      ('achimota-kingsby-villa-justice', 'Justice', '+233241334768', '+233508724944'),
      ('achimota-villa-seekers', 'Seekers Realty', '+233245142942', '+233554420825')
    ) v(property_id, firm, primary_phone, secondary_phone)
    join properties p on p.id = v.property_id
    join agents a on a.id = p.agent_id and a.firm = v.firm and a.phone = v.primary_phone
    where a.secondary_phone is null or a.secondary_phone = v.secondary_phone
  ) <> 3 then
    raise exception 'Documented agent/contact mapping has changed; review before updating';
  end if;
end $$;

update agents a set secondary_phone = v.secondary_phone
from (values
  ('adjiriganor-apartment-savehands', '+233591005469', '+233246473121'),
  ('achimota-kingsby-villa-justice', '+233241334768', '+233508724944'),
  ('achimota-villa-seekers', '+233245142942', '+233554420825')
) v(property_id, primary_phone, secondary_phone)
join properties p on p.id = v.property_id
where a.id = p.agent_id and a.phone = v.primary_phone
  and a.secondary_phone is distinct from v.secondary_phone;

-- Keep the earliest sort position when the same URL was inserted twice.
with ranked as (
  select m.id, row_number() over (
    partition by m.property_id, m.url order by m.sort, m.id
  ) as occurrence
  from property_media m join correction_properties_11_36 c on c.id = m.property_id
)
delete from property_media m using ranked r
where m.id = r.id and r.occurrence > 1;

-- These three galleries have old duplicate rows with conflicting sort values.
-- Pin their verified cover photograph first, then retain the observed unique
-- gallery order. Do not let an arbitrary duplicate row choose the cover photo.
with desired(property_id, file_numbers) as (
  values
    ('east-legon-hills-mansion-aceholding', array[8,1,2,3,4,5,6,7,9,10,11]),
    ('adjiriganor-apartment-savehands', array[2,1,3,4,5,6,7,8,9,10,11]),
    ('achimota-duplex-unitedhomes', array[2,1,3,4,5,6,7,8])
), ordered as (
  select d.property_id,
    '/properties/' || d.property_id || '/' || lpad(f.number::text, 2, '0') || '.webp' as url,
    (f.position - 1)::integer as sort
  from desired d
  cross join lateral unnest(d.file_numbers) with ordinality as f(number, position)
)
update property_media m set sort = o.sort from ordered o
where m.property_id = o.property_id and m.url = o.url
  and m.sort is distinct from o.sort;

-- Only the audited range is constrained; no unrelated image rows are deleted.
create unique index if not exists property_media_audited_property_url_key
on property_media (property_id, url)
where property_id in (
  'east-legon-hills-mansion-aceholding', 'adjiriganor-apartment-savehands',
  'achimota-tantra-hills-duplex-hometrust', 'achimota-mansion-greenyard',
  'achimota-kingsby-villa-justice', 'achimota-duplex-unitedhomes',
  'achimota-tantra-hills-duplex-hometrust-ii', 'achimota-villa-seekers',
  'achimota-tantra-hills-villa-vpproperty', 'achimota-villa-nartey',
  'achimota-kingsby-apartment-roger', 'achimota-duplex-enbtrust',
  'achimota-tantra-hills-duplex-hometrust-iii', 'achimota-duplex-edwin',
  'achimota-tantra-hills-villa-walako', 'achimota-tantra-hills-villa-eagleeye',
  'achimota-tantra-hills-bungalow-unitedhomes', 'achimota-villa-unitedhomes',
  'achimota-bungalow-hometrust', 'achimota-acp-duplex-kingscity',
  'achimota-tantra-hills-mansion-kingscity', 'achimota-tantra-hills-duplex-rokoson',
  'achimota-kingsby-duplex-hometrust', 'achimota-golf-hills-duplex-haskaybright',
  'achimota-tantra-hills-villa-appiah', 'achimota-mile7-townhouse-kingscity'
);
