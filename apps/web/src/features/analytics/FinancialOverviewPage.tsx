import { useQuery } from "@tanstack/react-query";
import { Banknote, BriefcaseBusiness, CircleAlert, HandCoins, Info, TrendingUp, WalletCards } from "lucide-react";
import { getBusinessOverview } from "./api";
import { PageHeader } from "../../shared/components/ui/PageHeader";

const money = (value: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value);
export function FinancialOverviewPage() {
  const query = useQuery({ queryKey: ["business-overview"], queryFn: getBusinessOverview });
  if (query.isPending) return <div className="h-96 animate-pulse rounded-2xl bg-slate-200"/>;
  if (query.isError) return <p className="flex gap-2 rounded-xl bg-red-50 p-5 text-red-700"><CircleAlert/>{query.error.message}</p>;
  const { kpis, excludedLegacySubcontractorExpenses } = query.data;
  const commitments = [["Invoices issued", kpis.totalInvoiced],["Direct expenses",kpis.expenses],["Subcontractor agreed costs",kpis.subcontractorCosts],["Estimated profit",kpis.estimatedProfit]] as const;
  const cash = [["Customer payments received",kpis.paymentsReceived],["Expenses actually paid",kpis.expensesPaid],["Subcontractors actually paid",kpis.subcontractorPaid],["Current cash position",kpis.cashPosition]] as const;
  return <><PageHeader eyebrow="Business finances" title="Your numbers, clearly separated" description="See committed revenue and costs alongside actual cash movement. Values cover all current records."/>
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{[[HandCoins,"Outstanding receivables",kpis.customerOutstanding],[BriefcaseBusiness,"Outstanding payables",kpis.subcontractorOutstanding],[TrendingUp,"Estimated profit",kpis.estimatedProfit],[Banknote,"Cash position",kpis.cashPosition]].map(([Icon,label,value]) => { const CardIcon=Icon as typeof HandCoins; return <article key={label as string} className="rounded-2xl bg-slate-950 p-5 text-white"><CardIcon className="text-amber-400"/><p className="mt-4 text-xs font-bold uppercase text-slate-400">{label as string}</p><p className={`mt-1 text-2xl font-bold ${Number(value)<0 ? "text-red-400" : ""}`}>{money(Number(value))}</p></article>;})}</section>
    <section className="mt-6 grid gap-6 xl:grid-cols-2"><Breakdown title="Committed / estimated" description="Invoice revenue less direct expenses and agreed subcontractor costs." icon={TrendingUp} rows={commitments}/><Breakdown title="Actual cash movement" description="Payments received less expenses and subcontractors actually paid." icon={Banknote} rows={cash}/></section>
    <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900"><div className="flex gap-3"><Info className="shrink-0" size={20}/><div><strong>Prototype financial overview</strong><p className="mt-1 leading-6">This is operational job-management information, not formal accounting or tax advice. GST is included in recorded totals. Draft and cancelled invoices are excluded from invoiced revenue.</p></div></div></section>
    {excludedLegacySubcontractorExpenses > 0 && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{money(excludedLegacySubcontractorExpenses)} recorded under the legacy Subcontractor expense category is excluded to avoid double counting structured subcontractor work.</p>}
  </>;
}
function Breakdown({ title, description, icon: Icon, rows }: { title:string; description:string; icon:typeof WalletCards; rows:readonly (readonly [string,number])[] }) { return <div className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Icon/></span><div><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></div><div className="mt-6 divide-y">{rows.map(([label,value],i) => <div key={label} className={`flex justify-between py-4 ${i===rows.length-1 ? "text-lg" : "text-sm"}`}><span className={i===rows.length-1 ? "font-bold" : "text-slate-500"}>{label}</span><strong className={value<0 ? "text-red-700" : ""}>{money(value)}</strong></div>)}</div></div>; }
