import type { Agent, AgentContext } from "./types";
import type { AgentResult } from "./types";
import type { LLMProvider } from "@/lib/providers/types";
import { parseFindingsToEvidence } from "./parse-findings";
import { groundedSnippetsToEvidence } from "./grounded-snippets-to-evidence";

const SYSTEM_PROMPT = `You are the Research agent inside VOID AI, an innovation-discovery system.
Given a problem/domain statement, use web search to find real primary sources: academic
work, industry analysis, news coverage, and community discussion relevant to the space.

Write your findings as clear, factual, self-contained sentences — one distinct claim per
sentence, grounded in what you found via search. Do not state a claim you did not just
retrieve via search. Prefer plain prose organized under short headings over lists of
fragments; each sentence should stand on its own as a checkable claim.`;

const ALLOWED_TYPES = ["academic", "news", "community", "other"] as const;

export class ResearchAgent implements Agent {
  readonly type = "research" as const;

  async run(ctx: AgentContext, provider: LLMProvider): Promise<AgentResult> {
    const result = await provider.complete({
      model: "capable",
      system: SYSTEM_PROMPT,
      enableWebSearch: true,
      maxTokens: 4096,
      messages: [
        {
          role: "user",
          content: `Problem/domain: ${ctx.problemStatement}\n\nResearch this broadly and surface primary sources, prior art, and existing context.`,
        },
      ],
    });

    const evidence =
      result.groundedSnippets && result.groundedSnippets.length > 0
        ? groundedSnippetsToEvidence(result.groundedSnippets, "other")
        : parseFindingsToEvidence(result.content, result.citations, ALLOWED_TYPES);

    return {
      evidence,
      summary: `Research agent surfaced ${evidence.length} cited finding(s) from ${result.citations.length} search result(s).`,
      tokensUsed: { input: result.usage.inputTokens, output: result.usage.outputTokens },
    };
  }
}
