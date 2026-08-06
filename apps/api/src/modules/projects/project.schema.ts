import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(500)
  .optional()
  .nullable();

const optionalDate = z
  .string()
  .datetime({ offset: true })
  .optional()
  .nullable();

export const projectStatusSchema = z.enum([
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
]);

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must contain at least 2 characters.")
    .max(120, "Project name cannot exceed 120 characters."),

  description: optionalText,

  clientName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable(),

  address: z
    .string()
    .trim()
    .max(250)
    .optional()
    .nullable(),

  quotedValue: z
    .number()
    .nonnegative("Quoted value cannot be negative.")
    .max(9999999999)
    .optional()
    .nullable(),

  status: projectStatusSchema.optional(),

  startDate: optionalDate,

  endDate: optionalDate,
});

export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const projectIdSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID."),
});
