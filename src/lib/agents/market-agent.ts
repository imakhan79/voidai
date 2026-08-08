import type { Agent, AgentContext, AgentResult } from "./types";
import type { LLMProvider } from "@/lib/providers/types";
import { parseFindingsToEvidence } from "./parse-findings";
import { groundedSnippetsToEvidence } from "./grounded-snippets-to-evidence";

const SYSTEM_PROMPT = `You are the Market agent inside VOID AI, an innovation-discovery system.
Given a problem/domain statement, use web search focused narrowly on: market sizing,
existing competitor products, pricing, funding signals, and adoption trends.

Write your findings as clear, factual, self-contained sentences — one distinct claim per
sentence, grounded in what you found via search. Do not state a claim you did not just
retrieve via search. Prefer plain prose organized under short headings over lists of
fragments; each sentence should stand on its own as a checkable claim.`;

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

    const evidence =
      result.groundedSnippets && result.groundedSnippets.length > 0
        ? groundedSnippetsToEvidence(result.groundedSnippets, "market_data")
        : parseFindingsToEvidence(result.content, result.citations, ALLOWED_TYPES);

    return {
      evidence,
      summary: `Market agent surfaced ${evidence.length} cited finding(s) from ${result.citations.length} search result(s).`,
      tokensUsed: { input: result.usage.inputTokens, output: result.usage.outputTokens },
    };
  }
}
