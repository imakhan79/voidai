"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobProgressPanel } from "@/components/jobs/JobProgressPanel";

export function RunResearchButton({ discoveryId }: { discoveryId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/discoveries/${discoveryId}/research`, {
      method: "POST",
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.error ?? "Research run failed");
      setSubmitting(false);
      router.refresh();
      return;
    }

    setJobId(body.jobId);
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={submitting}
        className="self-end rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
      >
        {submitting ? "Starting…" : "Run research"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-live-error">
          {error}
        </p>
      )}
      {jobId && (
        <JobProgressPanel
          jobId={jobId}
          initial={null}
          onSettled={() => router.refresh()}
        />
      )}
    </div>
  );
}
