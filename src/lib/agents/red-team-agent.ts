import type { Agent, AgentContext, AgentResult } from "./types";
import type { LLMProvider } from "@/lib/providers/types";
import { parseFindingsToEvidence } from "./parse-findings";
import type { NewContradictionInput } from "@/lib/contradiction-types";
import { CONTRADICTION_TYPES, CONTRADICTION_SEVERITIES } from "@/lib/contradiction-types";
import { classifyEvidenceStatus } from "@/lib/pipeline/evidence-status";

const SYSTEM_PROMPT = `You are the Red-Team agent inside VOID AI, an innovation-discovery system.
You are given a specific opportunity and the evidence it rests on. Your job is to attack it:
find evidence conflicts, unverified assumptions load-bearing to its score, logical flaws, and
market/feasibility risks. You may use web search to try to surface counter-sources.

Respond with ONLY a JSON object (no prose, no markdown fences) shaped as:
{
  "contradictions": [{
    "claimChallenged": string,
    "contradictionType": "evidence_conflict" | "logical_flaw" | "market_risk" | "feasibility_risk" | "unverified_assumption",
    "severity": "low" | "medium" | "high" | "critical",
    "explanation": string,
    "groundedInEvidenceIndexes": number[]   // 1-based indexes into the evidence list you were given
  }],
  "counterEvidence": [{
    "claim": string, "sourceName": string, "citationUrl": string,
    "evidenceType": "market_data" | "competitor" | "academic" | "news" | "community" | "other",
    "publishedDate": string | null, "isForwardLooking": boolean, "isAgentInference": boolean,
    "corroboratingSourceCount": number, "qualityScore": number, "rawExcerpt": string
  }]
}
Never invent a citationUrl — only cite URLs you actually retrieved via search.`;

interface RawContradiction {
  claimChallenged?: unknown;
  contradictionType?: unknown;
  severity?: unknown;
  explanation?: unknown;
  groundedInEvidenceIndexes?: unknown;
}

export class RedTeamAgent implements Agent {
  readonly type = "red_team" as const;

  async run(ctx: AgentContext, provider: LLMProvider): Promise<AgentResult> {
    const opportunity = ctx.opportunity;
    if (!opportunity) {
      throw new Error("RedTeamAgent requires ctx.opportunity");
    }

    const evidenceList = opportunity.evidence
      .map((e, i) => `[${i + 1}] (${e.status}) ${e.summary} — ${e.sourceName} (${e.sourceUrl})`)
      .join("\n");

    const result = await provider.complete({
      model: "capable",
      system: SYSTEM_PROMPT,
      enableWebSearch: true,
      maxTokens: 4096,
      messages: [
        {
          role: "user",
          content: `Opportunity: ${opportunity.title}\n${opportunity.description}\n\nSupporting evidence:\n${evidenceList || "(none)"}\n\nAttack this opportunity.`,
        },
      ],
    });

    const parsed = safeParseObject(result.content);
    const contradictions = parseContradictions(
      Array.isArray(parsed?.contradictions) ? parsed.contradictions : [],
    );
    const counterEvidence = parseFindingsToEvidence(
      JSON.stringify(parsed?.counterEvidence ?? []),
      result.citations,
    );

    return {
      evidence: counterEvidence,
      contradictions,
      summary: `Red-team found ${contradictions.length} contradiction(s), ${counterEvidence.length} counter-evidence item(s).`,
      tokensUsed: { input: result.usage.inputTokens, output: result.usage.outputTokens },
    };
  }
}

function parseContradictions(raw: RawContradiction[]): NewContradictionInput[] {
  const out: NewContradictionInput[] = [];
  for (const r of raw) {
    if (typeof r.claimChallenged !== "string" || typeof r.explanation !== "string") continue;
    const contradictionType = CONTRADICTION_TYPES.includes(
      r.contradictionType as NewContradictionInput["contradictionType"],
    )
      ? (r.contradictionType as NewContradictionInput["contradictionType"])
      : "unverified_assumption";
    const severity = CONTRADICTION_SEVERITIES.includes(
      r.severity as NewContradictionInput["severity"],
    )
      ? (r.severity as NewContradictionInput["severity"])
      : "medium";

    out.push({
      claimChallenged: r.claimChallenged,
      contradictionType,
      severity,
      explanation: r.explanation,
      status: classifyEvidenceStatus({
        hasDirectCitation: false,
        corroboratingSourceCount: 0,
        isForwardLooking: false,
        isAgentInference: true,
      }),
      groundedInEvidenceIndexes: Array.isArray(r.groundedInEvidenceIndexes)
        ? r.groundedInEvidenceIndexes.filter((n): n is number => typeof n === "number")
        : [],
    });
  }
  return out;
}

function safeParseObject(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}
