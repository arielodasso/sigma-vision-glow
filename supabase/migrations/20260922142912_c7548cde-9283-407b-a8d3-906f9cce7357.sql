create table if not exists public.real_cases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  logo_url text,
  logo_theme text not null default 'dark',
  url text,
  client_id uuid references public.clients(id) on delete set null,
  services text[] not null default '{}',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT ON public.real_cases TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.real_cases TO authenticated;
GRANT ALL ON public.real_cases TO service_role;
ALTER TABLE public.real_cases ENABLE ROW LEVEL SECURITY;

create policy "Public can view published real cases"
on public.real_cases for select
to anon, authenticated
using (published = true);

create policy "Admins can manage real cases"
on public.real_cases for all
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin'))
with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin'));

create trigger set_real_cases_updated_at
before update on public.real_cases
for each row execute function public.update_updated_at_column();

create table if not exists public.chat_channel_members (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.chat_channels(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (channel_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_channel_members TO authenticated;
GRANT ALL ON public.chat_channel_members TO service_role;
ALTER TABLE public.chat_channel_members ENABLE ROW LEVEL SECURITY;

create policy "Staff can manage channel members"
on public.chat_channel_members for all
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'superadmin')
  or public.has_role(auth.uid(), 'empleado')
  or public.has_role(auth.uid(), 'moderator')
)
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'superadmin')
  or public.has_role(auth.uid(), 'empleado')
  or public.has_role(auth.uid(), 'moderator')
);