import { z } from "zod";
export const receiptExtractionSchema = z.object({
    supplier: z.string().nullable(),
    expenseDate: z.string().nullable(),
    totalAmount: z.number().nonnegative().nullable(),
    gstAmount: z.number().nonnegative().nullable(),
    category: z
        .enum([
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
    ])
        .nullable(),
    description: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    warnings: z.array(z.string()),
});
//# sourceMappingURL=receipt.extraction.js.map