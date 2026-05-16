-- ============================================================================
--  klova photography — Supabase schema
--  Run this in the Supabase dashboard → SQL Editor → New query → Run.
--  Safe to re-run (idempotent where practical).
-- ============================================================================

-- ---------- tables ----------------------------------------------------------

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  label       text not null,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

create table if not exists works (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references categories(id) on delete set null,
  category_slug text,                       -- denormalised, kept in sync by app
  title         text not null,
  location      text,
  year          text,
  image_path    text,                       -- path inside the 'works' storage bucket
  seed          text,                       -- picsum fallback seed (before upload)
  width         int  default 1200,
  height        int  default 1500,
  sort_order    int  default 0,
  published     boolean default true,
  created_at    timestamptz default now()
);
create index if not exists works_category_idx on works (category_id);
create index if not exists works_sort_idx on works (sort_order);

create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  num         text not null,
  title       text not null,
  body        text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- single-row site content / theme blob (deep-merged with defaults client-side)
create table if not exists site_settings (
  id          int primary key default 1,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz default now(),
  constraint site_settings_single_row check (id = 1)
);
insert into site_settings (id, data) values (1, '{}'::jsonb)
  on conflict (id) do nothing;

-- ---------- row level security ---------------------------------------------
-- Public (anon) may READ published content. Only authenticated users (admins
-- signed in via Supabase Auth) may write anything.

alter table categories    enable row level security;
alter table works         enable row level security;
alter table services      enable row level security;
alter table site_settings enable row level security;

-- categories: world-readable, admin-writable
drop policy if exists categories_read  on categories;
drop policy if exists categories_write on categories;
create policy categories_read  on categories for select using (true);
create policy categories_write on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- works: anon sees only published; authenticated sees & writes all
drop policy if exists works_read_public on works;
drop policy if exists works_read_admin  on works;
drop policy if exists works_write        on works;
create policy works_read_public on works for select using (published = true);
create policy works_read_admin  on works for select using (auth.role() = 'authenticated');
create policy works_write       on works for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- services: world-readable, admin-writable
drop policy if exists services_read  on services;
drop policy if exists services_write on services;
create policy services_read  on services for select using (true);
create policy services_write on services for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- site_settings: world-readable, admin-writable
drop policy if exists settings_read  on site_settings;
drop policy if exists settings_write on site_settings;
create policy settings_read  on site_settings for select using (true);
create policy settings_write on site_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- storage bucket --------------------------------------------------
-- Public bucket for uploaded photos (works / hero / about figure).

insert into storage.buckets (id, name, public)
values ('works', 'works', true)
on conflict (id) do nothing;

drop policy if exists "works public read"   on storage.objects;
drop policy if exists "works admin insert"  on storage.objects;
drop policy if exists "works admin update"  on storage.objects;
drop policy if exists "works admin delete"  on storage.objects;

create policy "works public read" on storage.objects
  for select using (bucket_id = 'works');
create policy "works admin insert" on storage.objects
  for insert with check (bucket_id = 'works' and auth.role() = 'authenticated');
create policy "works admin update" on storage.objects
  for update using (bucket_id = 'works' and auth.role() = 'authenticated');
create policy "works admin delete" on storage.objects
  for delete using (bucket_id = 'works' and auth.role() = 'authenticated');

-- ---------- seed data -------------------------------------------------------
-- Mirrors the original Claude Design catalogue so the site looks complete
-- immediately (placeholder photos via picsum until you upload real files).

insert into categories (slug, label, sort_order) values
  ('wedding',    'Wedding',    1),
  ('prewedding', 'Prewedding', 2),
  ('engagement', 'Engagement', 3),
  ('event',      'Event',      4),
  ('portrait',   'Portrait',   5),
  ('landscape',  'Landscape',  6),
  ('product',    'Product',    7)
on conflict (slug) do nothing;

insert into services (num, title, body, sort_order) values
  ('01', 'Wedding & Prewedding', 'Full-day documentary coverage. Editorial film looks, two photographers, archival delivery within four weeks.', 1),
  ('02', 'Portrait & Editorial', 'Studio and on-location portraits for individuals, founders, and publications. Considered lighting, restrained retouch.', 2),
  ('03', 'Brand & Product', 'Catalog, lookbook and campaign imagery. Set design, prop sourcing, and one-day to multi-day shoots.', 3)
on conflict do nothing;

-- seed works only if the table is empty
insert into works (category_id, category_slug, title, location, year, seed, width, height, sort_order, published)
select c.id, c.slug, w.title, w.location, w.year, w.seed, w.width, w.height, w.sort_order, true
from (values
  ('wedding',    'Vow of Linen',     'Ubud, Bali',  '2025', 'klova-w-01',   1200, 1500, 1),
  ('wedding',    'Aisle at Dawn',    'Yogyakarta',  '2025', 'klova-w-02',   1600, 1100, 2),
  ('wedding',    'First Light',      'Bandung',     '2024', 'klova-w-03',   1200, 1600, 3),
  ('wedding',    'Rituals',          'Solo',        '2024', 'klova-w-04',   1500, 1500, 4),
  ('prewedding', 'Salt & Quiet',     'Nusa Penida', '2025', 'klova-p-01',   1400, 1750, 5),
  ('prewedding', 'Linen Hours',      'Bromo',       '2025', 'klova-p-02',   1600, 1067, 6),
  ('prewedding', 'Soft Field',       'Lembang',     '2024', 'klova-p-03',   1300, 1600, 7),
  ('engagement', 'Hands, Held',      'Jakarta',     '2025', 'klova-eng-01', 1200, 1500, 8),
  ('engagement', 'Bookshop Letters', 'Bandung',     '2024', 'klova-eng-02', 1600, 1067, 9),
  ('engagement', 'Window Light',     'Yogyakarta',  '2024', 'klova-eng-03', 1400, 1750, 10),
  ('event',      'Symposium 09',     'Senayan',     '2025', 'klova-ev-01',  1600, 1067, 11),
  ('event',      'Stage in Black',   'Surabaya',    '2024', 'klova-ev-02',  1400, 1750, 12),
  ('event',      'Quiet Room',       'Bali',        '2024', 'klova-ev-03',  1500, 1000, 13),
  ('portrait',   'Naia, study i',    'Studio',      '2025', 'klova-po-01',  1200, 1500, 14),
  ('portrait',   'Looking East',     'Jakarta',     '2025', 'klova-po-02',  1200, 1600, 15),
  ('portrait',   'Suit, no. III',    'Studio',      '2024', 'klova-po-03',  1300, 1700, 16),
  ('portrait',   'Half Smile',       'Bandung',     '2024', 'klova-po-04',  1400, 1750, 17),
  ('landscape',  'Volcano, predawn', 'Mt. Bromo',   '2025', 'klova-l-01',   1800, 1000, 18),
  ('landscape',  'Ridge Lines',      'Dieng',       '2024', 'klova-l-02',   1800, 1100, 19),
  ('landscape',  'Sea, in Movement', 'Sumba',       '2024', 'klova-l-03',   1800, 1200, 20),
  ('product',    'Ceramic, matte',   'Studio',      '2025', 'klova-pr-01',  1400, 1400, 21),
  ('product',    'Steel & Linen',    'Studio',      '2025', 'klova-pr-02',  1200, 1500, 22),
  ('product',    'Bottle, no. 7',    'Studio',      '2024', 'klova-pr-03',  1300, 1600, 23)
) as w(cat, title, location, year, seed, width, height, sort_order)
join categories c on c.slug = w.cat
where not exists (select 1 from works);

-- updated_at trigger for site_settings
create or replace function touch_site_settings() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
drop trigger if exists site_settings_touch on site_settings;
create trigger site_settings_touch before update on site_settings
  for each row execute function touch_site_settings();

-- Done. Next: create an admin user in Authentication → Users (see README).
