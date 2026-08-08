"use client";

import { useEffect } from "react";
import { useJobStatus } from "@/hooks/useJobStatus";
import { LiveDot } from "@/components/ui/LiveDot";
import { Panel, PanelBody } from "@/components/ui/Panel";
import type { Database } from "@/lib/supabase/database.types";
import type { LiveState } from "@/lib/domain-types";

type ResearchJob = Database["public"]["Tables"]["research_jobs"]["Row"];

const LIVE_STATE_BY_STATUS: Record<ResearchJob["status"], LiveState> = {
  queued: "idle",
  running: "ok",
  succeeded: "ok",
  partial: "warn",
  insufficient_evidence: "warn",
  failed: "error",
};

const LABEL_BY_STATUS: Record<ResearchJob["status"], string> = {
  queued: "Queued",
  running: "Researching…",
  succeeded: "Completed",
  partial: "Partially completed",
  insufficient_evidence: "Insufficient evidence",
  failed: "Failed",
};

export function JobProgressPanel({
  jobId,
  initial,
  onSettled,
}: {
  jobId: string;
  initial: ResearchJob | null;
  onSettled?: () => void;
}) {
  const job = useJobStatus(jobId, initial);
  const isTerminal =
    job && ["succeeded", "failed", "partial", "insufficient_evidence"].includes(job.status);

  useEffect(() => {
    if (isTerminal) onSettled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTerminal]);

  if (!job) return null;

  return (
    <Panel>
      <PanelBody className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LiveDot
            state={LIVE_STATE_BY_STATUS[job.status]}
            label={LABEL_BY_STATUS[job.status]}
          />
          <span className="text-xs text-foreground-muted">
            agents: {job.requested_agents.join(", ")}
          </span>
        </div>
        {job.error && <span className="text-xs text-live-error">{job.error}</span>}
      </PanelBody>
    </Panel>
  );
}
