import { z } from "zod";

export const createProjectSchema = z.object({
  opportunityId: z.string().uuid(),
  name: z.string().trim().min(3).max(200),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const BUILD_STAGES = [
  "business_case",
  "prd",
  "trd",
  "ui_ux",
  "architecture",
  "database",
  "api",
  "mvp",
] as const;

export const generateStageSchema = z.object({
  stage: z.enum(BUILD_STAGES),
});
export type GenerateStageInput = z.infer<typeof generateStageSchema>;
