import { StatusPill } from "@/components/ui/StatusPill";
import type { EvidenceStatus } from "@/lib/domain-types";

export interface EvidenceRow {
  id: number;
  source_name: string;
  source_url: string;
  published_date: string | null;
  evidence_type: string;
  quality_score: number;
  confidence_score: number;
  status: string;
  summary: string;
}

export function EvidenceTable({ evidence }: { evidence: EvidenceRow[] }) {
  if (evidence.length === 0) {
    return (
      <p className="p-4 text-sm text-foreground-muted">
        No evidence yet. Run research to populate this discovery.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-foreground-muted">
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Claim</th>
            <th className="px-4 py-2 font-medium">Source</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 text-right font-medium">Quality</th>
            <th className="px-4 py-2 text-right font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {evidence.map((e) => (
            <tr key={e.id} className="border-b border-border last:border-0 align-top">
              <td className="px-4 py-3">
                <StatusPill status={e.status as EvidenceStatus} />
              </td>
              <td className="px-4 py-3 text-foreground">{e.summary}</td>
              <td className="px-4 py-3">
                <a
                  href={e.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {e.source_name}
                </a>
              </td>
              <td className="px-4 py-3 text-xs text-foreground-muted">
                {e.evidence_type}
              </td>
              <td className="px-4 py-3 text-right font-tabular text-xs text-foreground-muted">
                {e.quality_score.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right font-tabular text-xs text-foreground-muted">
                {e.published_date ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
