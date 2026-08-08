import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider } from "@/lib/providers/registry";
import { getAgent } from "@/lib/agents/registry";
import { detectGaps } from "@/lib/pipeline/gap-detection";
import type { Database } from "@/lib/supabase/database.types";
import type { NewEvidenceInput } from "@/lib/evidence-types";

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

  // Accumulated across agents, in insertion order — Product reads it as
  // priorEvidence, and gap-detection's 1-based supportingEvidenceIndexes are
  // resolved against this same ordered list.
  const accumulated: { id: number; item: NewEvidenceInput }[] = [];
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
        {
          discoveryId,
          orgId,
          jobId,
          problemStatement,
          priorEvidence: accumulated.map((e) => e.item),
        },
        provider,
      );

      if (result.evidence.length > 0) {
        const inserted = await insertEvidence(admin, discoveryId, orgId, agentRun.id, result.evidence);
        for (const row of inserted) accumulated.push(row);
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

  if (accumulated.length > 0) {
    try {
      const gaps = await detectGaps(problemStatement, accumulated.map((e) => e.item), provider);
      for (const gap of gaps) {
        const { data: gapRow } = await admin
          .from("gaps")
          .insert({
            discovery_id: discoveryId,
            org_id: orgId,
            job_id: jobId,
            title: gap.title,
            description: gap.description,
            status: gap.status,
          })
          .select("id")
          .single();

        if (!gapRow) continue;

        const evidenceIds = gap.supportingEvidenceIndexes
          .map((i) => accumulated[i - 1]?.id)
          .filter((id): id is number => id !== undefined);

        if (evidenceIds.length > 0) {
          await admin
            .from("gap_evidence")
            .insert(evidenceIds.map((evidence_id) => ({ gap_id: gapRow.id, evidence_id })));
        }
      }
    } catch (err) {
      // Gap detection is a synthesis step, not a source of truth — a
      // failure here shouldn't fail the whole job when evidence was
      // already gathered successfully. Still log it: silent 0-gap results
      // are indistinguishable from "legitimately no gaps" otherwise.
      console.error(`Gap detection failed for job ${jobId}:`, err);
    }
  }

  const finalStatus = !anySucceeded
    ? "failed"
    : accumulated.length > 0
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
  evidence: NewEvidenceInput[],
): Promise<{ id: number; item: NewEvidenceInput }[]> {
  const { data } = await admin
    .from("evidence")
    .insert(
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
    )
    .select("id");

  if (!data) return [];
  return data.map((row, i) => ({ id: row.id, item: evidence[i]! }));
}
