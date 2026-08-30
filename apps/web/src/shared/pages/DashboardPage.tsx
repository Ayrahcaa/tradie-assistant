import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  CircleAlert,
  CircleDollarSign,
  FilePlus2,
  FolderKanban,
  HandCoins,
  Plus,
  ReceiptText,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router";
import {
  getBusinessOverview,
  getWeeklyCheck,
} from "../../features/analytics/api";
import {
  aud,
  businessInsights,
  margin,
  percentageChange,
} from "../../features/analytics/dashboard-utils";
import {
  ActivityList,
  BusinessHealth,
  ExpenseBreakdown,
  Insights,
  InvoiceInsights,
  TopProjects,
  YearAndForecast,
} from "../../features/analytics/components/DashboardSections";
import { MoneyChart } from "../../features/analytics/components/FinancialCharts";
import { MetricCard } from "../../features/analytics/components/MetricCard";

export function DashboardPage() {
  const query = useQuery({
    queryKey: ["business-overview"],
    queryFn: getBusinessOverview,
  });
  const weeklyQuery = useQuery({
    queryKey: ["weekly-check"],
    queryFn: getWeeklyCheck,
    staleTime: 60_000,
  });
  if (query.isPending) return <DashboardSkeleton />;
  if (query.isError)
    return (
      <div className="surface-card flex gap-3 border-red-200 bg-red-50 p-6 text-red-700">
        <CircleAlert />
        <div>
          <strong>Dashboard could not be loaded</strong>
          <p className="mt-1 text-sm">{query.error.message}</p>
          <button
            onClick={() => query.refetch()}
            className="mt-3 text-sm font-bold underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  const data = query.data;
  const d = data.dashboard;
  const revenueChange = percentageChange(
    d.revenueThisMonth,
    d.revenueLastMonth,
  );
  const expenseChange = percentageChange(
    d.expensesThisMonth,
    d.expensesLastMonth,
  );
  const profitChange = percentageChange(d.profitThisMonth, d.profitLastMonth);
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-[1.75rem] bg-[#152238] px-6 py-7 text-white shadow-xl sm:px-8 sm:py-9">
        <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-amber-400/15 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-amber-300">
              {new Intl.DateTimeFormat("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {greeting}, {data.business.firstName} 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Here’s how your business is looking. The important numbers are
              front and centre.
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400  px-5 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5"
          >
            View projects
            <ArrowRight size={17} />
          </Link>
        </div>
      </header>

      <section
        aria-label="Key business metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Revenue this month"
          value={aud(d.revenueThisMonth, true)}
          detail="from last month"
          change={revenueChange}
          icon={CircleDollarSign}
          tone="green"
        />
        <MetricCard
          label="Revenue this year"
          value={aud(d.ytdRevenue, true)}
          detail={`${Math.round(d.yearProgress * 100)}% through ${d.year}`}
          icon={TrendingUp}
          tone="green"
        />
        <MetricCard
          label="Expenses this month"
          value={aud(d.expensesThisMonth, true)}
          detail="from last month"
          change={expenseChange}
          icon={WalletCards}
          tone="orange"
        />
        <MetricCard
          label="Profit this month"
          value={aud(d.profitThisMonth, true)}
          detail="from last month"
          change={profitChange}
          icon={Banknote}
          tone={d.profitThisMonth >= 0 ? "green" : "coral"}
        />
        <MetricCard
          label="Profit this year"
          value={aud(d.ytdProfit, true)}
          detail={`${margin(d.ytdProfit, d.ytdRevenue).toFixed(0)}% margin`}
          icon={Sparkles}
          tone="green"
        />
        <MetricCard
          label="Money outstanding"
          value={aud(data.kpis.customerOutstanding, true)}
          detail={`${data.receivables.length} invoice${data.receivables.length === 1 ? "" : "s"} awaiting payment`}
          icon={HandCoins}
          tone="purple"
        />
        <MetricCard
          label="GST estimate"
          value={
            d.gst.registered ? aud(d.gst.estimate, true) : "Not registered"
          }
          detail={
            d.gst.registered
              ? "recorded transactions this year"
              : "GST calculations are hidden"
          }
          icon={ReceiptText}
          tone="purple"
        />
        <MetricCard
          label="Active projects"
          value={String(data.kpis.activeProjects)}
          detail="jobs currently underway"
          icon={FolderKanban}
          tone="purple"
        />
      </section>

      <MoneyChart data={d.monthlyTrend} />
      <YearAndForecast data={d} />
      <BusinessHealth data={data} />
      <section className="grid gap-5 lg:grid-cols-2">
        <OwedCard
          title="Money owed to you"
          value={data.kpis.customerOutstanding}
          detail={`${aud(d.invoiceBuckets.dueSoon.amount, true)} due soon · ${aud(d.invoiceBuckets.overdue.amount, true)} overdue`}
          icon={HandCoins}
          tone="incoming"
        />
        <OwedCard
          title="Money you owe"
          value={data.kpis.subcontractorOutstanding}
          detail={`${data.payables.length} subcontractor obligation${data.payables.length === 1 ? "" : "s"}`}
          icon={BriefcaseBusiness}
          tone="owing"
        />
      </section>
      {weeklyQuery.data?.issues.length ? (
        <section className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.15em] text-amber-700">
                Needs attention
              </p>
              <h2 className="mt-1 text-xl font-black">
                A few things to review
              </h2>
            </div>
            <Link
              to="/business-check"
              className="text-sm font-bold text-amber-800"
            >
              Open weekly check →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {weeklyQuery.data.issues.slice(0, 4).map((item, index) => (
              <Link
                key={`${item.type}-${index}`}
                to={item.path}
                className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4 text-sm font-bold"
              >
                <span>{item.title}</span>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <section className="grid gap-5 xl:grid-cols-2">
        <ExpenseBreakdown items={d.expenseBreakdown} />
        <InvoiceInsights data={d.invoiceBuckets} />
      </section>
      <TopProjects projects={d.topProjects} />
      <Insights items={businessInsights(data)} />
      <QuickActions />
      <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <ActivityList items={data.recentActivity} />
        <GstCard data={data} />
      </section>
    </div>
  );
}

function OwedCard({
  title,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  detail: string;
  icon: typeof HandCoins;
  tone: "incoming" | "owing";
}) {
  return (
    <Link
      to="/outstanding"
      className={`interactive-card relative overflow-hidden rounded-[1.25rem] border bg-white p-6 ${tone === "incoming" ? "border-emerald-200" : "border-amber-200"}`}
    >
      <div className="flex justify-between">
        <div>
          <p
            className={`text-sm font-bold ${tone === "incoming" ? "text-emerald-700" : "text-amber-800"}`}
          >
            {title}
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight">
            {aud(value, true)}
          </p>
          <p
            className="mt-3 text-xs font-semibold text-slate-600"
          >
            {detail}
          </p>
        </div>
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === "incoming" ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-800"}`}
        >
          <Icon size={23} />
        </span>
      </div>
    </Link>
  );
}
function QuickActions() {
  const actions = [
    {
      label: "New project",
      to: "/projects",
      icon: FolderKanban,
      tone: "bg-amber-100 text-amber-800",
    },
    {
      label: "Create invoice",
      to: "/invoices",
      icon: FilePlus2,
      tone: "bg-amber-100 text-amber-800",
    },
    {
      label: "Add expense",
      to: "/expenses",
      icon: WalletCards,
      tone: "bg-amber-100 text-amber-800",
    },
    {
      label: "Upload receipt",
      to: "/receipts",
      icon: ReceiptText,
      tone: "bg-amber-100 text-amber-800",
    },
    {
      label: "Add customer",
      to: "/customers",
      icon: Users,
      tone: "bg-amber-100 text-amber-800",
    },
  ];
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Plus size={19} className="text-amber-600" />
        <h2 className="text-lg font-black">Quick actions</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {actions.map(({ label, to, icon: Icon, tone }) => (
          <Link
            key={label}
            to={to}
            className="surface-card interactive-card flex items-center gap-3 p-4 text-sm font-extrabold"
          >
            <span className={`rounded-xl p-2.5 ${tone}`}>
              <Icon size={19} />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
function GstCard({
  data,
}: {
  data: Awaited<ReturnType<typeof getBusinessOverview>>;
}) {
  const gst = data.dashboard.gst;
  return (
    <article className="surface-card p-6">
      <p className="text-xs font-extrabold uppercase tracking-[.15em] text-amber-700">
        GST snapshot
      </p>
      <h2 className="mt-1 text-xl font-black">
        {gst.registered ? "Estimated GST position" : "GST not enabled"}
      </h2>
      {gst.registered ? (
        <>
          <p className="mt-4 text-4xl font-black tracking-tight">
            {aud(gst.estimate, true)}
          </p>
          <div className="mt-5 space-y-3 rounded-2xl bg-amber-50 p-4 text-sm">
            <p className="flex justify-between">
              <span>GST collected</span>
              <b>{aud(gst.collected, true)}</b>
            </p>
            <p className="flex justify-between">
              <span>GST credits</span>
              <b>-{aud(gst.credits, true)}</b>
            </p>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Estimate based on recorded transactions. Confirm figures before
            lodging with the ATO.
          </p>
          <Link
            to="/tax"
            className="mt-4 inline-flex text-sm font-bold text-slate-700 hover:text-amber-700"
          >
            Review Tax & GST →
          </Link>
        </>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Turn on GST registration in business settings if this business is
          registered for GST.
        </p>
      )}
    </article>
  );
}
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-44 rounded-[1.75rem] bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-200" />
    </div>
  );
}
