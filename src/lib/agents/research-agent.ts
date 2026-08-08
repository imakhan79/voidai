import type { Agent, AgentContext } from "./types";
import type { AgentResult } from "./types";
import type { LLMProvider } from "@/lib/providers/types";
import { parseFindingsToEvidence } from "./parse-findings";

const SYSTEM_PROMPT = `You are the Research agent inside VOID AI, an innovation-discovery system.
Given a problem/domain statement, use web search to find real primary sources: academic
work, industry analysis, news coverage, and community discussion relevant to the space.

Never state a claim you did not just retrieve via search. After searching, respond with
ONLY a JSON array (no prose, no markdown fences) of findings, each shaped as:
{
  "claim": string,
  "sourceName": string,
  "citationUrl": string,        // must be a URL you actually retrieved via search
  "evidenceType": "academic" | "news" | "community" | "other",
  "publishedDate": string | null,
  "isForwardLooking": boolean,  // true if this is a forecast about the future
  "isAgentInference": boolean,  // true if derived by your reasoning, not stated by the source
  "corroboratingSourceCount": number, // other independent sources you found agreeing
  "qualityScore": number,       // 0-1, your assessment of source credibility
  "rawExcerpt": string
}`;

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

    const evidence = parseFindingsToEvidence(
      result.content,
      result.citations,
      ALLOWED_TYPES,
    );

    return {
      evidence,
      summary: `Research agent surfaced ${evidence.length} cited finding(s) from ${result.citations.length} search result(s).`,
      tokensUsed: { input: result.usage.inputTokens, output: result.usage.outputTokens },
    };
  }
}
