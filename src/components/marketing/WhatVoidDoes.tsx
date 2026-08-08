import { Section } from "./Section";
import { FlowDiagram } from "./FlowDiagram";

const STAGES = [
  "DATA",
  "KNOWLEDGE",
  "GAPS",
  "WHITE SPACES",
  "OPPORTUNITIES",
  "VALIDATION",
  "BUILD",
];

export function WhatVoidDoes() {
  return (
    <Section
      eyebrow="What VOID AI Does"
      title="From raw data to a validated build plan"
      description="Every discovery runs the same pipeline: real evidence in, a scored, red-teamed opportunity out."
    >
      <FlowDiagram stages={STAGES} />
    </Section>
  );
}
