export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export interface QuoteCustomer {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface QuoteProject {
  id: string;
  name: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
  sortOrder: number;
  quoteId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  description: string | null;
  status: QuoteStatus;

  issueDate: string;
  expiryDate: string | null;

  subtotal: string;
  gstAmount: string;
  totalAmount: string;

  notes: string | null;
  terms: string | null;

  ownerId: string;
  customerId: string;
  projectId: string | null;

  customer: QuoteCustomer;
  project: QuoteProject | null;
  items: QuoteItem[];

  createdAt: string;
  updatedAt: string;
}

export interface QuotesResponse {
  count: number;
  data: Quote[];
}
