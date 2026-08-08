import { Section } from "./Section";

const MODES = [
  { name: "Startup", description: "New venture white space" },
  { name: "Product", description: "Feature and roadmap gaps" },
  { name: "Research", description: "Unanswered academic questions" },
  { name: "Market", description: "Sizing, pricing, adoption" },
  { name: "Investment", description: "Thesis-driven opportunity scans" },
  { name: "Technology", description: "Emerging capability gaps" },
  { name: "Patent", description: "Unclaimed IP white space" },
];

export function DiscoveryModes() {
  return (
    <Section
      eyebrow="Discovery Modes"
      title="One pipeline, seven lenses"
      description="Point the same research pipeline at whichever angle matters to you."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {MODES.map((mode) => (
          <div
            key={mode.name}
            className="rounded-md border border-border bg-background-panel p-4 transition-colors hover:border-accent/50"
          >
            <p className="text-sm font-medium text-foreground">{mode.name}</p>
            <p className="mt-1 text-xs text-foreground-muted">{mode.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
