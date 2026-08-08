import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processResearchJob } from "@/lib/jobs/worker";

const CORE_AGENTS = ["research", "market", "product"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: discoveryId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: discovery } = await supabase
    .from("discoveries")
    .select("id, org_id, problem_statement")
    .eq("id", discoveryId)
    .maybeSingle();

  if (!discovery) {
    return NextResponse.json({ error: "Discovery not found" }, { status: 404 });
  }

  const admin = createAdminClient();

  const { data: job, error: jobError } = await admin
    .from("research_jobs")
    .insert({
      discovery_id: discoveryId,
      org_id: discovery.org_id,
      requested_agents: CORE_AGENTS,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Failed to create research job" }, { status: 500 });
  }

  // Fast path: process in-process right after creating the job row. The
  // pgmq queue + pg_cron sweeper are the reliability backstop for a request
  // that dies mid-flight — wired at deploy time (see 0004_jobs.sql).
  try {
    await processResearchJob({
      jobId: job.id,
      discoveryId,
      orgId: discovery.org_id,
      problemStatement: discovery.problem_statement,
      requestedAgents: CORE_AGENTS,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ jobId: job.id });
}
