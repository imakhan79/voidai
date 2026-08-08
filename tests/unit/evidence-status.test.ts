import { describe, expect, it } from "vitest";
import { classifyEvidenceStatus } from "@/lib/pipeline/evidence-status";

describe("classifyEvidenceStatus", () => {
  it("returns UNKNOWN when quality signal is missing, regardless of other flags", () => {
    expect(
      classifyEvidenceStatus({
        hasDirectCitation: true,
        corroboratingSourceCount: 5,
        isForwardLooking: false,
        isAgentInference: false,
        qualitySignalMissing: true,
      }),
    ).toBe("UNKNOWN");
  });

  it("returns PREDICTION for forward-looking claims even when cited", () => {
    expect(
      classifyEvidenceStatus({
        hasDirectCitation: true,
        corroboratingSourceCount: 3,
        isForwardLooking: true,
        isAgentInference: false,
      }),
    ).toBe("PREDICTION");
  });

  it("returns VERIFIED for a cited claim with at least one corroborating source", () => {
    expect(
      classifyEvidenceStatus({
        hasDirectCitation: true,
        corroboratingSourceCount: 1,
        isForwardLooking: false,
        isAgentInference: false,
      }),
    ).toBe("VERIFIED");
  });

  it("returns SUPPORTED for a cited claim with no corroboration yet", () => {
    expect(
      classifyEvidenceStatus({
        hasDirectCitation: true,
        corroboratingSourceCount: 0,
        isForwardLooking: false,
        isAgentInference: false,
      }),
    ).toBe("SUPPORTED");
  });

  it("returns INFERRED for an uncited claim derived from other evidence", () => {
    expect(
      classifyEvidenceStatus({
        hasDirectCitation: false,
        corroboratingSourceCount: 0,
        isForwardLooking: false,
        isAgentInference: true,
      }),
    ).toBe("INFERRED");
  });

  it("returns HYPOTHESIS for an uncited claim with no grounding at all", () => {
    expect(
      classifyEvidenceStatus({
        hasDirectCitation: false,
        corroboratingSourceCount: 0,
        isForwardLooking: false,
        isAgentInference: false,
      }),
    ).toBe("HYPOTHESIS");
  });
});
