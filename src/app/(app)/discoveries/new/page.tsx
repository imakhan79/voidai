"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Panel, PanelBody } from "@/components/ui/Panel";

export default function NewDiscoveryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState(
    () => searchParams.get("problem") ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/discoveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, problemStatement }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create discovery");
      setSubmitting(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/discoveries/${id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-lg font-semibold text-foreground">New discovery</h1>
      <Panel>
        <PanelBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs text-foreground-muted">
              Title
              <input
                required
                minLength={3}
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Async collaboration for distributed field teams"
                className="rounded border border-border bg-background-inset px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-foreground-muted">
              Problem / domain statement
              <textarea
                required
                minLength={20}
                maxLength={4000}
                rows={6}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe the problem or domain you want VOID AI to research. Be specific — this drives the entire research pipeline."
                className="resize-y rounded border border-border bg-background-inset px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              />
            </label>

            {error && (
              <p role="alert" className="text-xs text-live-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create discovery"}
            </button>
          </form>
        </PanelBody>
      </Panel>
    </div>
  );
}
