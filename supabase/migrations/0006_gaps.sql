-- VOID AI — 0006_gaps
-- gaps + gap_evidence (which evidence items support a detected gap).

create table public.gaps (
  id uuid primary key default gen_random_uuid(),
  discovery_id uuid not null references public.discoveries (id) on delete cascade,
  org_id uuid not null references public.orgs (id) on delete cascade,
  job_id uuid references public.research_jobs (id) on delete set null,
  title text not null,
  description text not null,
  status public.evidence_status not null,
  created_at timestamptz not null default now()
);

create index gaps_org_id_idx on public.gaps (org_id);
create index gaps_discovery_id_idx on public.gaps (discovery_id);

alter table public.gaps enable row level security;
alter table public.gaps force row level security;

create policy gaps_select on public.gaps
  for select to authenticated
  using ((select private.is_org_member(org_id)));

create table public.gap_evidence (
  gap_id uuid not null references public.gaps (id) on delete cascade,
  evidence_id bigint not null references public.evidence (id) on delete cascade,
  primary key (gap_id, evidence_id)
);

alter table public.gap_evidence enable row level security;
alter table public.gap_evidence force row level security;

create policy gap_evidence_select on public.gap_evidence
  for select to authenticated
  using (
    exists (
      select 1 from public.gaps g
      where g.id = gap_evidence.gap_id
        and private.is_org_member(g.org_id)
    )
  );
