-- ---------------------------------------------------------------------------
-- Photography for professionals, imagery and purchasing detail for materials.
--
-- Three gaps the interface could not fill because the schema had nowhere to
-- put the data:
--
--   * a professional's profile had no photograph, so the directory was a wall
--     of text and gave no sense of the person being engaged;
--   * a green material had no image, so the hub read as a specification list
--     rather than something you could recognise on a builder's merchant shelf;
--   * a supplier had a single free-text `contact` field, which cannot answer
--     "where do I buy this and who do I call" — the question the hub exists to
--     answer.
--
-- Suppliers gain a proper address, locality, phone, email and website so the
-- material card can carry the whole purchasing story.
-- ---------------------------------------------------------------------------

alter table professionals
  add column if not exists photo_url text;

comment on column professionals.photo_url is
  'Profile photograph. Relative path under /public, or an absolute URL.';

alter table green_materials
  add column if not exists image_url text;

comment on column green_materials.image_url is
  'Photograph of the material itself, not of a building using it.';

alter table suppliers
  add column if not exists locality text,
  add column if not exists address  text,
  add column if not exists phone    text,
  add column if not exists email    text,
  add column if not exists website  text;

comment on column suppliers.locality is
  'Neighbourhood or town, so a buyer can judge distance before calling.';
