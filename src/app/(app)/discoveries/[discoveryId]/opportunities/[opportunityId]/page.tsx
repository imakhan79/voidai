import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Panel, PanelHeader, PanelTitle, PanelBody } from "@/components/ui/Panel";
import { EvidenceTable } from "@/components/evidence/EvidenceTable";
import { OpportunityScoreDials } from "@/components/opportunities/OpportunityScoreDials";
import { SaveOpportunityButton } from "@/components/opportunities/SaveOpportunityButton";
import { MonoStat } from "@/components/ui/MonoStat";

interface ScoringBreakdown {
  opportunity: {
    marketSignal: number;
    differentiation: number;
    problemSeverity: number;
  };
  confidence: {
    statusWeightedAvg: number;
    evidenceCount: number;
    sourceDiversity: number;
  };
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ discoveryId: string; opportunityId: string }>;
}) {
  const { discoveryId, opportunityId } = await params;
  const supabase = await createClient();

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select(
      "id, title, description, opportunity_score, confidence_score, scoring_breakdown, is_saved",
    )
    .eq("id", opportunityId)
    .maybeSingle();

  if (!opportunity) notFound();

  const { data: links } = await supabase
    .from("opportunity_evidence")
    .select(
      "evidence:evidence_id(id, source_name, source_url, published_date, evidence_type, quality_score, confidence_score, status, summary)",
    )
    .eq("opportunity_id", opportunityId);

  const evidence = (links ?? [])
    .map((l) => l.evidence)
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const breakdown = opportunity.scoring_breakdown as unknown as ScoringBreakdown;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/discoveries/${discoveryId}`}
        className="text-xs text-foreground-muted hover:text-foreground"
      >
        &larr; Back to discovery
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{opportunity.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
            {opportunity.description}
          </p>
        </div>
        <SaveOpportunityButton
          opportunityId={opportunity.id}
          initialSaved={opportunity.is_saved}
        />
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>Scores</PanelTitle>
        </PanelHeader>
        <PanelBody className="flex flex-col gap-6">
          <OpportunityScoreDials
            opportunityScore={opportunity.opportunity_score}
            confidenceScore={opportunity.confidence_score}
          />
          {breakdown && (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
              <MonoStat
                label="Market signal"
                value={breakdown.opportunity.marketSignal.toFixed(2)}
              />
              <MonoStat
                label="Differentiation"
                value={breakdown.opportunity.differentiation.toFixed(2)}
              />
              <MonoStat
                label="Problem severity"
                value={breakdown.opportunity.problemSeverity.toFixed(2)}
              />
              <MonoStat
                label="Evidence count"
                value={breakdown.confidence.evidenceCount}
              />
              <MonoStat
                label="Source diversity"
                value={breakdown.confidence.sourceDiversity}
              />
            </div>
          )}
          <p className="text-xs text-foreground-muted">
            Opportunity score reflects attractiveness (market signal,
            differentiation, problem severity). Confidence score is computed
            mechanically from the evidence backing it — the two are never
            combined.
          </p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Supporting evidence ({evidence.length})</PanelTitle>
        </PanelHeader>
        <PanelBody className="p-0">
          <EvidenceTable evidence={evidence} />
        </PanelBody>
      </Panel>
    </div>
  );
}
