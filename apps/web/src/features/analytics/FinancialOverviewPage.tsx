import { useQuery } from "@tanstack/react-query";
import {
  Banknote,
  BriefcaseBusiness,
  CircleAlert,
  HandCoins,
  Info,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getBusinessOverview } from "./api";
import { PageHeader } from "../../shared/components/ui/PageHeader";
import { MoneyChart } from "./components/FinancialCharts";
import {
  ExpenseBreakdown,
  InvoiceInsights,
  TopProjects,
} from "./components/DashboardSections";
import { MetricCard } from "./components/MetricCard";
import { aud, margin } from "./dashboard-utils";

type Preset =
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "LAST_3"
  | "THIS_YEAR"
  | "LAST_YEAR"
  | "CUSTOM";
const presets: [Preset, string][] = [
  ["THIS_MONTH", "This month"],
  ["LAST_MONTH", "Last month"],
  ["LAST_3", "Last 3 months"],
  ["THIS_YEAR", "This year"],
  ["LAST_YEAR", "Last year"],
  ["CUSTOM", "Custom"],
];
export function FinancialOverviewPage() {
  const query = useQuery({
    queryKey: ["business-overview"],
    queryFn: getBusinessOverview,
  });
  const [preset, setPreset] = useState<Preset>("THIS_YEAR");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const selected = useMemo(() => {
    if (!query.data) return [];
    const now = new Date();
    return query.data.dashboard.reportTrend.filter((point) => {
      const date = new Date(
        point.year ?? now.getFullYear(),
        point.monthIndex,
        1,
      );
      if (preset === "THIS_MONTH")
        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      if (preset === "LAST_MONTH") {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return (
          date.getFullYear() === last.getFullYear() &&
          date.getMonth() === last.getMonth()
        );
      }
      if (preset === "LAST_3") {
        const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        return date >= start && date <= now;
      }
      if (preset === "THIS_YEAR")
        return date.getFullYear() === now.getFullYear() && date <= now;
      if (preset === "LAST_YEAR")
        return date.getFullYear() === now.getFullYear() - 1;
      if (preset === "CUSTOM") {
        const start = from ? new Date(`${from}-01`) : new Date(0);
        const end = to ? new Date(`${to}-01`) : now;
        return date >= start && date <= end;
      }
      return true;
    });
  }, [query.data, preset, from, to]);
  if (query.isPending)
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;
  if (query.isError)
    return (
      <p className="flex gap-2 rounded-xl bg-red-50 p-5 text-red-700">
        <CircleAlert />
        {query.error.message}
      </p>
    );
  const data = query.data;
  const totals = selected.reduce(
    (r, p) => ({
      revenue: r.revenue + p.revenue,
      expenses: r.expenses + p.expenses,
      profit: r.profit + p.profit,
    }),
    { revenue: 0, expenses: 0, profit: 0 },
  );
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Your numbers, without the accounting maze"
        description="Explore recorded revenue, expenses, profit, invoices and project performance."
      />
      <section className="surface-card p-3">
        <div className="flex gap-2 overflow-x-auto">
          {presets.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold ${preset === key ? "bg-amber-50 text-slate-950 ring-1 ring-amber-400" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {preset === "CUSTOM" && (
          <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
            <label className="text-xs font-bold text-slate-500">
              From
              <input
                type="month"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="ml-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              To
              <input
                type="month"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="ml-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={aud(totals.revenue, true)}
          detail="customer payments recorded"
          icon={Banknote}
          tone="green"
        />
        <MetricCard
          label="Expenses"
          value={aud(totals.expenses, true)}
          detail="direct and paid subcontractor costs"
          icon={TrendingDown}
          tone="orange"
        />
        <MetricCard
          label="Profit"
          value={aud(totals.profit, true)}
          detail={`${margin(totals.profit, totals.revenue).toFixed(0)}% margin`}
          icon={TrendingUp}
          tone={totals.profit >= 0 ? "green" : "coral"}
        />
        <MetricCard
          label="GST estimate"
          value={
            data.dashboard.gst.registered
              ? aud(data.dashboard.gst.estimate, true)
              : "Not registered"
          }
          detail="current calendar year estimate"
          icon={ReceiptText}
          tone="purple"
        />
      </section>
      {selected.length ? (
        <MoneyChart data={selected} />
      ) : (
        <section className="surface-card border-dashed p-12 text-center">
          <h2 className="text-lg font-black">
            No recorded activity in this period
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Try another date range or start recording payments and expenses.
          </p>
        </section>
      )}
      <section className="grid gap-5 xl:grid-cols-2">
        <ExpenseBreakdown items={data.dashboard.expenseBreakdown} />
        <InvoiceInsights data={data.dashboard.invoiceBuckets} />
      </section>
      <TopProjects projects={data.dashboard.topProjects} />
      <section className="grid gap-4 sm:grid-cols-3">
        <Small
          label="Outstanding invoices"
          value={data.kpis.customerOutstanding}
          icon={HandCoins}
        />
        <Small
          label="Subcontractor costs"
          value={data.kpis.subcontractorCosts}
          icon={BriefcaseBusiness}
        />
        <Small
          label="Subcontractors owing"
          value={data.kpis.subcontractorOutstanding}
          icon={BriefcaseBusiness}
        />
      </section>
      <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
        <Info className="shrink-0" size={20} />
        <p className="leading-6">
          Operational business information based on recorded activity, not
          formal accounting or tax advice. GST and all-time obligation cards are
          labelled separately from the selected cash period.
        </p>
      </div>
    </div>
  );
}
function Small({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof HandCoins;
}) {
  return (
    <article className="surface-card p-5">
      <Icon className="text-amber-600" />
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black">{aud(value, true)}</p>
      <p className="mt-2 text-xs text-slate-400">All current records</p>
    </article>
  );
}
