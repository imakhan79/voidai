"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Panel, PanelBody } from "@/components/ui/Panel";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setCheckEmail(true);
    setSubmitting(false);
  }

  if (checkEmail) {
    return (
      <Panel>
        <PanelBody>
          <p className="text-sm text-foreground">
            Check <span className="font-medium">{email}</span> for a confirmation
            link to finish creating your account.
          </p>
        </PanelBody>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="text-sm font-medium text-foreground">Create account</h1>

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
              minLength={8}
              autoComplete="new-password"
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
            {submitting ? "Creating…" : "Create account"}
          </button>

          <p className="text-center text-xs text-foreground-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </PanelBody>
    </Panel>
  );
}
