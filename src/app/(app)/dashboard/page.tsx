import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Panel, PanelHeader, PanelTitle, PanelBody } from "@/components/ui/Panel";
import { MonoStat } from "@/components/ui/MonoStat";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: discoveries, count } = await supabase
    .from("discoveries")
    .select("id, title, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <Link
          href="/discoveries/new"
          className="rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
        >
          New discovery
        </Link>
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>Overview</PanelTitle>
        </PanelHeader>
        <PanelBody className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <MonoStat label="Discoveries" value={count ?? 0} />
          <MonoStat label="Evidence items" value={0} />
          <MonoStat label="Opportunities" value={0} />
          <MonoStat label="Projects" value={0} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Recent discoveries</PanelTitle>
        </PanelHeader>
        <PanelBody className="p-0">
          {!discoveries || discoveries.length === 0 ? (
            <p className="p-4 text-sm text-foreground-muted">
              No discoveries yet. Start one to run the research pipeline:
              question → evidence → gap → opportunity → score → red-team →
              build.
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
                    </td>
                    <td className="px-4 py-3 text-right text-foreground-muted font-tabular text-xs">
                      {d.status}
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
