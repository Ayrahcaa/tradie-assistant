import type { Project } from "../projects/types/project";
import type { SubcontractorCostStatus } from "../subcontractors/types/subcontractor-cost";

export interface ProjectFinancials {
  quotedValue: number; revenueBasis: number; revenueBasisLabel: string;
  invoiceTotal: number; customerPayments: number; customerOutstanding: number;
  expenses: number; expensesPaid: number; subcontractorAgreed: number;
  subcontractorPaid: number; subcontractorOutstanding: number;
  estimatedTotalCost: number; estimatedProfit: number; cashReceived: number;
  cashPaid: number; cashPosition: number; excludedLegacySubcontractorExpenses: number;
}

export interface OverviewPerson { id: string; firstName: string; lastName: string | null; businessName: string | null }
export interface OverviewProject { id: string; name: string }
export interface OverviewInvoice { id: string; invoiceNumber: string; title: string; status: string; issueDate: string; dueDate: string | null; totalAmount: string; amountPaid: string; balanceDue: string; customer: OverviewPerson }
export interface OverviewQuote { id: string; quoteNumber: string; title: string; status: string; totalAmount: string; issueDate: string; customer: OverviewPerson }
export interface OverviewExpense { id: string; description: string; supplier: string | null; category: string; status: string; amount: string; expenseDate: string; receipts: unknown[] }
export interface OverviewSubcontractorCost { id: string; description: string | null; status: SubcontractorCostStatus; agreedAmount: string; amountPaid: string; amountPending: string; subcontractor: OverviewPerson }

export interface ProjectOverview {
  project: Project & { quotes: OverviewQuote[]; invoices: OverviewInvoice[]; expenses: OverviewExpense[]; subcontractorProjectCosts: OverviewSubcontractorCost[] };
  financials: ProjectFinancials;
}

export interface Receivable { id: string; invoiceNumber: string; customer: OverviewPerson; project: OverviewProject | null; dueDate: string | null; status: string; totalAmount: string; amountPaid: string; outstanding: string }
export interface Payable { id: string; subcontractor: OverviewPerson; project: OverviewProject; description: string | null; status: string; agreedAmount: string; amountPaid: string; outstanding: string }
export interface Activity { id: string; type: string; title: string; description: string; occurredAt: string; path: string }
export interface BusinessOverview {
  business: { firstName: string; businessName: string | null; abn: string | null };
  kpis: { activeProjects: number; totalInvoiced: number; paymentsReceived: number; customerOutstanding: number; expenses: number; expensesPaid: number; subcontractorCosts: number; subcontractorPaid: number; subcontractorOutstanding: number; estimatedProfit: number; cashPosition: number };
  receivables: Receivable[]; payables: Payable[];
  activeProjects: Array<{ id: string; name: string; clientName: string | null; status: string; financials: ProjectFinancials }>;
  recentActivity: Activity[]; excludedLegacySubcontractorExpenses: number;
}

export interface CustomerOverview {
  customer: OverviewPerson & { email: string | null; phone: string | null; address: string | null; abn: string | null; notes: string | null; isArchived: boolean; projects: Project[]; quotes: Array<OverviewQuote & { project: OverviewProject | null }>; invoices: Array<OverviewInvoice & { project: OverviewProject | null }> };
  financials: { totalInvoiced: number; totalPaid: number; outstanding: number };
}
