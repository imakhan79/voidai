import { describe, expect, it } from "vitest";
import { parseFindingsToEvidence } from "@/lib/agents/parse-findings";

const REAL_CITATION = { url: "https://example.com/real-source", title: "Real Source" };

describe("parseFindingsToEvidence", () => {
  it("keeps a finding whose citationUrl matches a real returned citation", () => {
    const raw = JSON.stringify([
      {
        claim: "Something true",
        sourceName: "Example",
        citationUrl: REAL_CITATION.url,
        evidenceType: "news",
        publishedDate: "2026-01-01",
        isForwardLooking: false,
        isAgentInference: false,
        corroboratingSourceCount: 0,
        qualityScore: 0.8,
        rawExcerpt: "excerpt",
      },
    ]);

    const evidence = parseFindingsToEvidence(raw, [REAL_CITATION]);
    expect(evidence).toHaveLength(1);
    expect(evidence[0]?.sourceUrl).toBe(REAL_CITATION.url);
    expect(evidence[0]?.status).toBe("SUPPORTED");
  });

  it("drops a finding whose citationUrl was never actually returned by the provider (fabrication)", () => {
    const raw = JSON.stringify([
      {
        claim: "Invented claim",
        sourceName: "Made up",
        citationUrl: "https://not-a-real-search-result.example/fake",
        evidenceType: "news",
        publishedDate: null,
        isForwardLooking: false,
        isAgentInference: false,
        corroboratingSourceCount: 0,
        qualityScore: 0.9,
        rawExcerpt: "",
      },
    ]);

    const evidence = parseFindingsToEvidence(raw, [REAL_CITATION]);
    expect(evidence).toHaveLength(0);
  });

  it("returns an empty array for malformed JSON instead of throwing", () => {
    expect(parseFindingsToEvidence("not json at all", [REAL_CITATION])).toEqual([]);
  });

  it("falls back evidenceType to 'other' when the model returns a disallowed type", () => {
    const raw = JSON.stringify([
      {
        claim: "x",
        sourceName: "y",
        citationUrl: REAL_CITATION.url,
        evidenceType: "patent",
        corroboratingSourceCount: 1,
        qualityScore: 0.5,
      },
    ]);

    const evidence = parseFindingsToEvidence(raw, [REAL_CITATION], ["news", "other"]);
    expect(evidence[0]?.evidenceType).toBe("other");
  });
});
