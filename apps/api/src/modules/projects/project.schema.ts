import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().nullable();

const optionalDate = z
  .string()
  .datetime({ offset: true })
  .optional()
  .nullable();

export const projectStatusSchema = z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]);

const projectFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must contain at least 2 characters.")
    .max(120, "Project name cannot exceed 120 characters."),

  description: optionalText,

  clientName: z.string().trim().max(120).optional().nullable(),

  customerId: z
    .string()
    .uuid("Customer ID must be a valid UUID.")
    .optional()
    .nullable(),

  address: z.string().trim().max(250).optional().nullable(),

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

function datesAreInOrder(data: {
  startDate?: string | null;
  endDate?: string | null;
}) {
  return (
    !data.startDate ||
    !data.endDate ||
    new Date(data.endDate) >= new Date(data.startDate)
  );
}

const dateOrderRefinement = {
  message: "End date cannot be before the start date.",
  path: ["endDate"] as string[],
};

export const createProjectSchema = projectFieldsSchema.refine(
  datesAreInOrder,
  dateOrderRefinement,
);

export const updateProjectSchema = projectFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })
  .refine(datesAreInOrder, dateOrderRefinement);

export const projectIdSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID."),
});
