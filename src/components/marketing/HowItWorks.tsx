import { Section } from "./Section";

const STEPS = [
  { name: "Research", description: "Multi-agent web research with cited sources." },
  { name: "Analyze", description: "Evidence classified by status and confidence." },
  { name: "Detect Gaps", description: "White space surfaced from evidence coverage." },
  { name: "Score Opportunities", description: "Attractiveness and confidence, scored separately." },
  { name: "Red-Team", description: "Adversarial validation finds contradictions." },
  { name: "Build", description: "Business case, PRD, TRD generated from evidence." },
];

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      eyebrow="How It Works"
      title="Every step is evidence-first"
      description="Nothing here is generated without a source. Claims are labeled by how well they're supported."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.name}
            className="rounded-md border border-border bg-background-panel p-5"
          >
            <span className="font-tabular text-xs text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-1 text-sm font-medium text-foreground">{step.name}</p>
            <p className="mt-1 text-xs text-foreground-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
