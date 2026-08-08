"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { NetworkBackground } from "./NetworkBackground";

const PLACEHOLDER =
  "Find high-potential AI opportunities in healthcare with strong customer pain and low competition.";

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = query.trim();
    const next = problem
      ? `/discoveries/new?problem=${encodeURIComponent(problem)}`
      : "/discoveries/new";

    if (isAuthenticated) {
      router.push(next);
    } else {
      router.push(`/signup?next=${encodeURIComponent(next)}`);
    }
  }

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0">
        <NetworkBackground />
      </div>
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-28 text-center">
        <div className="flex flex-col gap-2">
          <p className="font-tabular text-sm tracking-[0.2em] text-foreground-muted uppercase">
            The internet shows you what exists.
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            <span className="text-gradient-accent">VOID</span> shows you what
            should exist.
          </h1>
        </div>

        <p className="max-w-2xl text-balance text-base text-foreground-muted sm:text-lg">
          Discover unmet needs, market gaps, white spaces, emerging
          opportunities, and products that should exist next.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          <label htmlFor="hero-query" className="sr-only">
            What are you trying to discover?
          </label>
          <div className="flex flex-col gap-3 rounded-lg border border-border-strong bg-background-panel p-2 shadow-sm sm:flex-row">
            <input
              id="hero-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={PLACEHOLDER}
              className="flex-1 rounded-md bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground-muted/70"
            />
            <button
              type="submit"
              className="rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Start discovery
            </button>
          </div>
          <p className="mt-2 text-left text-xs text-foreground-muted">
            What are you trying to discover?
          </p>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={isAuthenticated ? "/discoveries/new" : "/signup"}
            className="rounded bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            START DISCOVERY
          </a>
          <a
            href="#opportunity-intelligence"
            className="rounded border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background-inset"
          >
            EXPLORE OPPORTUNITIES
          </a>
        </div>
      </div>
    </section>
  );
}
