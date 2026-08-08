import type { NewEvidenceInput, EvidenceType } from "@/lib/evidence-types";
import type { GroundedSnippet } from "@/lib/providers/types";
import { classifyEvidenceStatus } from "@/lib/pipeline/evidence-status";

const MIN_SNIPPET_LENGTH = 25;

/**
 * Converts provider-attributed grounded snippets directly into evidence rows
 * — no model self-report of a citation URL involved, since the URL comes
 * straight from the provider's own grounding metadata. This is the primary
 * extraction path for providers that support span-level grounding (Gemini);
 * `parseFindingsToEvidence` remains as a fallback for providers that don't.
 */
export function groundedSnippetsToEvidence(
  snippets: GroundedSnippet[],
  defaultEvidenceType: EvidenceType,
): NewEvidenceInput[] {
  const evidence: NewEvidenceInput[] = [];

  for (const snippet of snippets) {
    const text = cleanMarkdown(snippet.text);
    if (text.length < MIN_SNIPPET_LENGTH || snippet.citations.length === 0) continue;

    const primary = snippet.citations[0];
    if (!primary) continue;

    const status = classifyEvidenceStatus({
      hasDirectCitation: true,
      corroboratingSourceCount: snippet.citations.length - 1,
      isForwardLooking: /\b(will|forecast|expected to|projected|by 20\d{2})\b/i.test(text),
      isAgentInference: false,
    });

    evidence.push({
      sourceName: primary.title ?? new URL(primary.url).hostname,
      sourceUrl: primary.url,
      publishedDate: null,
      evidenceType: defaultEvidenceType,
      qualityScore: 0.6,
      confidenceScore: 0.6,
      status,
      summary: text,
      rawExcerpt: text,
    });
  }

  return evidence;
}

function cleanMarkdown(text: string): string {
  return text
    .trim()
    .replace(/^[*\-•]\s+/, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .trim();
}
