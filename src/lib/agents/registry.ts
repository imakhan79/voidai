import type { Agent } from "./types";
import { ResearchAgent } from "./research-agent";
import { MarketAgent } from "./market-agent";
import { ProductAgent } from "./product-agent";
import { RedTeamAgent } from "./red-team-agent";

/**
 * Adding a new agent (Startup, Patent, GitHub, Review, Trend — P1) is:
 * implement `Agent`, add one line here. No orchestrator changes required.
 */
export const AGENT_REGISTRY: ReadonlyMap<string, Agent> = new Map<string, Agent>([
  ["research", new ResearchAgent()],
  ["market", new MarketAgent()],
  ["product", new ProductAgent()],
  ["red_team", new RedTeamAgent()],
]);

export function getAgent(type: string): Agent {
  const agent = AGENT_REGISTRY.get(type);
  if (!agent) {
    throw new Error(`Unknown agent type "${type}"`);
  }
  return agent;
}

/** The MVP core subset run for every research job (red_team is triggered separately, per-opportunity). */
export const CORE_RESEARCH_AGENTS = ["research", "market", "product"] as const;
