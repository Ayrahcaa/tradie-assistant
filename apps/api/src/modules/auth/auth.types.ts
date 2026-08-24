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
