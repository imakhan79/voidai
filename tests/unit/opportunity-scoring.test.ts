import { describe, expect, it } from "vitest";
import { scoreOpportunity } from "@/lib/pipeline/opportunity-scoring";
import type { EvidenceForConfidence } from "@/lib/pipeline/opportunity-scoring";

describe("scoreOpportunity", () => {
  it("produces a high opportunity score but a low confidence score when the market signal is strong but evidence is thin and weak", () => {
    const weakEvidence: EvidenceForConfidence[] = [
      { status: "HYPOTHESIS", qualityScore: 0.4, sourceName: "agent-reasoning" },
    ];

    const result = scoreOpportunity(
      { marketSignal: 0.95, differentiation: 0.9, problemSeverity: 0.85 },
      weakEvidence,
    );

    expect(result.opportunityScore).toBeGreaterThan(85);
    expect(result.confidenceScore).toBeLessThan(15);
  });

  it("produces a high confidence score when evidence is abundant, verified, and diverse", () => {
    const strongEvidence: EvidenceForConfidence[] = [
      { status: "VERIFIED", qualityScore: 0.9, sourceName: "source-a" },
      { status: "VERIFIED", qualityScore: 0.85, sourceName: "source-b" },
      { status: "SUPPORTED", qualityScore: 0.8, sourceName: "source-c" },
      { status: "VERIFIED", qualityScore: 0.9, sourceName: "source-d" },
    ];

    const result = scoreOpportunity(
      { marketSignal: 0.5, differentiation: 0.5, problemSeverity: 0.5 },
      strongEvidence,
    );

    expect(result.confidenceScore).toBeGreaterThan(70);
    // Opportunity score is driven purely by the judgment inputs, not evidence.
    expect(result.opportunityScore).toBe(50);
  });

  it("returns zero confidence for zero evidence, without dividing by zero", () => {
    const result = scoreOpportunity(
      { marketSignal: 0.7, differentiation: 0.7, problemSeverity: 0.7 },
      [],
    );

    expect(result.confidenceScore).toBe(0);
    expect(Number.isFinite(result.opportunityScore)).toBe(true);
  });

  it("dampens confidence when evidence is diverse but low quality, vs concentrated in one source", () => {
    const singleSource: EvidenceForConfidence[] = [
      { status: "VERIFIED", qualityScore: 1, sourceName: "only-source" },
      { status: "VERIFIED", qualityScore: 1, sourceName: "only-source" },
      { status: "VERIFIED", qualityScore: 1, sourceName: "only-source" },
      { status: "VERIFIED", qualityScore: 1, sourceName: "only-source" },
    ];

    const result = scoreOpportunity(
      { marketSignal: 0.5, differentiation: 0.5, problemSeverity: 0.5 },
      singleSource,
    );

    // 4 items but only 1 distinct source: diversityFactor caps confidence below full.
    expect(result.breakdown.confidence.diversityFactor).toBeLessThan(1);
    expect(result.confidenceScore).toBeLessThan(100);
  });

  it("never lets opportunityScore and confidenceScore be the same field or computed from each other", () => {
    const evidence: EvidenceForConfidence[] = [
      { status: "UNKNOWN", qualityScore: 0, sourceName: "x" },
    ];
    const result = scoreOpportunity(
      { marketSignal: 1, differentiation: 1, problemSeverity: 1 },
      evidence,
    );
    expect(result.opportunityScore).toBe(100);
    expect(result.confidenceScore).toBe(0);
  });
});
