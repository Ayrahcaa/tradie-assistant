import { z } from "zod";
const optionalText = (max) => z.string().trim().max(max).optional().nullable();
const subcontractorFieldsSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2, "First name must contain at least 2 characters.")
        .max(100),
    lastName: optionalText(100),
    businessName: optionalText(150),
    abn: optionalText(20),
    email: z
        .string()
        .trim()
        .email("A valid email address is required.")
        .optional()
        .nullable(),
    phone: optionalText(30),
    address: optionalText(250),
    notes: optionalText(1000),
    isArchived: z.boolean().optional(),
});
export const createSubcontractorSchema = subcontractorFieldsSchema;
export const updateSubcontractorSchema = subcontractorFieldsSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
});
export const subcontractorIdSchema = z.object({
    subcontractorId: z.string().uuid("Subcontractor ID must be a valid UUID."),
});
//# sourceMappingURL=subcontractor.schema.js.map