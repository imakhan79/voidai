"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RunResearchButton({ discoveryId }: { discoveryId: string }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setRunning(true);
    setError(null);

    const res = await fetch(`/api/discoveries/${discoveryId}/research`, {
      method: "POST",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Research run failed");
      setRunning(false);
      router.refresh();
      return;
    }

    setRunning(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={running}
        className="rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
      >
        {running ? "Researching…" : "Run research"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-live-error">
          {error}
        </p>
      )}
    </div>
  );
}
