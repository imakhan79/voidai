export function OpportunityScoreDials({
  opportunityScore,
  confidenceScore,
}: {
  opportunityScore: number;
  confidenceScore: number;
}) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-wide text-foreground-muted">
          Opportunity
        </span>
        <span className="font-tabular text-xl font-semibold text-accent">
          {opportunityScore.toFixed(0)}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-wide text-foreground-muted">
          Confidence
        </span>
        <span className="font-tabular text-xl font-semibold text-accent-2">
          {confidenceScore.toFixed(0)}
        </span>
      </div>
    </div>
  );
}
