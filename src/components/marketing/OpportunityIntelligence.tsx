import { Section } from "./Section";
import { DemoDataBanner } from "@/components/demo/DemoDataBanner";
import { OpportunityCard, type OpportunityCardData } from "./OpportunityCard";

const SAMPLE_OPPORTUNITIES: OpportunityCardData[] = [
  {
    title: "Ambient clinical documentation for rural clinics",
    description: "Low-bandwidth, offline-capable scribing for under-resourced care settings.",
    opportunityScore: 84,
    confidence: 61,
    pain: 88,
    demand: 72,
    competition: 34,
    novelty: 66,
    feasibility: 70,
    timing: 79,
  },
  {
    title: "Continuous compliance for on-device ML",
    description: "Automated audit trails for edge-deployed models in regulated industries.",
    opportunityScore: 77,
    confidence: 54,
    pain: 69,
    demand: 63,
    competition: 41,
    novelty: 74,
    feasibility: 58,
    timing: 82,
  },
  {
    title: "Trust layer for multi-agent tool orchestration",
    description: "Verifiable provenance for autonomous agent-to-agent transactions.",
    opportunityScore: 89,
    confidence: 47,
    pain: 81,
    demand: 76,
    competition: 28,
    novelty: 91,
    feasibility: 52,
    timing: 94,
  },
];

export function OpportunityIntelligence() {
  return (
    <Section
      id="opportunity-intelligence"
      eyebrow="Opportunity Intelligence"
      title="Scored, not just surfaced"
      description="Opportunity attractiveness and evidence confidence are always shown as two separate numbers — never conflated."
    >
      <div className="mb-6 flex justify-center">
        <DemoDataBanner />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_OPPORTUNITIES.map((opp) => (
          <OpportunityCard key={opp.title} data={opp} />
        ))}
      </div>
    </Section>
  );
}
