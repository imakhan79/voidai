import type { LLMProvider } from "@/lib/providers/types";
import type { NewEvidenceInput } from "@/lib/evidence-types";
import type { EvidenceStatus } from "@/lib/domain-types";
import { classifyEvidenceStatus } from "./evidence-status";

export interface GapCandidate {
  title: string;
  description: string;
  status: EvidenceStatus;
  /** 1-based indexes into the evidence array passed in, for gap_evidence linkage. */
  supportingEvidenceIndexes: number[];
}

const SYSTEM_PROMPT = `You are the gap-detection step inside VOID AI. Given a problem/domain
statement and the evidence gathered about it, identify white-space gaps: topics with weak,
contradictory, or absent coverage relative to the problem — places where "what should exist
next" is unanswered by current evidence. Do not invent facts; only reason over the evidence
given.

Respond with ONLY a JSON array (no prose, no markdown fences), each item shaped as:
{
  "title": string,
  "description": string,
  "supportingEvidenceIndexes": number[],  // 1-based indexes into the evidence list, may be empty
  "isWellGrounded": boolean  // true if multiple strong (VERIFIED/SUPPORTED) evidence items support this gap existing
}`;

interface RawGap {
  title?: unknown;
  description?: unknown;
  supportingEvidenceIndexes?: unknown;
  isWellGrounded?: unknown;
}

export async function detectGaps(
  problemStatement: string,
  evidence: NewEvidenceInput[],
  provider: LLMProvider,
): Promise<GapCandidate[]> {
  if (evidence.length === 0) return [];

  const evidenceList = evidence
    .map((e, i) => `[${i + 1}] (${e.status}) ${e.summary} — ${e.sourceName}`)
    .join("\n");

  const result = await provider.complete({
    model: "capable",
    system: SYSTEM_PROMPT,
    enableWebSearch: false,
    maxTokens: 3072,
    messages: [
      {
        role: "user",
        content: `Problem/domain: ${problemStatement}\n\nEvidence:\n${evidenceList}\n\nIdentify white-space gaps.`,
      },
    ],
  });

  return parseGaps(result.content, evidence.length);
}

function parseGaps(rawContent: string, evidenceCount: number): GapCandidate[] {
  const start = rawContent.indexOf("[");
  const end = rawContent.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];

  let raw: unknown;
  try {
    raw = JSON.parse(rawContent.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];

  const gaps: GapCandidate[] = [];
  for (const item of raw as RawGap[]) {
    if (typeof item?.title !== "string" || typeof item?.description !== "string") continue;

    const indexes = Array.isArray(item.supportingEvidenceIndexes)
      ? item.supportingEvidenceIndexes.filter(
          (n): n is number => typeof n === "number" && n >= 1 && n <= evidenceCount,
        )
      : [];

    gaps.push({
      title: item.title,
      description: item.description,
      supportingEvidenceIndexes: indexes,
      status: classifyEvidenceStatus({
        hasDirectCitation: false,
        corroboratingSourceCount: 0,
        isForwardLooking: false,
        isAgentInference: true,
        qualitySignalMissing: indexes.length === 0 && !item.isWellGrounded,
      }),
    });
  }
  return gaps;
}
