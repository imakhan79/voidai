import "server-only";
import { GoogleGenAI } from "@google/genai";
import type {
  CompletionRequest,
  CompletionResult,
  Citation,
  GroundedSnippet,
  LLMProvider,
  StopReason,
} from "./types";

// gemini-2.5-pro has a 0-quota free tier on this key (RESOURCE_EXHAUSTED at
// request time, not a code-level constraint) — both tiers use flash until
// the key is upgraded to a paid plan.
const MODEL_BY_TIER: Record<CompletionRequest["model"], string> = {
  capable: "gemini-2.5-flash",
  cheap: "gemini-2.5-flash",
};

const FINISH_REASON_MAP: Record<string, StopReason> = {
  STOP: "end_turn",
  MAX_TOKENS: "max_tokens",
  SAFETY: "refusal",
  RECITATION: "refusal",
  BLOCKLIST: "refusal",
  PROHIBITED_CONTENT: "refusal",
};

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export class GeminiProvider implements LLMProvider {
  readonly id = "gemini" as const;

  async complete(req: CompletionRequest): Promise<CompletionResult> {
    const response = await getClient().models.generateContent({
      model: MODEL_BY_TIER[req.model],
      contents: req.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: req.system,
        maxOutputTokens: req.maxTokens,
        tools: req.enableWebSearch ? [{ googleSearch: {} }] : undefined,
      },
    });

    const candidate = response.candidates?.[0];
    const content =
      candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

    function toCitation(web: { uri?: string; title?: string } | undefined): Citation | null {
      if (!web?.uri) return null;
      const citation: Citation = { url: web.uri };
      if (web.title) citation.title = web.title;
      return citation;
    }

    const chunks = candidate?.groundingMetadata?.groundingChunks ?? [];
    const citations: Citation[] = chunks
      .map((chunk) => toCitation(chunk.web))
      .filter((c): c is Citation => c !== null);

    const groundedSnippets: GroundedSnippet[] = [];
    for (const support of candidate?.groundingMetadata?.groundingSupports ?? []) {
      const text = support.segment?.text;
      if (!text) continue;
      const snippetCitations = (support.groundingChunkIndices ?? [])
        .map((i) => toCitation(chunks[i]?.web))
        .filter((c): c is Citation => c !== null);
      if (snippetCitations.length === 0) continue;
      groundedSnippets.push({ text, citations: snippetCitations });
    }

    const stopReason =
      FINISH_REASON_MAP[candidate?.finishReason ?? "STOP"] ?? "error";

    return {
      content,
      toolUses: [],
      stopReason,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
      citations,
      groundedSnippets,
    };
  }
}
