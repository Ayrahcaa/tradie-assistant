import { z } from "zod";

export const createSubcontractorPaymentSchema = z.object({
  costId: z.string().uuid("Subcontractor cost ID must be valid."),

  amount: z.number().positive("Payment amount must be greater than 0."),

  paidAt: z
    .string()
    .datetime({
      offset: true,
    })
    .optional(),

  reference: z.string().trim().max(150).optional().nullable(),

  notes: z.string().trim().max(1000).optional().nullable(),
});

export const subcontractorPaymentIdSchema = z.object({
  paymentId: z.string().uuid("Payment ID must be valid."),
});

export type CreateSubcontractorPaymentInput = z.infer<
  typeof createSubcontractorPaymentSchema
>;
