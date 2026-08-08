import type { LiveState } from "@/lib/domain-types";

const COLOR_BY_STATE: Record<LiveState, string> = {
  ok: "bg-live-ok",
  warn: "bg-live-warn",
  error: "bg-live-error",
  idle: "bg-foreground-muted",
};

const LABEL_BY_STATE: Record<LiveState, string> = {
  ok: "Live",
  warn: "Degraded",
  error: "Error",
  idle: "Idle",
};

export function LiveDot({
  state,
  label,
}: {
  state: LiveState;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-foreground-muted">
      <span className="relative flex h-2 w-2">
        {state !== "idle" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${COLOR_BY_STATE[state]}`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${COLOR_BY_STATE[state]}`}
        />
      </span>
      {label ?? LABEL_BY_STATE[state]}
    </span>
  );
}
