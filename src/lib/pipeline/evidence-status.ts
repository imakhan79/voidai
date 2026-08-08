import type { EvidenceStatus } from "@/lib/domain-types";

export interface EvidenceClassificationInput {
  /** A real citation URL was captured from a provider tool-result (e.g. web_search). */
  hasDirectCitation: boolean;
  /** Count of *additional* independent sources beyond the primary citation that agree. */
  corroboratingSourceCount: number;
  /** The claim is a forecast/forward-looking statement rather than a fact about the present or past. */
  isForwardLooking: boolean;
  /** The claim was derived by the agent reasoning over other evidence, not asserted by any source. */
  isAgentInference: boolean;
  /** Quality/date/source metadata required to classify at all is missing or unresolvable. */
  qualitySignalMissing?: boolean;
}

/**
 * Pure classification: never write an evidence row with a status this
 * function wouldn't assign — it is the single source of truth for what
 * VERIFIED/SUPPORTED/INFERRED/HYPOTHESIS/PREDICTION/UNKNOWN mean in VOID AI.
 */
export function classifyEvidenceStatus(
  input: EvidenceClassificationInput,
): EvidenceStatus {
  if (input.qualitySignalMissing) {
    return "UNKNOWN";
  }
  if (input.isForwardLooking) {
    return "PREDICTION";
  }
  if (input.hasDirectCitation) {
    return input.corroboratingSourceCount >= 1 ? "VERIFIED" : "SUPPORTED";
  }
  return input.isAgentInference ? "INFERRED" : "HYPOTHESIS";
}
