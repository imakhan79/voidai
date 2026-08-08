-- VOID AI — 0004_jobs
-- research_jobs (UI-facing status, source of truth) + pgmq queue for async
-- research runs. The pg_cron reliability sweeper is wired at deploy time
-- (P1) since it needs a publicly reachable URL to hit via pg_net —
-- unreachable from a local dev database.

create extension if not exists pgmq;
create extension if not exists pg_cron;
create extension if not exists pg_net;

create table public.research_jobs (
  id uuid primary key default gen_random_uuid(),
  discovery_id uuid not null references public.discoveries (id) on delete cascade,
  org_id uuid not null references public.orgs (id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'failed', 'partial', 'insufficient_evidence')),
  requested_agents text[] not null default array['research', 'market', 'product'],
  error text,
  retry_count int not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_by uuid not null references auth.users (id),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index research_jobs_org_id_idx on public.research_jobs (org_id);
create index research_jobs_discovery_id_idx on public.research_jobs (discovery_id);

alter table public.research_jobs enable row level security;
alter table public.research_jobs force row level security;

create policy research_jobs_select on public.research_jobs
  for select to authenticated
  using ((select private.is_org_member(org_id)));

create trigger research_jobs_set_updated_at
  before update on public.research_jobs
  for each row execute function private.set_updated_at();

-- Enable Realtime change notifications for job progress polling/subscriptions.
alter publication supabase_realtime add table public.research_jobs;

select pgmq.create('research_jobs_queue');
