import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [{ role: "user", parts: [{ text: "What is the current price of Bitcoin in USD? Search for it." }] }],
  config: {
    tools: [{ googleSearch: {} }],
    maxOutputTokens: 512,
  },
});

const candidate = response.candidates?.[0];
console.log("--- text ---");
console.log(candidate?.content?.parts?.map((p) => p.text).join(""));
console.log("\n--- finishReason ---", candidate?.finishReason);
console.log("\n--- grounding chunks ---");
console.log(JSON.stringify(candidate?.groundingMetadata?.groundingChunks, null, 2));
console.log("\n--- usage ---", response.usageMetadata);
