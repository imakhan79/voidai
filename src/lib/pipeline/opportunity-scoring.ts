import type { EvidenceStatus } from "@/lib/domain-types";

/** How much each evidence status counts toward confidence, before quality/count/diversity dampening. */
const STATUS_WEIGHT: Record<EvidenceStatus, number> = {
  VERIFIED: 1,
  SUPPORTED: 0.75,
  INFERRED: 0.5,
  HYPOTHESIS: 0.25,
  PREDICTION: 0.25,
  UNKNOWN: 0,
};

/** Evidence count at which the count-dampening factor saturates to 1. */
const FULL_CONFIDENCE_EVIDENCE_COUNT = 4;
/** Distinct-source count at which the diversity-dampening factor saturates to 1. */
const FULL_CONFIDENCE_SOURCE_DIVERSITY = 3;

const OPPORTUNITY_WEIGHTS = {
  marketSignal: 0.4,
  differentiation: 0.35,
  problemSeverity: 0.25,
} as const;

export interface OpportunityJudgment {
  /** 0-1, LLM judgment of how strong the market signal is. */
  marketSignal: number;
  /** 0-1, LLM judgment of how differentiated the opportunity is. */
  differentiation: number;
  /** 0-1, LLM judgment of how severe the underlying problem is. */
  problemSeverity: number;
}

export interface EvidenceForConfidence {
  status: EvidenceStatus;
  /** 0-1 */
  qualityScore: number;
  sourceName: string;
}

export interface ScoringBreakdown {
  opportunity: OpportunityJudgment & { weights: typeof OPPORTUNITY_WEIGHTS };
  confidence: {
    statusWeightedAvg: number;
    evidenceCount: number;
    sourceDiversity: number;
    countFactor: number;
    diversityFactor: number;
  };
}

export interface ScoringResult {
  /** 0-100 — attractiveness of the opportunity. Independent of confidenceScore. */
  opportunityScore: number;
  /** 0-100 — how much evidence actually backs it. Mechanically derived, never an LLM judgment. */
  confidenceScore: number;
  breakdown: ScoringBreakdown;
}

/**
 * Pure, deterministic scoring. opportunityScore and confidenceScore are
 * computed from disjoint inputs on purpose — combining "how attractive" with
 * "how well-evidenced" into one number would violate the product's core
 * mandate that the two must never be conflated.
 */
export function scoreOpportunity(
  judgment: OpportunityJudgment,
  evidence: EvidenceForConfidence[],
): ScoringResult {
  const opportunityScoreRaw =
    judgment.marketSignal * OPPORTUNITY_WEIGHTS.marketSignal +
    judgment.differentiation * OPPORTUNITY_WEIGHTS.differentiation +
    judgment.problemSeverity * OPPORTUNITY_WEIGHTS.problemSeverity;

  const evidenceCount = evidence.length;
  const statusWeightedAvg =
    evidenceCount === 0
      ? 0
      : evidence.reduce(
          (sum, e) => sum + STATUS_WEIGHT[e.status] * e.qualityScore,
          0,
        ) / evidenceCount;

  const sourceDiversity = new Set(evidence.map((e) => e.sourceName)).size;
  const countFactor = Math.min(1, evidenceCount / FULL_CONFIDENCE_EVIDENCE_COUNT);
  const diversityFactor = Math.min(
    1,
    sourceDiversity / FULL_CONFIDENCE_SOURCE_DIVERSITY,
  );

  const confidenceScoreRaw =
    statusWeightedAvg * Math.min(countFactor, diversityFactor);

  return {
    opportunityScore: round2(opportunityScoreRaw * 100),
    confidenceScore: round2(confidenceScoreRaw * 100),
    breakdown: {
      opportunity: { ...judgment, weights: OPPORTUNITY_WEIGHTS },
      confidence: {
        statusWeightedAvg,
        evidenceCount,
        sourceDiversity,
        countFactor,
        diversityFactor,
      },
    },
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
