export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
  abn: string | null;
  phone: string | null;
  address: string | null;
  tradeType: string | null;
  gstRegistered: boolean;
  businessStructure: "SOLE_TRADER" | "COMPANY" | "PARTNERSHIP" | "TRUST" | "OTHER";
  gstAccountingMethod: "CASH" | "ACCRUAL";
  basFrequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  taxProfile: "UNSPECIFIED" | "AUSTRALIAN_RESIDENT_INDIVIDUAL" | "UNSUPPORTED";
  taxFinancialYear: string;
  otherTaxableIncome: unknown;
  additionalDeductions: unknown;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
      authSession?: { id: string; expiresAt: Date };
    }
  }
}

export {};
