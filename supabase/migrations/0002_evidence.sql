-- VOID AI — 0002_evidence
-- agent_runs (provenance anchor) + evidence (cited findings). Both carry a
-- denormalized org_id so RLS stays a single indexed equality check.

create type public.evidence_status as enum (
  'VERIFIED', 'SUPPORTED', 'INFERRED', 'HYPOTHESIS', 'PREDICTION', 'UNKNOWN'
);

create type public.evidence_type as enum (
  'market_data', 'competitor', 'academic', 'news', 'community', 'patent', 'other'
);

create table public.agent_runs (
  id bigint generated always as identity primary key,
  discovery_id uuid not null references public.discoveries (id) on delete cascade,
  org_id uuid not null references public.orgs (id) on delete cascade,
  agent_type text not null check (agent_type in ('research', 'market', 'product', 'red_team')),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  model text,
  summary text,
  tokens_input int,
  tokens_output int,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index agent_runs_org_id_idx on public.agent_runs (org_id);
create index agent_runs_discovery_id_idx on public.agent_runs (discovery_id);

alter table public.agent_runs enable row level security;
alter table public.agent_runs force row level security;

create policy agent_runs_select on public.agent_runs
  for select to authenticated
  using ((select private.is_org_member(org_id)));

create table public.evidence (
  id bigint generated always as identity primary key,
  discovery_id uuid not null references public.discoveries (id) on delete cascade,
  org_id uuid not null references public.orgs (id) on delete cascade,
  agent_run_id bigint not null references public.agent_runs (id) on delete cascade,
  source_name text not null,
  source_url text not null check (source_url ~ '^https?://'),
  published_date date,
  retrieved_at timestamptz not null default now(),
  evidence_type public.evidence_type not null default 'other',
  quality_score numeric(3, 2) not null check (quality_score between 0 and 1),
  confidence_score numeric(3, 2) not null check (confidence_score between 0 and 1),
  status public.evidence_status not null,
  summary text not null,
  raw_excerpt text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index evidence_org_id_idx on public.evidence (org_id);
create index evidence_discovery_id_idx on public.evidence (discovery_id);
create index evidence_agent_run_id_idx on public.evidence (agent_run_id);

alter table public.evidence enable row level security;
alter table public.evidence force row level security;

create policy evidence_select on public.evidence
  for select to authenticated
  using ((select private.is_org_member(org_id)));
