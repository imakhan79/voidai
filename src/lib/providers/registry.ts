import "server-only";
import type { LLMProvider } from "./types";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";

const PROVIDERS: Record<string, () => LLMProvider> = {
  anthropic: () => new AnthropicProvider(),
  gemini: () => new GeminiProvider(),
};

let cached: LLMProvider | null = null;

export function getProvider(id?: string): LLMProvider {
  const providerId = id ?? process.env.LLM_PROVIDER ?? "gemini";
  const factory = PROVIDERS[providerId];
  if (!factory) {
    throw new Error(`Unknown LLM provider "${providerId}"`);
  }
  cached ??= factory();
  return cached;
}
