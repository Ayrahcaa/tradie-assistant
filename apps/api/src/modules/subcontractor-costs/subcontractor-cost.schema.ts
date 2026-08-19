import { z } from "zod";

export const subcontractorRateTypeSchema = z.enum([
  "HOURLY",
  "SQUARE_METRE",
  "DAILY",
  "FIXED_TASK",
  "FIXED_PROJECT",
  "PER_UNIT",
  "OTHER",
]);

const costFieldsSchema = z.object({
  subcontractorId: z.string().uuid(),

  projectId: z.string().uuid(),

  description: z.string().trim().max(500).optional().nullable(),

  rateType: subcontractorRateTypeSchema,

  rate: z.number().nonnegative().optional().nullable(),

  quantity: z.number().positive().optional().nullable(),

  agreedAmount: z.number().positive("Agreed amount must be greater than 0."),

  notes: z.string().trim().max(1000).optional().nullable(),
});

export const createSubcontractorCostSchema = costFieldsSchema;

export const updateSubcontractorCostSchema = costFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const subcontractorCostIdSchema = z.object({
  costId: z.string().uuid(),
});

export type CreateSubcontractorCostInput = z.infer<
  typeof createSubcontractorCostSchema
>;

export type UpdateSubcontractorCostInput = z.infer<
  typeof updateSubcontractorCostSchema
>;
