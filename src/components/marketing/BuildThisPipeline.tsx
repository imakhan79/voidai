import { Section } from "./Section";
import { FlowDiagram } from "./FlowDiagram";

const STAGES = [
  "Opportunity",
  "Business Case",
  "PRD",
  "TRD",
  "Architecture",
  "MVP",
];

export function BuildThisPipeline() {
  return (
    <Section
      eyebrow="Build This"
      title="From opportunity to MVP-ready spec"
      description="Save an opportunity and generate the documents that turn it into a real build."
    >
      <FlowDiagram stages={STAGES} />
    </Section>
  );
}
