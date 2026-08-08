import "server-only";
import type { LLMProvider } from "./types";
import { AnthropicProvider } from "./anthropic";

const PROVIDERS: Record<string, () => LLMProvider> = {
  anthropic: () => new AnthropicProvider(),
};

let cached: LLMProvider | null = null;

export function getProvider(id?: string): LLMProvider {
  const providerId = id ?? process.env.LLM_PROVIDER ?? "anthropic";
  const factory = PROVIDERS[providerId];
  if (!factory) {
    throw new Error(`Unknown LLM provider "${providerId}"`);
  }
  cached ??= factory();
  return cached;
}
