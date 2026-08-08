import "server-only";

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolUseRequest {
  id: string;
  name: string;
  input: unknown;
}

export interface Citation {
  url: string;
  title?: string;
}

/**
 * A span of the model's own response text, resolved by the provider's own
 * grounding metadata to the real citation(s) backing it — not self-reported
 * by the model. Preferred over parsing citationUrl fields out of prose,
 * since it doesn't depend on the model faithfully reproducing an opaque
 * source URL it never actually saw as text.
 */
export interface GroundedSnippet {
  text: string;
  citations: Citation[];
}

export interface CompletionRequest {
  /** Logical tier — each provider maps this to its own model id. */
  model: "capable" | "cheap";
  system?: string;
  messages: LLMMessage[];
  /** Provider-native tools (e.g. Anthropic's server-executed web_search) to enable. */
  enableWebSearch?: boolean;
  tools?: ToolDefinition[];
  maxTokens: number;
}

export type StopReason =
  | "end_turn"
  | "tool_use"
  | "max_tokens"
  | "refusal"
  | "error";

export interface CompletionResult {
  content: string;
  toolUses: ToolUseRequest[];
  stopReason: StopReason;
  usage: { inputTokens: number; outputTokens: number };
  /**
   * Citations extracted from provider-executed tool results (e.g. Anthropic's
   * web_search_tool_result blocks), never parsed from model prose. Empty when
   * no search was performed — callers must not write evidence rows for claims
   * with no accompanying citation.
   */
  citations: Citation[];
  /** Populated only by providers whose grounding metadata gives text-span-level attribution (e.g. Gemini). */
  groundedSnippets?: GroundedSnippet[];
}

export interface LLMProvider {
  readonly id: "anthropic" | "openai" | "gemini" | "local";
  complete(req: CompletionRequest): Promise<CompletionResult>;
}
