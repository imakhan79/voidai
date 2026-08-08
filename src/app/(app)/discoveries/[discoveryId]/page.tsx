import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Panel, PanelHeader, PanelTitle, PanelBody } from "@/components/ui/Panel";
import { DemoDataBanner } from "@/components/demo/DemoDataBanner";
import { LiveDot } from "@/components/ui/LiveDot";
import type { LiveState } from "@/lib/domain-types";

const STATUS_LIVE_STATE: Record<string, LiveState> = {
  draft: "idle",
  researching: "ok",
  completed: "ok",
  failed: "error",
  insufficient_evidence: "warn",
};

export default async function DiscoveryDetailPage({
  params,
}: {
  params: Promise<{ discoveryId: string }>;
}) {
  const { discoveryId } = await params;
  const supabase = await createClient();

  const { data: discovery } = await supabase
    .from("discoveries")
    .select("id, title, problem_statement, status, is_demo, created_at")
    .eq("id", discoveryId)
    .maybeSingle();

  if (!discovery) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">{discovery.title}</h1>
          <LiveDot
            state={STATUS_LIVE_STATE[discovery.status] ?? "idle"}
            label={discovery.status}
          />
        </div>
        {discovery.is_demo && (
          <div className="mt-2">
            <DemoDataBanner />
          </div>
        )}
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>Problem</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {discovery.problem_statement}
          </p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Research pipeline</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <p className="text-sm text-foreground-muted">
            Evidence, gaps, and opportunities appear here once a research run
            is triggered. This is wired up next.
          </p>
        </PanelBody>
      </Panel>
    </div>
  );
}
