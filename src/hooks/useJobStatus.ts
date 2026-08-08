"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type ResearchJob = Database["public"]["Tables"]["research_jobs"]["Row"];

const POLL_INTERVAL_MS = 3000;

/**
 * Subscribes to Realtime changes on a research_jobs row for live progress;
 * falls back to polling if the WebSocket can't connect (proxies, browser
 * restrictions) so the feature degrades gracefully instead of going stale.
 */
export function useJobStatus(jobId: string | null, initial: ResearchJob | null) {
  const [job, setJob] = useState<ResearchJob | null>(initial);

  useEffect(() => {
    if (!jobId) return;
    const supabase = createClient();
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    async function fetchOnce() {
      const { data } = await supabase
        .from("research_jobs")
        .select("*")
        .eq("id", jobId as string)
        .maybeSingle();
      if (!cancelled && data) setJob(data);
    }

    const channel = supabase
      .channel(`research_jobs:${jobId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "research_jobs", filter: `id=eq.${jobId}` },
        (payload) => {
          if (!cancelled) setJob(payload.new as ResearchJob);
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          pollTimer ??= setInterval(fetchOnce, POLL_INTERVAL_MS);
        }
      });

    fetchOnce();
    pollTimer = setInterval(fetchOnce, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  return job;
}
