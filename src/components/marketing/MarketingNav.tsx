import Link from "next/link";

export function MarketingNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-tabular text-lg font-bold tracking-tight text-foreground">
          VOID<span className="text-gradient-accent">AI</span>
        </Link>
        <nav className="flex items-center gap-6">
          <a href="#how-it-works" className="hidden text-sm text-foreground-muted hover:text-foreground sm:inline">
            How it works
          </a>
          <a href="#opportunity-intelligence" className="hidden text-sm text-foreground-muted hover:text-foreground sm:inline">
            Opportunities
          </a>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-foreground-muted hover:text-foreground">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
              >
                Start discovery
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
