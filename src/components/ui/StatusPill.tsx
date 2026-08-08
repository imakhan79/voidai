import type { EvidenceStatus } from "@/lib/domain-types";

const STYLE_BY_STATUS: Record<EvidenceStatus, string> = {
  VERIFIED: "text-status-verified border-status-verified/40 bg-status-verified/10",
  SUPPORTED: "text-status-supported border-status-supported/40 bg-status-supported/10",
  INFERRED: "text-status-inferred border-status-inferred/40 bg-status-inferred/10",
  HYPOTHESIS: "text-status-hypothesis border-status-hypothesis/40 bg-status-hypothesis/10",
  PREDICTION: "text-status-prediction border-status-prediction/40 bg-status-prediction/10",
  UNKNOWN: "text-status-unknown border-status-unknown/40 bg-status-unknown/10",
};

export function StatusPill({ status }: { status: EvidenceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-tabular text-[11px] font-semibold tracking-wide ${STYLE_BY_STATUS[status]}`}
    >
      {status}
    </span>
  );
}
