import type { Project } from "../projects/types/project";
import type { SubcontractorCostStatus } from "../subcontractors/types/subcontractor-cost";

export interface ProjectFinancials {
  quotedValue: number; revenueBasis: number; revenueBasisLabel: string;
  invoiceTotal: number; customerPayments: number; customerOutstanding: number;
  expenses: number; expensesPaid: number; subcontractorAgreed: number;
  subcontractorPaid: number; subcontractorOutstanding: number;
  estimatedTotalCost: number; estimatedProfit: number; cashReceived: number;
  cashPaid: number; cashPosition: number; excludedLegacySubcontractorExpenses: number;
  estimatedMargin:number;estimateVsActual:{estimatedRevenue:number;committedRevenue:number;revenueVariance:number;estimatedCostAllowance:number;actualCommittedCost:number};messages:string[];completionChecklist:Array<{key:string;ok:boolean;label:string}>;
}

export interface OverviewPerson { id: string; firstName: string; lastName: string | null; businessName: string | null }
export interface OverviewProject { id: string; name: string }
export interface OverviewInvoice { id: string; invoiceNumber: string; title: string; status: string; issueDate: string; dueDate: string | null; totalAmount: string; amountPaid: string; balanceDue: string; customer: OverviewPerson }
export interface OverviewQuote { id: string; quoteNumber: string; title: string; status: string; totalAmount: string; issueDate: string; customer: OverviewPerson }
export interface OverviewExpense { id: string; description: string; supplier: string | null; category: string; status: string; amount: string; expenseDate: string; receipts: unknown[] }
export interface OverviewSubcontractorCost { id: string; projectId: string; subcontractorId: string; description: string | null; rateType: string; rate: string | null; quantity: string | null; calculatedAmount: string | null; status: SubcontractorCostStatus; agreedAmount: string; amountPaid: string; amountPending: string; subcontractor: OverviewPerson; project: OverviewProject; payments: unknown[] }

export interface ProjectOverview {
  project: Project & { quotes: OverviewQuote[]; invoices: OverviewInvoice[]; expenses: OverviewExpense[]; subcontractorProjectCosts: OverviewSubcontractorCost[] };
  financials: ProjectFinancials;
}

export interface Receivable { id: string; invoiceNumber: string; customer: OverviewPerson; project: OverviewProject | null; dueDate: string | null; status: string; totalAmount: string; amountPaid: string; outstanding: string }
export interface Payable { id: string; subcontractor: OverviewPerson; project: OverviewProject; description: string | null; status: string; agreedAmount: string; amountPaid: string; outstanding: string }
export interface Activity { id: string; type: string; title: string; description: string; occurredAt: string; path: string }
export interface BusinessOverview {
  business: { firstName: string; businessName: string | null; abn: string | null; gstRegistered: boolean };
  kpis: { activeProjects: number; totalInvoiced: number; paymentsReceived: number; customerOutstanding: number; expenses: number; expensesPaid: number; subcontractorCosts: number; subcontractorPaid: number; subcontractorOutstanding: number; estimatedProfit: number; cashPosition: number };
  receivables: Receivable[]; payables: Payable[];
  activeProjects: Array<{ id: string; name: string; clientName: string | null; status: string; financials: ProjectFinancials }>;
  recentActivity: Activity[]; excludedLegacySubcontractorExpenses: number;
  dashboard: {
    year: number; monthIndex: number; yearProgress: number;
    revenueThisMonth: number; revenueLastMonth: number; expensesThisMonth: number; expensesLastMonth: number;
    profitThisMonth: number; profitLastMonth: number; ytdRevenue: number; ytdExpenses: number; ytdProfit: number;
    previousYearRevenue: number; projectedRevenue: number; projectedMonthlyRevenue: number;
    monthlyTrend: TrendPoint[]; reportTrend: TrendPoint[]; forecastTrend: TrendPoint[];
    invoiceBuckets: Record<"paid" | "sent" | "dueSoon" | "overdue", { count: number; amount: number }>;
    expenseBreakdown: Array<{ category: string; amount: number }>;
    gst: { registered: boolean; collected: number; credits: number; estimate: number };
    topProjects: Array<ProjectFinancials & { id: string; name: string; customer: string | null; status: string }>;
  };
}

export interface TrendPoint { month: string; monthIndex: number; year?: number; revenue: number; expenses: number; profit: number; kind: string }

export interface CustomerOverview {
  customer: OverviewPerson & { email: string | null; phone: string | null; address: string | null; abn: string | null; notes: string | null; isArchived: boolean; projects: Project[]; quotes: Array<OverviewQuote & { project: OverviewProject | null }>; invoices: Array<OverviewInvoice & { project: OverviewProject | null }> };
  financials: { totalInvoiced: number; totalPaid: number; outstanding: number };
}
