import type { NewEvidenceInput } from "@/lib/evidence-types";
import type { GapCandidate } from "@/lib/pipeline/gap-detection";
import type { ScoringResult } from "@/lib/pipeline/opportunity-scoring";

export interface DiscoveryExportInput {
  title: string;
  problemStatement: string;
  isDemo: boolean;
  evidence: NewEvidenceInput[];
  gaps: GapCandidate[];
  opportunities: { title: string; description: string; scoring: ScoringResult }[];
}

export function renderDiscoveryMarkdown(input: DiscoveryExportInput): string {
  const lines: string[] = [];
  lines.push(`# ${input.title}`);
  if (input.isDemo) lines.push(`\n> **DEMO DATA** — synthetic, not real research output.`);
  lines.push(`\n## Problem\n\n${input.problemStatement}`);

  lines.push(`\n## Evidence (${input.evidence.length})`);
  for (const e of input.evidence) {
    lines.push(
      `\n- **[${e.status}]** ${e.summary}\n  Source: [${e.sourceName}](${e.sourceUrl})${e.publishedDate ? ` — ${e.publishedDate}` : ""} · quality ${e.qualityScore.toFixed(2)}`,
    );
  }

  lines.push(`\n## Gaps (${input.gaps.length})`);
  for (const g of input.gaps) {
    lines.push(`\n- **[${g.status}]** ${g.title}\n  ${g.description}`);
  }

  lines.push(`\n## Opportunities (${input.opportunities.length})`);
  for (const o of input.opportunities) {
    lines.push(
      `\n### ${o.title}\n${o.description}\n\n- Opportunity score: **${o.scoring.opportunityScore}/100**\n- Confidence score: **${o.scoring.confidenceScore}/100**`,
    );
  }

  return lines.join("\n");
}
