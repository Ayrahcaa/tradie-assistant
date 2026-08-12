export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export interface InvoiceCustomer {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
}

export interface InvoiceProject {
  id: string;
  name: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
  sortOrder: number;
  invoiceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  description: string | null;
  status: InvoiceStatus;

  issueDate: string;
  dueDate: string | null;

  subtotal: string;
  gstAmount: string;
  totalAmount: string;

  amountPaid: string;
  balanceDue: string;

  notes: string | null;
  terms: string | null;

  ownerId: string;

  customerId: string;
  customer: InvoiceCustomer;

  projectId: string | null;
  project: InvoiceProject | null;

  items: InvoiceItem[];
  payments: Payment[];

  createdAt: string;
  updatedAt: string;
}

export interface InvoicesResponse {
  count: number;
  data: Invoice[];
}
export type PaymentMethod =
  | "BANK_TRANSFER"
  | "CASH"
  | "CARD"
  | "CHEQUE"
  | "OTHER";

export interface Payment {
  id: string;
  amount: string;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  paidAt: string;
  invoiceId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
