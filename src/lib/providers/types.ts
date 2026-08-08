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
}

export interface LLMProvider {
  readonly id: "anthropic" | "openai" | "gemini" | "local";
  complete(req: CompletionRequest): Promise<CompletionResult>;
}
