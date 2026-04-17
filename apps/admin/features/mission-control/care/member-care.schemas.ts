import { z } from "zod";

export const careRequirementSchema = z.object({
  id: z.string().min(1),
  personnelId: z.string().min(1),
  activityType: z.string().min(1),
  intervalDays: z.number().int().positive().optional(),
  neverMet: z.boolean().optional(),
  label: z.string().min(1).optional(),
});

export const carePlanTaskSchema = z.object({
  id: z.string().min(1),
  personnelId: z.string().min(1),
  title: z.string().min(1),
  dueDate: z.string().min(1),
  status: z.enum(["pending", "overdue", "completed"]),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export const memberCareDerivationInputSchema = z.object({
  personnel: z.array(z.any()),
  activities: z.array(z.any()),
  requirements: z.array(careRequirementSchema).optional(),
  tasks: z.array(carePlanTaskSchema).optional(),
  now: z.date().optional(),
});
