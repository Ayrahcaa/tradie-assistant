import { z } from "zod";
export const quoteStatusSchema = z.enum([
    "DRAFT",
    "SENT",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
]);
export const quoteItemSchema = z.object({
    description: z
        .string()
        .trim()
        .min(1, "Item description is required.")
        .max(250),
    quantity: z.number().positive("Quantity must be greater than 0."),
    unitPrice: z.number().nonnegative("Unit price cannot be negative."),
    sortOrder: z.number().int().nonnegative().optional(),
});
const quoteFieldsSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Quote title must contain at least 2 characters.")
        .max(150),
    description: z.string().trim().max(1000).optional().nullable(),
    customerId: z.string().uuid("Customer ID must be valid."),
    projectId: z.string().uuid("Project ID must be valid.").optional().nullable(),
    expiryDate: z.string().datetime({ offset: true }).optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
    terms: z.string().trim().max(3000).optional().nullable(),
    items: z
        .array(quoteItemSchema)
        .min(1, "A quote must have at least one item."),
});
export const createQuoteSchema = quoteFieldsSchema;
export const updateQuoteSchema = quoteFieldsSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
});
export const quoteIdSchema = z.object({
    quoteId: z.string().uuid("Quote ID must be valid."),
});
export const updateQuoteStatusSchema = z.object({
    status: quoteStatusSchema,
});
//# sourceMappingURL=quote.schema.js.map