import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type {
  CompletionRequest,
  CompletionResult,
  Citation,
  LLMProvider,
  StopReason,
  ToolUseRequest,
} from "./types";

const MODEL_BY_TIER: Record<CompletionRequest["model"], string> = {
  capable: "claude-opus-5",
  cheap: "claude-haiku-4-5-20251001",
};

const STOP_REASON_MAP: Record<string, StopReason> = {
  end_turn: "end_turn",
  tool_use: "tool_use",
  max_tokens: "max_tokens",
  refusal: "refusal",
  stop_sequence: "end_turn",
  pause_turn: "tool_use",
};

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export class AnthropicProvider implements LLMProvider {
  readonly id = "anthropic" as const;

  async complete(req: CompletionRequest): Promise<CompletionResult> {
    const tools: Anthropic.Messages.ToolUnion[] = [
      ...(req.enableWebSearch
        ? [
            {
              type: "web_search_20260318" as const,
              name: "web_search" as const,
            },
          ]
        : []),
      ...(req.tools ?? []).map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.inputSchema as Anthropic.Messages.Tool.InputSchema,
      })),
    ];

    const message = await getClient().messages.create({
      model: MODEL_BY_TIER[req.model],
      max_tokens: req.maxTokens,
      system: req.system,
      messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
      tools: tools.length > 0 ? tools : undefined,
    });

    let content = "";
    const toolUses: ToolUseRequest[] = [];
    const citations: Citation[] = [];

    for (const block of message.content) {
      if (block.type === "text") {
        content += block.text;
      } else if (block.type === "tool_use") {
        toolUses.push({ id: block.id, name: block.name, input: block.input });
      } else if (block.type === "web_search_tool_result") {
        if (Array.isArray(block.content)) {
          for (const result of block.content) {
            citations.push({ url: result.url, title: result.title });
          }
        }
      }
    }

    return {
      content,
      toolUses,
      stopReason: STOP_REASON_MAP[message.stop_reason ?? "end_turn"] ?? "error",
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
      citations,
    };
  }
}
