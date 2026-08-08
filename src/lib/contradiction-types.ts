import type { EvidenceStatus } from "@/lib/domain-types";

export const CONTRADICTION_TYPES = [
  "evidence_conflict",
  "logical_flaw",
  "market_risk",
  "feasibility_risk",
  "unverified_assumption",
] as const;
export type ContradictionType = (typeof CONTRADICTION_TYPES)[number];

export const CONTRADICTION_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type ContradictionSeverity = (typeof CONTRADICTION_SEVERITIES)[number];

/** Shape written into the `contradictions` table. */
export interface NewContradictionInput {
  claimChallenged: string;
  contradictionType: ContradictionType;
  severity: ContradictionSeverity;
  explanation: string;
  status: EvidenceStatus;
  /** Indices into the opportunity's evidence array this contradiction is grounded in. */
  groundedInEvidenceIndexes: number[];
}
