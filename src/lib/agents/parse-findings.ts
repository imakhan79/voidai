import type { NewEvidenceInput, EvidenceType } from "@/lib/evidence-types";
import { EVIDENCE_TYPES } from "@/lib/evidence-types";
import type { Citation } from "@/lib/providers/types";
import { classifyEvidenceStatus } from "@/lib/pipeline/evidence-status";

interface RawFinding {
  claim?: unknown;
  sourceName?: unknown;
  citationUrl?: unknown;
  evidenceType?: unknown;
  publishedDate?: unknown;
  isForwardLooking?: unknown;
  isAgentInference?: unknown;
  corroboratingSourceCount?: unknown;
  qualityScore?: unknown;
  rawExcerpt?: unknown;
}

/**
 * Turns an agent's raw JSON-findings response into evidence rows, enforcing
 * the anti-fabrication rule in code: a finding is dropped entirely unless its
 * citationUrl is one the provider actually returned via a tool result. The
 * model's prose is never trusted as the source of a URL.
 */
export function parseFindingsToEvidence(
  rawContent: string,
  citations: Citation[],
  allowedTypes: readonly EvidenceType[] = EVIDENCE_TYPES,
): NewEvidenceInput[] {
  const citedUrls = new Set(citations.map((c) => c.url));

  let findings: unknown;
  try {
    findings = JSON.parse(extractJsonArray(rawContent));
  } catch {
    return [];
  }
  if (!Array.isArray(findings)) return [];

  const evidence: NewEvidenceInput[] = [];
  for (const raw of findings as RawFinding[]) {
    if (!raw || typeof raw.citationUrl !== "string") continue;
    if (!citedUrls.has(raw.citationUrl)) continue;

    const evidenceType = allowedTypes.includes(raw.evidenceType as EvidenceType)
      ? (raw.evidenceType as EvidenceType)
      : "other";

    const status = classifyEvidenceStatus({
      hasDirectCitation: true,
      corroboratingSourceCount: Math.max(
        0,
        Number(raw.corroboratingSourceCount) || 0,
      ),
      isForwardLooking: Boolean(raw.isForwardLooking),
      isAgentInference: Boolean(raw.isAgentInference),
    });

    const quality = clamp01(Number(raw.qualityScore) || 0.5);

    evidence.push({
      sourceName:
        typeof raw.sourceName === "string" ? raw.sourceName : "Unknown source",
      sourceUrl: raw.citationUrl,
      publishedDate:
        typeof raw.publishedDate === "string" ? raw.publishedDate : null,
      evidenceType,
      qualityScore: quality,
      confidenceScore: quality,
      status,
      summary: typeof raw.claim === "string" ? raw.claim : "",
      rawExcerpt: typeof raw.rawExcerpt === "string" ? raw.rawExcerpt : null,
    });
  }
  return evidence;
}

function extractJsonArray(text: string): string {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return "[]";
  return text.slice(start, end + 1);
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
