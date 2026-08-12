import { z } from "zod";

export const invoiceStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const invoiceItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Item description is required.")
    .max(250),

  quantity: z.number().positive("Quantity must be greater than 0."),

  unitPrice: z.number().nonnegative("Unit price cannot be negative."),

  sortOrder: z.number().int().nonnegative().optional(),
});

const invoiceFieldsSchema = z.object({
  title: z.string().trim().min(2).max(150),

  description: z.string().trim().max(1000).optional().nullable(),

  customerId: z.string().uuid(),

  projectId: z.string().uuid().optional().nullable(),

  dueDate: z.string().datetime({ offset: true }).optional().nullable(),

  notes: z.string().trim().max(2000).optional().nullable(),

  terms: z.string().trim().max(3000).optional().nullable(),

  items: z.array(invoiceItemSchema).min(1),
});

export const createInvoiceSchema = invoiceFieldsSchema;

export const updateInvoiceSchema = invoiceFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const invoiceIdSchema = z.object({
  invoiceId: z.string().uuid(),
});

export const updateInvoiceStatusSchema = z.object({
  status: invoiceStatusSchema,
});
