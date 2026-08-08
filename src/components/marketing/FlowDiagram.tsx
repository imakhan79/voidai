export function FlowDiagram({ stages }: { stages: string[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {stages.map((stage, i) => (
        <div key={stage} className="flex items-center gap-2">
          <span className="rounded-md border border-border-strong bg-background-panel px-3 py-2 font-tabular text-xs font-medium tracking-wide text-foreground sm:text-sm">
            {stage}
          </span>
          {i < stages.length - 1 && (
            <span aria-hidden className="text-accent">
              &rarr;
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
