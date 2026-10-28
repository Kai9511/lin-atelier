-- Lin Atelier: database, security rules and image storage.
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It is safe to run again; existing data is kept.

-- ---------------------------------------------------------------------------
-- Artworks
-- ---------------------------------------------------------------------------
create table if not exists public.artworks (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null check (char_length(title) between 1 and 200),
  year           integer check (year between 1000 and 2999),
  medium         text,
  dimensions     text,
  description    text,
  collection     text,
  image_url      text not null,
  thumbnail_url  text not null,
  image_path     text,            -- path inside the "artworks" bucket (null for demo images)
  thumbnail_path text,
  width          integer,         -- pixel size of the full image, used to avoid layout shift
  height         integer,
  alt_text       text,            -- optional description for screen readers and search
  featured       boolean not null default false,
  published      boolean not null default true,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists artworks_order_idx on public.artworks (published, display_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists artworks_set_updated_at on public.artworks;
create trigger artworks_set_updated_at
  before update on public.artworks
  for each row execute function public.set_updated_at();

alter table public.artworks enable row level security;

-- Visitors can read published work only.
drop policy if exists "Public can read published artworks" on public.artworks;
create policy "Public can read published artworks"
  on public.artworks for select
  to anon, authenticated
  using (published = true);

-- The signed-in artist can read everything (including drafts) and change it.
-- Keep "Allow new users to sign up" OFF in Authentication settings so only you can sign in.
drop policy if exists "Admin can read all artworks" on public.artworks;
create policy "Admin can read all artworks"
  on public.artworks for select
  to authenticated
  using (true);

drop policy if exists "Admin can insert artworks" on public.artworks;
create policy "Admin can insert artworks"
  on public.artworks for insert
  to authenticated
  with check (true);

drop policy if exists "Admin can update artworks" on public.artworks;
create policy "Admin can update artworks"
  on public.artworks for update
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin can delete artworks" on public.artworks;
create policy "Admin can delete artworks"
  on public.artworks for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Contact form messages
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null check (char_length(name) between 1 and 200),
  email        text not null check (char_length(email) between 3 and 320),
  topic        text not null default 'Other' check (char_length(topic) <= 80),
  message      text not null check (char_length(message) between 1 and 5000),
  artwork_slug text check (char_length(artwork_slug) <= 200)
);

alter table public.inquiries enable row level security;

-- Anyone can send a message. Only the artist can read or delete them.
drop policy if exists "Anyone can send an inquiry" on public.inquiries;
create policy "Anyone can send an inquiry"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admin can read inquiries" on public.inquiries;
create policy "Admin can read inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

drop policy if exists "Admin can delete inquiries" on public.inquiries;
create policy "Admin can delete inquiries"
  on public.inquiries for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Image storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artworks', 'artworks', true, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- The bucket is public, so anyone can view an image by its link.
-- Only the signed-in artist can add, replace or remove files.
drop policy if exists "Admin can upload artwork images" on storage.objects;
create policy "Admin can upload artwork images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'artworks');

drop policy if exists "Admin can update artwork images" on storage.objects;
create policy "Admin can update artwork images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'artworks');

drop policy if exists "Admin can delete artwork images" on storage.objects;
create policy "Admin can delete artwork images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'artworks');
