import { z } from "zod";

export const createDiscoverySchema = z.object({
  title: z.string().trim().min(3).max(200),
  problemStatement: z.string().trim().min(20).max(4000),
});
export type CreateDiscoveryInput = z.infer<typeof createDiscoverySchema>;

export const runResearchSchema = z.object({
  agents: z.array(z.enum(["research", "market", "product"])).min(1).default([
    "research",
    "market",
    "product",
  ]),
});
export type RunResearchInput = z.infer<typeof runResearchSchema>;
