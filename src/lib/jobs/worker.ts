import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider } from "@/lib/providers/registry";
import { getAgent } from "@/lib/agents/registry";
import type { Database } from "@/lib/supabase/database.types";

type AdminClient = ReturnType<typeof createAdminClient>;

interface ProcessJobParams {
  jobId: string;
  discoveryId: string;
  orgId: string;
  problemStatement: string;
  requestedAgents: string[];
}

/**
 * The core research-job state machine. Currently invoked in-process,
 * synchronously, right after the triggering request creates the job row —
 * the fast path described in the plan. The pgmq queue + pg_cron sweeper
 * (created in supabase/migrations/0004_jobs.sql) are the reliability
 * backstop for a request that dies mid-flight; wiring the sweeper itself
 * needs a publicly reachable URL, so it's a deploy-time step, not a local
 * one. A single agent failing does not fail the whole job — each agent's
 * outcome is captured independently in its own agent_runs row.
 */
export async function processResearchJob(params: ProcessJobParams): Promise<void> {
  const { jobId, discoveryId, orgId, problemStatement, requestedAgents } = params;
  const admin = createAdminClient();
  const provider = getProvider();

  await admin
    .from("research_jobs")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", jobId);
  await admin.from("discoveries").update({ status: "researching" }).eq("id", discoveryId);

  let totalEvidence = 0;
  let anySucceeded = false;

  for (const agentType of requestedAgents) {
    const agent = getAgent(agentType);

    const { data: agentRun } = await admin
      .from("agent_runs")
      .insert({
        discovery_id: discoveryId,
        org_id: orgId,
        job_id: jobId,
        agent_type: agentType as Database["public"]["Tables"]["agent_runs"]["Row"]["agent_type"],
        status: "running",
        model: "capable",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (!agentRun) continue;

    try {
      const result = await agent.run(
        { discoveryId, orgId, jobId, problemStatement },
        provider,
      );

      if (result.evidence.length > 0) {
        await insertEvidence(admin, discoveryId, orgId, agentRun.id, result.evidence);
        totalEvidence += result.evidence.length;
      }

      await admin
        .from("agent_runs")
        .update({
          status: "succeeded",
          summary: result.summary,
          tokens_input: result.tokensUsed.input,
          tokens_output: result.tokensUsed.output,
          finished_at: new Date().toISOString(),
        })
        .eq("id", agentRun.id);

      anySucceeded = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await admin
        .from("agent_runs")
        .update({ status: "failed", error: message, finished_at: new Date().toISOString() })
        .eq("id", agentRun.id);
    }
  }

  const finalStatus = !anySucceeded
    ? "failed"
    : totalEvidence > 0
      ? "succeeded"
      : "insufficient_evidence";

  await admin
    .from("research_jobs")
    .update({ status: finalStatus, finished_at: new Date().toISOString() })
    .eq("id", jobId);

  await admin
    .from("discoveries")
    .update({
      status: finalStatus === "succeeded" ? "completed" : finalStatus === "failed" ? "failed" : "insufficient_evidence",
    })
    .eq("id", discoveryId);
}

async function insertEvidence(
  admin: AdminClient,
  discoveryId: string,
  orgId: string,
  agentRunId: number,
  evidence: Awaited<ReturnType<ReturnType<typeof getAgent>["run"]>>["evidence"],
) {
  await admin.from("evidence").insert(
    evidence.map((e) => ({
      discovery_id: discoveryId,
      org_id: orgId,
      agent_run_id: agentRunId,
      source_name: e.sourceName,
      source_url: e.sourceUrl,
      published_date: e.publishedDate,
      evidence_type: e.evidenceType,
      quality_score: e.qualityScore,
      confidence_score: e.confidenceScore,
      status: e.status,
      summary: e.summary,
      raw_excerpt: e.rawExcerpt,
    })),
  );
}
