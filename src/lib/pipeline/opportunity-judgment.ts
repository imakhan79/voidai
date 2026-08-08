import type { LLMProvider } from "@/lib/providers/types";
import type { NewEvidenceInput } from "@/lib/evidence-types";
import type { GapCandidate } from "./gap-detection";
import type { OpportunityJudgment } from "./opportunity-scoring";

const SYSTEM_PROMPT = `You are the opportunity-judgment step inside VOID AI. Given a detected
gap and the evidence around it, judge three independent dimensions on a 0-1 scale:
- marketSignal: how strong is the signal that a real market wants this addressed?
- differentiation: how differentiated would an opportunity here be from existing solutions?
- problemSeverity: how severe/painful is the underlying problem?

This is a judgment of attractiveness only — do not factor in how much evidence exists; that
is scored separately. Respond with ONLY a JSON object (no prose, no markdown fences):
{ "marketSignal": number, "differentiation": number, "problemSeverity": number, "title": string, "description": string }`;

export interface OpportunityCandidate extends OpportunityJudgment {
  title: string;
  description: string;
}

export async function judgeOpportunity(
  gap: GapCandidate,
  evidence: NewEvidenceInput[],
  provider: LLMProvider,
): Promise<OpportunityCandidate> {
  const evidenceList = evidence
    .map((e, i) => `[${i + 1}] (${e.status}) ${e.summary}`)
    .join("\n");

  const result = await provider.complete({
    model: "capable",
    system: SYSTEM_PROMPT,
    enableWebSearch: false,
    maxTokens: 1024,
    messages: [
      {
        role: "user",
        content: `Gap: ${gap.title}\n${gap.description}\n\nRelated evidence:\n${evidenceList || "(none)"}`,
      },
    ],
  });

  return parseJudgment(result.content, gap);
}

function parseJudgment(rawContent: string, gap: GapCandidate): OpportunityCandidate {
  const start = rawContent.indexOf("{");
  const end = rawContent.lastIndexOf("}");
  const fallback: OpportunityCandidate = {
    title: gap.title,
    description: gap.description,
    marketSignal: 0,
    differentiation: 0,
    problemSeverity: 0,
  };
  if (start === -1 || end === -1 || end < start) return fallback;

  try {
    const parsed = JSON.parse(rawContent.slice(start, end + 1));
    return {
      title: typeof parsed.title === "string" ? parsed.title : gap.title,
      description:
        typeof parsed.description === "string" ? parsed.description : gap.description,
      marketSignal: clamp01(Number(parsed.marketSignal)),
      differentiation: clamp01(Number(parsed.differentiation)),
      problemSeverity: clamp01(Number(parsed.problemSeverity)),
    };
  } catch {
    return fallback;
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
