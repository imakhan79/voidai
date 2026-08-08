import { Section } from "./Section";
import { MonoStat } from "@/components/ui/MonoStat";
import { DemoDataBanner } from "@/components/demo/DemoDataBanner";

const METRICS = [
  { label: "Markets tracked", value: "1,240" },
  { label: "Companies indexed", value: "58,300" },
  { label: "Products cataloged", value: "94,700" },
  { label: "Research sources", value: "212,000" },
  { label: "Patents referenced", value: "37,900" },
  { label: "Technologies mapped", value: "6,840" },
  { label: "White spaces found", value: "3,110" },
];

export function GlobalIntelligence() {
  return (
    <Section
      eyebrow="Global Innovation Intelligence"
      title="A living map of what exists"
      description="The evidence graph VOID AI reasons over — scale illustrated below."
    >
      <div className="mb-6 flex justify-center">
        <DemoDataBanner />
      </div>
      <div className="grid grid-cols-2 gap-6 rounded-md border border-border bg-background-panel p-6 sm:grid-cols-4">
        {METRICS.map((m) => (
          <MonoStat key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
    </Section>
  );
}
