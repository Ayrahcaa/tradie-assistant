import type { BusinessOverview, CustomerOverview, ProjectOverview, Receivable, Payable } from "./types";
import { API_URL, apiFetch } from "../../shared/api/http";

async function get<T>(path: string, fallback: string): Promise<T> {
  const response = await apiFetch(`${API_URL}${path}`);
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    if (body && typeof body === "object" && "message" in body && typeof body.message === "string") throw new Error(body.message);
    throw new Error(fallback);
  }
  return ((await response.json()) as { data: T }).data;
}

export const getBusinessOverview = () => get<BusinessOverview>("/analytics/overview", "Unable to load business overview.");
export const getProjectOverview = (projectId: string) => get<ProjectOverview>(`/analytics/projects/${projectId}`, "Unable to load project overview.");
export const getCustomerOverview = (customerId: string) => get<CustomerOverview>(`/analytics/customers/${customerId}`, "Unable to load customer overview.");
export const getMoneyHub = () => get<MoneyHub>("/financial/money", "Unable to load the money hub.");
export const getTaxSummary = (preset = "quarter") => get<TaxSummary>(`/financial/tax-summary?preset=${preset}`, "Unable to load the tax and GST summary.");
export const getWeeklyCheck = () => get<WeeklyCheck>("/financial/weekly-check", "Unable to load the weekly business check.");
export const getCashflow = () => get<Cashflow>("/financial/cashflow?days=14", "Unable to load the cashflow forecast.");
export const getSubcontractorStatement = (id:string,preset="financial-year") => get<SubcontractorStatement>(`/financial/subcontractors/${id}/statement?preset=${preset}`, "Unable to load the statement.");
export async function recordPayg(amount:number,paidAt:string,period?:string){const response=await apiFetch(`${API_URL}/financial/payg-instalments`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount,paidAt,period})});if(!response.ok)throw new Error("Unable to record PAYG instalment.");return response.json()}
export const accountantExportUrl = `${API_URL}/financial/accountant-export.csv?preset=financial-year`;

export interface MoneyHub { owedToYou:string;youOwe:string;netPosition:string;receivables:Array<Receivable&{daysOverdue:number}>;payables:Payable[] }
export interface TaxSummary { registered:boolean;range:{from:string;to:string};settings:{gstAccountingMethod:string;basFrequency:string;taxProfile:string;taxFinancialYear:string};gst:{g1:string|number;gstOnSales:string|number;confirmedCredits:string|number;potentialCredits:string|number;netGst:string|number;missingReceipts:number;unknownItems:number};profit:null|{incomeExGst:string;expensesExGst:string;subcontractorCosts:string;businessProfit:string};tax:null|{calculatorIncome:string;indicativeIncomeTax:number|null;paygPaid:string;suggestedReserve:number|null;supported:boolean} }
export interface WeeklyCheck { moneyReceived:string;moneySpent:string;newInvoices:string;customerOutstanding:string;subcontractorOutstanding:string;issues:Array<{type:string;title:string;path:string}> }
export interface Cashflow { range:{from:string;to:string};comingIn:Array<{id:string;invoiceNumber:string;dueDate:string;balanceDue:string;customer:{firstName:string;lastName:string}}> ;goingOut:Array<{id:string;description:string;dueDate:string;amount:string}>;totalComingIn:string;totalGoingOut:string;netExpected:string;qualification:string }
export interface SubcontractorStatement {subcontractor:{firstName:string;lastName:string|null;businessName:string|null};range:{from:string;to:string};entries:Array<{id:string;description:string|null;agreedAmount:string;project:{name:string};payments:Array<{id:string;amount:string;paidAt:string}>}>;totalAgreed:string;totalPaid:string;balance:string}
