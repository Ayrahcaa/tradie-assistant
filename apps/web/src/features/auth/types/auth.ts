export interface CurrentUser {
  id: string; email: string; firstName: string; lastName: string;
  businessName: string | null; abn: string | null; phone: string | null;
  address: string | null; tradeType: string | null; gstRegistered: boolean;
  businessStructure: "SOLE_TRADER"|"COMPANY"|"PARTNERSHIP"|"TRUST"|"OTHER";
  gstAccountingMethod: "CASH"|"ACCRUAL"; basFrequency: "MONTHLY"|"QUARTERLY"|"ANNUALLY";
  taxProfile: "UNSPECIFIED"|"AUSTRALIAN_RESIDENT_INDIVIDUAL"|"UNSUPPORTED"; taxFinancialYear:string;
  otherTaxableIncome:string|number; additionalDeductions:string|number;
}
export interface RegisterInput { firstName: string; lastName: string; email: string; password: string; businessName?: string | null }
export interface LoginInput { email: string; password: string }
export type UpdateProfileInput = Partial<Pick<CurrentUser, "firstName"|"lastName"|"businessName"|"abn"|"phone"|"address"|"tradeType"|"gstRegistered"|"businessStructure"|"gstAccountingMethod"|"basFrequency"|"taxProfile"|"taxFinancialYear"|"otherTaxableIncome"|"additionalDeductions">>;
