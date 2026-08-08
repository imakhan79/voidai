export function FinalCta({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative overflow-hidden bg-background-inset py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Don&rsquo;t search for what exists.
          <br />
          <span className="text-gradient-accent">Discover what should exist next.</span>
        </h2>
        <a
          href={isAuthenticated ? "/discoveries/new" : "/signup"}
          className="rounded bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          START DISCOVERY
        </a>
      </div>
    </section>
  );
}
