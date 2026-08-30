import { z } from "zod";

export const expenseCategorySchema = z.enum([
  "MATERIALS",
  "TOOLS",
  "FUEL",
  "VEHICLE",
  "SUBCONTRACTOR",
  "EQUIPMENT_HIRE",
  "INSURANCE",
  "PHONE_INTERNET",
  "OFFICE",
  "TRAVEL",
  "OTHER",
]);

export const expenseStatusSchema = z.enum(["PAID", "PENDING", "OVERDUE"]);

const expenseFieldsSchema = z.object({
  description: z
    .string()
    .trim()
    .min(2, "Description must contain at least 2 characters.")
    .max(250),

  supplier: z.string().trim().max(150).optional().nullable(),

  category: expenseCategorySchema,

  status: expenseStatusSchema.optional(),

  amount: z.number().positive("Expense amount must be greater than 0."),

  gstAmount: z
    .number()
    .nonnegative("GST amount cannot be negative.")
    .optional(),

  gstTreatment: z.enum(["GST_INCLUDED", "GST_FREE", "MANUAL", "NOT_CLAIMABLE", "UNKNOWN"]).optional(),

  gstClaimable: z.boolean().optional(),

  expenseDate: z.string().datetime({ offset: true }),

  dueDate: z.string().datetime({ offset: true }).optional().nullable(),

  paidAt: z.string().datetime({ offset: true }).optional().nullable(),

  projectId: z.string().uuid("Project ID must be valid.").optional().nullable(),

  notes: z.string().trim().max(1000).optional().nullable(),
});

export const createExpenseSchema = expenseFieldsSchema;

export const updateExpenseSchema = expenseFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const expenseIdSchema = z.object({
  expenseId: z.string().uuid(),
});
