import { describe, expect, it } from "vitest";
import { groundedSnippetsToEvidence } from "@/lib/agents/grounded-snippets-to-evidence";

describe("groundedSnippetsToEvidence", () => {
  it("converts a grounded snippet with a real citation into an evidence row", () => {
    const evidence = groundedSnippetsToEvidence(
      [
        {
          text: "Several rural clinics in Kenya use offline speech-to-text tools for basic charting.",
          citations: [{ url: "https://example.com/kenya-clinics", title: "example.com" }],
        },
      ],
      "other",
    );

    expect(evidence).toHaveLength(1);
    expect(evidence[0]?.sourceUrl).toBe("https://example.com/kenya-clinics");
    expect(evidence[0]?.status).toBe("SUPPORTED");
  });

  it("drops snippets with no backing citation (nothing to fabricate from)", () => {
    const evidence = groundedSnippetsToEvidence(
      [{ text: "This claim has no citation attached to it at all here.", citations: [] }],
      "other",
    );
    expect(evidence).toHaveLength(0);
  });

  it("drops snippets that are too short to be a meaningful claim", () => {
    const evidence = groundedSnippetsToEvidence(
      [{ text: "Too short.", citations: [{ url: "https://example.com/x" }] }],
      "other",
    );
    expect(evidence).toHaveLength(0);
  });

  it("strips leading markdown bullets and bold markers without altering the claim", () => {
    const evidence = groundedSnippetsToEvidence(
      [
        {
          text: "* **MatrixCare** offers offline documentation for home health agencies",
          citations: [{ url: "https://example.com/matrixcare" }],
        },
      ],
      "other",
    );
    expect(evidence[0]?.summary).toBe(
      "MatrixCare offers offline documentation for home health agencies",
    );
  });

  it("marks VERIFIED when multiple independent citations back the same snippet", () => {
    const evidence = groundedSnippetsToEvidence(
      [
        {
          text: "Multiple independent reports confirm the market is growing rapidly this year.",
          citations: [
            { url: "https://a.example.com/report" },
            { url: "https://b.example.com/report" },
          ],
        },
      ],
      "market_data",
    );
    expect(evidence[0]?.status).toBe("VERIFIED");
  });
});
