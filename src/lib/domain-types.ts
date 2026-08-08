/**
 * Shared domain enums used by UI components ahead of DB schema generation.
 * Must stay in sync with the Postgres enums/check constraints defined in
 * supabase/migrations — see evidence_status_enum, research_jobs.status, etc.
 */

export const EVIDENCE_STATUSES = [
  "VERIFIED",
  "SUPPORTED",
  "INFERRED",
  "HYPOTHESIS",
  "PREDICTION",
  "UNKNOWN",
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export const JOB_STATUSES = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "partial",
  "insufficient_evidence",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const LIVE_STATES = ["ok", "warn", "error", "idle"] as const;
export type LiveState = (typeof LIVE_STATES)[number];
