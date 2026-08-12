import { z } from "zod";
export const paymentMethodSchema = z.enum([
    "BANK_TRANSFER",
    "CASH",
    "CARD",
    "CHEQUE",
    "OTHER",
]);
export const createPaymentSchema = z.object({
    invoiceId: z.string().uuid("Invoice ID must be valid."),
    amount: z.number().positive("Payment amount must be greater than 0."),
    method: paymentMethodSchema,
    reference: z.string().trim().max(120).optional().nullable(),
    notes: z.string().trim().max(500).optional().nullable(),
    paidAt: z.string().datetime({ offset: true }).optional(),
});
export const invoicePaymentsParamsSchema = z.object({
    invoiceId: z.string().uuid(),
});
export const paymentIdSchema = z.object({
    paymentId: z.string().uuid(),
});
//# sourceMappingURL=payment.schema.js.map