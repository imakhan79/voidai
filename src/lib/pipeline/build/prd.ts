import type { LLMProvider } from "@/lib/providers/types";
import type { OpportunityForBuild } from "./business-case";

const SYSTEM_PROMPT = `You write a PRD (markdown) for an opportunity in VOID AI, given its
Business Case as prior context. Ground requirements in the opportunity's evidence and scoring
— do not invent user research or metrics that weren't provided. Include sections: Overview,
User Stories, Requirements (functional/non-functional), Success Metrics, Out of Scope.`;

export async function generatePrd(
  opp: OpportunityForBuild,
  businessCaseMarkdown: string,
  provider: LLMProvider,
): Promise<string> {
  const result = await provider.complete({
    model: "capable",
    system: SYSTEM_PROMPT,
    enableWebSearch: false,
    maxTokens: 3072,
    messages: [
      {
        role: "user",
        content: `Opportunity: ${opp.title}\n\nBusiness Case:\n${businessCaseMarkdown}\n\nWrite the PRD.`,
      },
    ],
  });
  return result.content;
}
