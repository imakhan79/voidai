export function MonoStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-foreground-muted">
        {label}
      </span>
      <span className="font-tabular text-2xl font-semibold text-foreground">
        {value}
      </span>
      {sub && <span className="text-xs text-foreground-muted">{sub}</span>}
    </div>
  );
}
