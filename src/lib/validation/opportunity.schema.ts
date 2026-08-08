import { z } from "zod";

export const saveOpportunitySchema = z.object({
  isSaved: z.boolean(),
});
export type SaveOpportunityInput = z.infer<typeof saveOpportunitySchema>;

export const triggerRedTeamSchema = z.object({
  opportunityId: z.string().uuid(),
});
export type TriggerRedTeamInput = z.infer<typeof triggerRedTeamSchema>;
