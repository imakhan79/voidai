export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`border-b border-border py-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          {eyebrow && (
            <span className="font-tabular text-xs tracking-[0.2em] text-accent uppercase">
              {eyebrow}
            </span>
          )}
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="max-w-2xl text-balance text-sm text-foreground-muted sm:text-base">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
