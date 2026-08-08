import type { EvidenceStatus } from "@/lib/domain-types";

export const EVIDENCE_TYPES = [
  "market_data",
  "competitor",
  "academic",
  "news",
  "community",
  "patent",
  "other",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/** Shape written into the `evidence` table — everything except DB-generated fields. */
export interface NewEvidenceInput {
  sourceName: string;
  sourceUrl: string;
  publishedDate: string | null;
  evidenceType: EvidenceType;
  qualityScore: number;
  confidenceScore: number;
  status: EvidenceStatus;
  summary: string;
  rawExcerpt: string | null;
}
