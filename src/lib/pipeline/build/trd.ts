import type { LLMProvider } from "@/lib/providers/types";
import type { OpportunityForBuild } from "./business-case";

const SYSTEM_PROMPT = `You write a TRD (markdown) for an opportunity in VOID AI, given its PRD
as prior context. Keep this deliberately shallow — a technical sketch, not a full spec — since
dedicated UI/UX, Architecture, Database, and API stages follow later. Include sections:
Architecture Sketch, Data Model Sketch, API Surface Sketch, Key Technical Risks.`;

export async function generateTrd(
  opp: OpportunityForBuild,
  prdMarkdown: string,
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
        content: `Opportunity: ${opp.title}\n\nPRD:\n${prdMarkdown}\n\nWrite the TRD.`,
      },
    ],
  });
  return result.content;
}
