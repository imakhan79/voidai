export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-tabular text-xl font-bold tracking-tight text-foreground">
            VOID<span className="text-accent">AI</span>
          </span>
          <p className="mt-1 text-xs text-foreground-muted">
            Discover what should exist next.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
