-- VOID AI — 0005_agent_runs_job_id
-- Links agent_runs to the research_jobs row that triggered them (nullable —
-- red-team runs in a later task won't go through research_jobs).

alter table public.agent_runs
  add column job_id uuid references public.research_jobs (id) on delete cascade;

create index agent_runs_job_id_idx on public.agent_runs (job_id);
