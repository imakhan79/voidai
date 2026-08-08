"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Panel, PanelBody } from "@/components/ui/Panel";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Panel>
      <PanelBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="text-sm font-medium text-foreground">Sign in</h1>

          <label className="flex flex-col gap-1 text-xs text-foreground-muted">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-border bg-background-inset px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-foreground-muted">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-border bg-background-inset px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
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
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-xs text-foreground-muted">
            No account?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </PanelBody>
    </Panel>
  );
}
