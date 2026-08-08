import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Panel, PanelHeader, PanelTitle, PanelBody } from "@/components/ui/Panel";
import { DemoDataBanner } from "@/components/demo/DemoDataBanner";
import { LiveDot } from "@/components/ui/LiveDot";
import { RunResearchButton } from "@/components/discoveries/RunResearchButton";
import { EvidenceTable } from "@/components/evidence/EvidenceTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { OpportunityScoreDials } from "@/components/opportunities/OpportunityScoreDials";
import type { EvidenceStatus, LiveState } from "@/lib/domain-types";

const STATUS_LIVE_STATE: Record<string, LiveState> = {
  draft: "idle",
  researching: "ok",
  completed: "ok",
  failed: "error",
  insufficient_evidence: "warn",
};

export default async function DiscoveryDetailPage({
  params,
}: {
  params: Promise<{ discoveryId: string }>;
}) {
  const { discoveryId } = await params;
  const supabase = await createClient();

  const { data: discovery } = await supabase
    .from("discoveries")
    .select("id, title, problem_statement, status, is_demo, created_at")
    .eq("id", discoveryId)
    .maybeSingle();

  if (!discovery) notFound();

  const { data: evidence } = await supabase
    .from("evidence")
    .select(
      "id, source_name, source_url, published_date, evidence_type, quality_score, confidence_score, status, summary",
    )
    .eq("discovery_id", discoveryId)
    .order("created_at", { ascending: false });

  const { data: agentRuns } = await supabase
    .from("agent_runs")
    .select("id, agent_type, status, summary, error, tokens_input, tokens_output, finished_at")
    .eq("discovery_id", discoveryId)
    .order("created_at", { ascending: false });

  const { data: gaps } = await supabase
    .from("gaps")
    .select("id, title, description, status")
    .eq("discovery_id", discoveryId)
    .order("created_at", { ascending: false });

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("id, title, description, opportunity_score, confidence_score, is_saved")
    .eq("discovery_id", discoveryId)
    .order("opportunity_score", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">{discovery.title}</h1>
            <LiveDot
              state={STATUS_LIVE_STATE[discovery.status] ?? "idle"}
              label={discovery.status}
            />
          </div>
          {discovery.is_demo && (
            <div className="mt-2">
              <DemoDataBanner />
            </div>
          )}
        </div>
        <RunResearchButton discoveryId={discovery.id} />
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>Problem</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {discovery.problem_statement}
          </p>
        </PanelBody>
      </Panel>

      {agentRuns && agentRuns.length > 0 && (
        <Panel>
          <PanelHeader>
            <PanelTitle>Agent runs</PanelTitle>
          </PanelHeader>
          <PanelBody className="flex flex-col gap-2">
            {agentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between text-sm">
                <span className="font-tabular text-foreground-muted">
                  {run.agent_type}
                </span>
                <span className="text-foreground-muted">
                  {run.error ?? run.summary ?? run.status}
                </span>
              </div>
            ))}
          </PanelBody>
        </Panel>
      )}

      {gaps && gaps.length > 0 && (
        <Panel>
          <PanelHeader>
            <PanelTitle>Gaps ({gaps.length})</PanelTitle>
          </PanelHeader>
          <PanelBody className="flex flex-col gap-3">
            {gaps.map((gap) => (
              <div key={gap.id} className="flex items-start gap-3">
                <StatusPill status={gap.status as EvidenceStatus} />
                <div>
                  <p className="text-sm font-medium text-foreground">{gap.title}</p>
                  <p className="text-xs text-foreground-muted">{gap.description}</p>
                </div>
              </div>
            ))}
          </PanelBody>
        </Panel>
      )}

      {opportunities && opportunities.length > 0 && (
        <Panel>
          <PanelHeader>
            <PanelTitle>Opportunities ({opportunities.length})</PanelTitle>
          </PanelHeader>
          <PanelBody className="flex flex-col gap-3">
            {opportunities.map((opp) => (
              <Link
                key={opp.id}
                href={`/discoveries/${discoveryId}/opportunities/${opp.id}`}
                className="flex items-center justify-between rounded border border-border p-3 hover:border-accent/50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {opp.title}
                    {opp.is_saved && (
                      <span className="ml-2 text-[10px] uppercase text-accent">saved</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">{opp.description}</p>
                </div>
                <OpportunityScoreDials
                  opportunityScore={opp.opportunity_score}
                  confidenceScore={opp.confidence_score}
                />
              </Link>
            ))}
          </PanelBody>
        </Panel>
      )}

      <Panel>
        <PanelHeader>
          <PanelTitle>Evidence ({evidence?.length ?? 0})</PanelTitle>
        </PanelHeader>
        <PanelBody className="p-0">
          <EvidenceTable evidence={evidence ?? []} />
        </PanelBody>
      </Panel>
    </div>
  );
}
