import type { HTMLAttributes } from "react";

export function Panel({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-md border border-border bg-background-panel ${className}`}
      {...props}
    />
  );
}

export function PanelHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center justify-between border-b border-border px-4 py-3 ${className}`}
      {...props}
    />
  );
}

export function PanelTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`text-sm font-medium tracking-wide text-foreground-muted uppercase ${className}`}
      {...props}
    />
  );
}

export function PanelBody({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 ${className}`} {...props} />;
}
