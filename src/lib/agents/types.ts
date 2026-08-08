import type { LLMProvider } from "@/lib/providers/types";
import type { NewEvidenceInput } from "@/lib/evidence-types";
import type { NewContradictionInput } from "@/lib/contradiction-types";

export interface AgentContext {
  discoveryId: string;
  orgId: string;
  jobId: string;
  problemStatement: string;
  /** Evidence already gathered by prior agents in this run (e.g. Product reads Research+Market). */
  priorEvidence?: NewEvidenceInput[];
  /** Required for the red-team agent: the opportunity + evidence it must interrogate. */
  opportunity?: {
    title: string;
    description: string;
    evidence: NewEvidenceInput[];
  };
}

export interface AgentResult {
  evidence: NewEvidenceInput[];
  /** Only populated by the red-team agent. */
  contradictions?: NewContradictionInput[];
  summary: string;
  tokensUsed: { input: number; output: number };
}

export interface Agent {
  readonly type: string;
  run(ctx: AgentContext, provider: LLMProvider): Promise<AgentResult>;
}
