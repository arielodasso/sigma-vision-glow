create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text not null unique,
  url text not null,
  kind text not null default 'image',
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

grant select, insert, update, delete on public.media_assets to authenticated;
grant all on public.media_assets to service_role;

alter table public.media_assets enable row level security;

create policy "media_assets_admin_all" on public.media_assets
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "media_bucket_admin_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "media_bucket_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "media_bucket_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "media_bucket_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));