
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Audiobooks
create table public.audiobooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  narrator text,
  description text,
  language text default 'English',
  cover_url text,
  audio_url text not null,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.audiobooks to anon;
grant select on public.audiobooks to authenticated;
grant all on public.audiobooks to service_role;

alter table public.audiobooks enable row level security;

create policy "Anyone can view audiobooks"
on public.audiobooks for select
to anon, authenticated
using (true);

create policy "Admins can insert audiobooks"
on public.audiobooks for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update audiobooks"
on public.audiobooks for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete audiobooks"
on public.audiobooks for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger audiobooks_updated_at
before update on public.audiobooks
for each row execute function public.set_updated_at();

-- Storage buckets (public read)
insert into storage.buckets (id, name, public)
values ('audiobook-covers', 'audiobook-covers', true),
       ('audiobook-audio', 'audiobook-audio', true)
on conflict (id) do nothing;

create policy "Public read covers"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'audiobook-covers');

create policy "Public read audio"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'audiobook-audio');

create policy "Admins can upload covers"
on storage.objects for insert
to authenticated
with check (bucket_id = 'audiobook-covers' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can upload audio"
on storage.objects for insert
to authenticated
with check (bucket_id = 'audiobook-audio' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete covers"
on storage.objects for delete
to authenticated
using (bucket_id = 'audiobook-covers' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete audio"
on storage.objects for delete
to authenticated
using (bucket_id = 'audiobook-audio' and public.has_role(auth.uid(), 'admin'));
