interface OpportunityCardData {
  title: string;
  description: string;
  opportunityScore: number;
  confidence: number;
  pain: number;
  demand: number;
  competition: number;
  novelty: number;
  feasibility: number;
  timing: number;
}

const METRIC_ORDER: { key: keyof Omit<OpportunityCardData, "title" | "description">; label: string }[] = [
  { key: "opportunityScore", label: "Opportunity" },
  { key: "confidence", label: "Confidence" },
  { key: "pain", label: "Pain" },
  { key: "demand", label: "Demand" },
  { key: "competition", label: "Competition" },
  { key: "novelty", label: "Novelty" },
  { key: "feasibility", label: "Feasibility" },
  { key: "timing", label: "Timing" },
];

export function OpportunityCard({ data }: { data: OpportunityCardData }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-background-panel p-5 transition-colors hover:border-accent/50">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{data.title}</h3>
        <p className="mt-1 text-xs text-foreground-muted">{data.description}</p>
      </div>
      <div className="grid grid-cols-4 gap-x-3 gap-y-3">
        {METRIC_ORDER.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wide text-foreground-muted">
              {label}
            </span>
            <span className="font-tabular text-sm font-semibold text-foreground">
              {data[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { OpportunityCardData };
