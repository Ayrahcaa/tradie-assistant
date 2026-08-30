import { z } from "zod";
const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(8, "Password must be at least 8 characters.").max(128);
export const registerSchema = z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email,
    password,
    businessName: z.string().trim().max(160).optional().nullable(),
});
export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });
export const updateProfileSchema = z.object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    businessName: z.string().trim().max(160).optional().nullable(),
    abn: z.string().trim().max(20).optional().nullable(),
    phone: z.string().trim().max(40).optional().nullable(),
    address: z.string().trim().max(300).optional().nullable(),
    tradeType: z.string().trim().max(120).optional().nullable(),
    gstRegistered: z.boolean().optional(),
    businessStructure: z.enum(["SOLE_TRADER", "COMPANY", "PARTNERSHIP", "TRUST", "OTHER"]).optional(),
    gstAccountingMethod: z.enum(["CASH", "ACCRUAL"]).optional(),
    basFrequency: z.enum(["MONTHLY", "QUARTERLY", "ANNUALLY"]).optional(),
    taxProfile: z.enum(["UNSPECIFIED", "AUSTRALIAN_RESIDENT_INDIVIDUAL", "UNSUPPORTED"]).optional(),
    taxFinancialYear: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    otherTaxableIncome: z.number().nonnegative().optional(),
    additionalDeductions: z.number().nonnegative().optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one field is required.");
//# sourceMappingURL=auth.schema.js.map