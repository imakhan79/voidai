import type { Agent, AgentContext, AgentResult } from "./types";
import type { LLMProvider } from "@/lib/providers/types";
import { parseFindingsToEvidence } from "./parse-findings";

const SYSTEM_PROMPT = `You are the Market agent inside VOID AI, an innovation-discovery system.
Given a problem/domain statement, use web search focused narrowly on: market sizing,
existing competitor products, pricing, funding signals, and adoption trends.

Never state a claim you did not just retrieve via search. After searching, respond with
ONLY a JSON array (no prose, no markdown fences) of findings, each shaped as:
{
  "claim": string,
  "sourceName": string,
  "citationUrl": string,
  "evidenceType": "market_data" | "competitor",
  "publishedDate": string | null,
  "isForwardLooking": boolean,
  "isAgentInference": boolean,
  "corroboratingSourceCount": number,
  "qualityScore": number,
  "rawExcerpt": string
}`;

const ALLOWED_TYPES = ["market_data", "competitor"] as const;

export class MarketAgent implements Agent {
  readonly type = "market" as const;

  async run(ctx: AgentContext, provider: LLMProvider): Promise<AgentResult> {
    const result = await provider.complete({
      model: "capable",
      system: SYSTEM_PROMPT,
      enableWebSearch: true,
      maxTokens: 4096,
      messages: [
        {
          role: "user",
          content: `Problem/domain: ${ctx.problemStatement}\n\nFocus on market size, competitors, pricing, and funding/adoption signals.`,
        },
      ],
    });

    const evidence = parseFindingsToEvidence(
      result.content,
      result.citations,
      ALLOWED_TYPES,
    );

    return {
      evidence,
      summary: `Market agent surfaced ${evidence.length} cited finding(s) from ${result.citations.length} search result(s).`,
      tokensUsed: { input: result.usage.inputTokens, output: result.usage.outputTokens },
    };
  }
}
