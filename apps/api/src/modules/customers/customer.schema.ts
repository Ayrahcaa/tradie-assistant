import { z } from "zod";

export const createCustomerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),

  lastName: z.string().trim().min(1, "Last name is required.").max(80),

  businessName: z.string().trim().max(150).optional().nullable(),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .optional()
    .nullable(),

  phone: z.string().trim().max(30).optional().nullable(),

  address: z.string().trim().max(250).optional().nullable(),

  abn: z.string().trim().max(20).optional().nullable(),

  notes: z.string().trim().max(1000).optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const customerIdSchema = z.object({
  customerId: z.string().uuid("Customer ID must be a valid UUID."),
});
