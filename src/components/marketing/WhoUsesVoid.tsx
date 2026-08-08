import { Section } from "./Section";

const AUDIENCES = [
  "Founders",
  "Investors",
  "Product Teams",
  "Researchers",
  "Corporations",
  "Consultants",
  "Universities",
  "Governments",
];

export function WhoUsesVoid() {
  return (
    <Section title="Who uses VOID" className="border-b-0">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {AUDIENCES.map((a) => (
          <span
            key={a}
            className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground-muted"
          >
            {a}
          </span>
        ))}
      </div>
    </Section>
  );
}
