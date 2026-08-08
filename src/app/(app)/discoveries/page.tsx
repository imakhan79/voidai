import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Panel, PanelHeader, PanelTitle, PanelBody } from "@/components/ui/Panel";
import { DemoDataBanner } from "@/components/demo/DemoDataBanner";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  researching: "Researching…",
  completed: "Completed",
  failed: "Failed",
  insufficient_evidence: "Insufficient evidence",
};

export default async function DiscoveriesPage() {
  const supabase = await createClient();
  const { data: discoveries } = await supabase
    .from("discoveries")
    .select("id, title, status, is_demo, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Discoveries</h1>
        <Link
          href="/discoveries/new"
          className="rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
        >
          New discovery
        </Link>
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>All discoveries ({discoveries?.length ?? 0})</PanelTitle>
        </PanelHeader>
        <PanelBody className="p-0">
          {!discoveries || discoveries.length === 0 ? (
            <p className="p-4 text-sm text-foreground-muted">
              No discoveries yet. Start one to run the research pipeline.
            </p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {discoveries.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/discoveries/${d.id}`}
                        className="font-medium text-foreground hover:text-accent"
                      >
                        {d.title}
                      </Link>
                      {d.is_demo && (
                        <div className="mt-1">
                          <DemoDataBanner />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground-muted font-tabular text-xs">
                      {STATUS_LABEL[d.status] ?? d.status}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground-muted font-tabular text-xs">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </PanelBody>
      </Panel>
    </div>
  );
}
