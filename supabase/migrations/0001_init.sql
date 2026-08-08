-- VOID AI — 0001_init
-- Multi-tenancy foundation: orgs, org_members, private RLS helper schema,
-- auto-provisioning trigger, and the discoveries table.

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- orgs / org_members
-- ---------------------------------------------------------------------------

create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.org_members (
  org_id uuid not null references public.orgs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index org_members_user_id_idx on public.org_members (user_id);

-- ---------------------------------------------------------------------------
-- private.is_org_member — the single RLS predicate every policy calls.
-- security definer so it can read org_members regardless of the caller's own
-- RLS visibility; lives in a non-exposed schema and has execute revoked from
-- anon/authenticated so it is only reachable from inside a policy.
-- ---------------------------------------------------------------------------

create function private.is_org_member(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.org_members m
    where m.org_id = target_org_id
      and m.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_org_member(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS for orgs / org_members themselves
-- ---------------------------------------------------------------------------

alter table public.orgs enable row level security;
alter table public.orgs force row level security;

create policy orgs_select on public.orgs
  for select to authenticated
  using ((select private.is_org_member(id)));

alter table public.org_members enable row level security;
alter table public.org_members force row level security;

create policy org_members_select on public.org_members
  for select to authenticated
  using ((select private.is_org_member(org_id)));

-- ---------------------------------------------------------------------------
-- New-user provisioning: every signup gets a personal org + owner membership.
-- ---------------------------------------------------------------------------

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_org_id uuid;
begin
  insert into public.orgs (name)
  values (coalesce(new.raw_user_meta_data ->> 'org_name', split_part(new.email, '@', 1)) || '''s workspace')
  returning id into new_org_id;

  insert into public.org_members (org_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- discoveries
-- ---------------------------------------------------------------------------

create table public.discoveries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  created_by uuid not null references auth.users (id),
  title text not null,
  problem_statement text not null,
  status text not null default 'draft'
    check (status in ('draft', 'researching', 'completed', 'failed', 'insufficient_evidence')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index discoveries_org_id_idx on public.discoveries (org_id);

alter table public.discoveries enable row level security;
alter table public.discoveries force row level security;

create policy discoveries_select on public.discoveries
  for select to authenticated
  using ((select private.is_org_member(org_id)));

create policy discoveries_write on public.discoveries
  for insert to authenticated
  with check ((select private.is_org_member(org_id)));

create policy discoveries_update on public.discoveries
  for update to authenticated
  using ((select private.is_org_member(org_id)))
  with check ((select private.is_org_member(org_id)));

create policy discoveries_delete on public.discoveries
  for delete to authenticated
  using ((select private.is_org_member(org_id)));

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger discoveries_set_updated_at
  before update on public.discoveries
  for each row execute function private.set_updated_at();
