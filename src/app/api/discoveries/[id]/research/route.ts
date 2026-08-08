import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider } from "@/lib/providers/registry";
import { ResearchAgent } from "@/lib/agents/research-agent";

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

  await admin
    .from("discoveries")
    .update({ status: "researching" })
    .eq("id", discoveryId);

  const { data: agentRun, error: agentRunError } = await admin
    .from("agent_runs")
    .insert({
      discovery_id: discoveryId,
      org_id: discovery.org_id,
      agent_type: "research",
      status: "running",
      model: "capable",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (agentRunError || !agentRun) {
    return NextResponse.json({ error: "Failed to start agent run" }, { status: 500 });
  }

  try {
    const provider = getProvider();
    const agent = new ResearchAgent();
    const result = await agent.run(
      {
        discoveryId,
        orgId: discovery.org_id,
        jobId: String(agentRun.id),
        problemStatement: discovery.problem_statement,
      },
      provider,
    );

    if (result.evidence.length > 0) {
      const { error: evidenceError } = await admin.from("evidence").insert(
        result.evidence.map((e) => ({
          discovery_id: discoveryId,
          org_id: discovery.org_id,
          agent_run_id: agentRun.id,
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
      if (evidenceError) throw new Error(evidenceError.message);
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

    await admin
      .from("discoveries")
      .update({
        status: result.evidence.length > 0 ? "completed" : "insufficient_evidence",
      })
      .eq("id", discoveryId);

    return NextResponse.json({
      evidenceCount: result.evidence.length,
      summary: result.summary,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    await admin
      .from("agent_runs")
      .update({ status: "failed", error: message, finished_at: new Date().toISOString() })
      .eq("id", agentRun.id);

    await admin.from("discoveries").update({ status: "failed" }).eq("id", discoveryId);

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
