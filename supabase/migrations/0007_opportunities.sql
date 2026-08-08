-- VOID AI — 0007_opportunities
-- opportunities carry opportunity_score and confidence_score as two
-- distinct columns — the product's core mandate, enforced structurally.

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  discovery_id uuid not null references public.discoveries (id) on delete cascade,
  org_id uuid not null references public.orgs (id) on delete cascade,
  gap_id uuid references public.gaps (id) on delete set null,
  title text not null,
  description text not null,
  opportunity_score numeric(5, 2) not null,
  confidence_score numeric(5, 2) not null,
  scoring_breakdown jsonb not null,
  status text not null default 'candidate' check (status in ('candidate', 'saved', 'archived')),
  is_saved boolean not null default false,
  is_demo boolean not null default false,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index opportunities_org_id_idx on public.opportunities (org_id);
create index opportunities_discovery_id_idx on public.opportunities (discovery_id);
create index opportunities_scoring_breakdown_idx on public.opportunities using gin (scoring_breakdown);

alter table public.opportunities enable row level security;
alter table public.opportunities force row level security;

create policy opportunities_select on public.opportunities
  for select to authenticated
  using ((select private.is_org_member(org_id)));

-- Saving/archiving an opportunity is a client-initiated action (unlike
-- evidence/gaps, which only the service-role worker ever writes).
create policy opportunities_update on public.opportunities
  for update to authenticated
  using ((select private.is_org_member(org_id)))
  with check ((select private.is_org_member(org_id)));

create table public.opportunity_evidence (
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  evidence_id bigint not null references public.evidence (id) on delete cascade,
  relevance_weight numeric(3, 2) not null default 1,
  primary key (opportunity_id, evidence_id)
);

alter table public.opportunity_evidence enable row level security;
alter table public.opportunity_evidence force row level security;

create policy opportunity_evidence_select on public.opportunity_evidence
  for select to authenticated
  using (
    exists (
      select 1 from public.opportunities o
      where o.id = opportunity_evidence.opportunity_id
        and private.is_org_member(o.org_id)
    )
  );
