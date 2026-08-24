export interface CurrentUser {
  id: string; email: string; firstName: string; lastName: string;
  businessName: string | null; abn: string | null; phone: string | null;
  address: string | null; tradeType: string | null; gstRegistered: boolean;
}
export interface RegisterInput { firstName: string; lastName: string; email: string; password: string; businessName?: string | null }
export interface LoginInput { email: string; password: string }
export type UpdateProfileInput = Partial<Pick<CurrentUser, "firstName"|"lastName"|"businessName"|"abn"|"phone"|"address"|"tradeType"|"gstRegistered">>;
