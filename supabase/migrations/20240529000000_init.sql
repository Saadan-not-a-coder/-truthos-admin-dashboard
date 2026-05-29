-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.organization_type as enum ('school', 'nonprofit', 'business');
create type public.member_status as enum ('invited', 'active');
create type public.member_role as enum ('admin', 'member');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile name"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Prevent client-side admin escalation
create or replace function public.protect_profile_admin_flag()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_admin := false;
  elsif tg_op = 'UPDATE' and new.is_admin is distinct from old.is_admin then
    raise exception 'Admin status cannot be changed from the client';
  end if;
  return new;
end;
$$;

create trigger protect_profile_admin_flag
  before insert or update on public.profiles
  for each row execute function public.protect_profile_admin_flag();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  type public.organization_type not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  school_district text,
  tax_id text,
  industry text,
  constraint school_district_required check (
    type <> 'school' or (school_district is not null and char_length(trim(school_district)) > 0)
  ),
  constraint tax_id_required check (
    type <> 'nonprofit' or (tax_id is not null and char_length(trim(tax_id)) > 0)
  ),
  constraint industry_required check (
    type <> 'business' or (industry is not null and char_length(trim(industry)) > 0)
  )
);

create index organizations_created_by_idx on public.organizations (created_by);

alter table public.organizations enable row level security;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.owns_organization(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organizations
    where id = org_id and created_by = auth.uid()
  );
$$;

create policy "Admins manage own organizations"
  on public.organizations for all
  using (public.is_app_admin() and created_by = auth.uid())
  with check (public.is_app_admin() and created_by = auth.uid());

-- Organization members
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  email text not null check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  status public.member_status not null default 'invited',
  role public.member_role not null default 'member',
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  unique (organization_id, email)
);

create index organization_members_org_idx on public.organization_members (organization_id);

alter table public.organization_members enable row level security;

create policy "Admins manage members of own organizations"
  on public.organization_members for all
  using (
    public.is_app_admin()
    and public.owns_organization(organization_id)
  )
  with check (
    public.is_app_admin()
    and public.owns_organization(organization_id)
  );

-- Directory view with member counts
create or replace view public.organizations_with_member_count
with (security_invoker = true)
as
select
  o.*,
  coalesce(m.cnt, 0)::int as member_count
from public.organizations o
left join (
  select organization_id, count(*)::int as cnt
  from public.organization_members
  group by organization_id
) m on m.organization_id = o.id;

grant select on public.organizations_with_member_count to authenticated;
