import type { Agent, AgentContext, AgentResult } from "./types";
import type { LLMProvider } from "@/lib/providers/types";

const SYSTEM_PROMPT = `You are the Product agent inside VOID AI, an innovation-discovery system.
You do not search the web. You are given the problem/domain statement and the evidence
already gathered by the Research and Market agents. Synthesize: feasibility, likely
differentiation from existing solutions, and how severe the underlying problem appears to
be based only on the evidence provided. Be explicit about which evidence items your
reasoning leans on, and flag where you are inferring beyond what the evidence directly
supports. Respond in prose — this is a synthesis, not a new source of evidence.`;

export class ProductAgent implements Agent {
  readonly type = "product" as const;

  async run(ctx: AgentContext, provider: LLMProvider): Promise<AgentResult> {
    const evidenceSummary = (ctx.priorEvidence ?? [])
      .map((e, i) => `[${i + 1}] (${e.status}) ${e.summary} — ${e.sourceName}`)
      .join("\n");

    const result = await provider.complete({
      model: "capable",
      system: SYSTEM_PROMPT,
      enableWebSearch: false,
      maxTokens: 2048,
      messages: [
        {
          role: "user",
          content: `Problem/domain: ${ctx.problemStatement}\n\nEvidence gathered so far:\n${evidenceSummary || "(none)"}\n\nSynthesize feasibility, differentiation, and problem severity.`,
        },
      ],
    });

    // Product agent produces reasoning, not new evidence rows — a synthesis
    // has no source URL of its own, and evidence.source_url is NOT NULL by
    // design (see supabase/migrations), so it must never insert here.
    return {
      evidence: [],
      summary: result.content,
      tokensUsed: { input: result.usage.inputTokens, output: result.usage.outputTokens },
    };
  }
}
