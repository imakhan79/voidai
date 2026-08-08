import type { LLMProvider } from "@/lib/providers/types";
import type { ScoringResult } from "@/lib/pipeline/opportunity-scoring";

export interface OpportunityForBuild {
  title: string;
  description: string;
  scoring: ScoringResult;
  evidenceSummaries: string[];
  contradictionSummaries: string[];
}

const SYSTEM_PROMPT = `You write a Business Case document (markdown) for an opportunity
surfaced by VOID AI, an innovation-discovery system. Ground every claim in the evidence,
scoring breakdown, and red-team contradictions provided — do not introduce new facts, market
data, or statistics that were not given to you. Where the evidence is thin, say so explicitly
rather than filling the gap with invented specifics. Include sections: Problem, Market
Opportunity, Differentiation, Evidence Summary, Known Risks (from red-team), Confidence
Assessment (referencing the confidence score honestly, separate from opportunity score).`;

export async function generateBusinessCase(
  opp: OpportunityForBuild,
  provider: LLMProvider,
): Promise<string> {
  const result = await provider.complete({
    model: "capable",
    system: SYSTEM_PROMPT,
    enableWebSearch: false,
    maxTokens: 3072,
    messages: [{ role: "user", content: buildPrompt(opp) }],
  });
  return result.content;
}

function buildPrompt(opp: OpportunityForBuild): string {
  return [
    `Opportunity: ${opp.title}`,
    opp.description,
    ``,
    `Opportunity score: ${opp.scoring.opportunityScore}/100`,
    `Confidence score: ${opp.scoring.confidenceScore}/100`,
    ``,
    `Evidence:`,
    ...opp.evidenceSummaries.map((s, i) => `[${i + 1}] ${s}`),
    ``,
    `Red-team contradictions:`,
    ...(opp.contradictionSummaries.length
      ? opp.contradictionSummaries.map((s, i) => `[${i + 1}] ${s}`)
      : ["(none run yet)"]),
  ].join("\n");
}
