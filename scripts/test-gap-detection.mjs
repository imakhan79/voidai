import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are the gap-detection step inside VOID AI. Given a problem/domain
statement and the evidence gathered about it, identify white-space gaps: topics with weak,
contradictory, or absent coverage relative to the problem — places where "what should exist
next" is unanswered by current evidence. Do not invent facts; only reason over the evidence
given.

Respond with ONLY a JSON array (no prose, no markdown fences), each item shaped as:
{
  "title": string,
  "description": string,
  "supportingEvidenceIndexes": number[],
  "isWellGrounded": boolean
}`;

const evidenceList = `[1] (SUPPORTED) Zero Trust Architecture is critical for AI agents — obsidiansecurity.com
[2] (SUPPORTED) TRUST Framework covers Traceability, Risk, Oversight, Security, Tuning — medium.com
[3] (VERIFIED) Defense in Depth applies multiple mitigation layers — microsoft.com
[4] (SUPPORTED) MatrixCare offers offline documentation — getlimeai.com`;

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `Problem/domain: What existing tools verify provenance and trust for autonomous agents?\n\nEvidence:\n${evidenceList}\n\nIdentify white-space gaps.`,
        },
      ],
    },
  ],
  config: {
    systemInstruction: SYSTEM_PROMPT,
    maxOutputTokens: 3072,
  },
});

const candidate = response.candidates?.[0];
console.log("--- finishReason ---", candidate?.finishReason);
console.log("--- raw text ---");
console.log(candidate?.content?.parts?.map((p) => p.text).join(""));
