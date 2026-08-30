import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileCheck2,
  FileText,
  FolderKanban,
  Lightbulb,
  ReceiptText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router";
import type { Activity, BusinessOverview } from "../types";
import { aud, categoryLabel, margin } from "../dashboard-utils";
import { ForecastChart } from "./FinancialCharts";

export function YearAndForecast({
  data,
}: {
  data: BusinessOverview["dashboard"];
}) {
  const progress = Math.round(data.yearProgress * 100);
  return (
    <section className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
      <article className="surface-card overflow-hidden p-6">
        <p className="text-xs font-extrabold uppercase tracking-[.15em] text-slate-600">
          This year
        </p>
        <div className="mt-2 flex items-end justify-between">
          <h2 className="text-3xl font-black">{data.year}</h2>
          <b className="text-sm text-slate-500">{progress}% through the year</b>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-amber-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Mini label="Revenue so far" value={aud(data.ytdRevenue, true)} />
          <Mini label="Expenses" value={aud(data.ytdExpenses, true)} />
          <Mini label="Profit" value={aud(data.ytdProfit, true)} />
          <Mini
            label="Projected"
            value={aud(data.projectedRevenue, true)}
            accent
          />
        </div>
      </article>
      <article className="surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.15em] text-amber-700">
              <Sparkles size={15} />
              Revenue forecast
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              {aud(data.projectedRevenue, true)}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Projected {data.year} revenue based on recorded earning pace.
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-slate-700">
            Actual <span className="text-emerald-600">—</span> &nbsp; Projected{" "}
            <span className="text-amber-700">- -</span>
          </span>
        </div>
        <ForecastChart data={data.forecastTrend} />
        <p className="mt-4 text-xs text-slate-500">
          Projection is an estimate based on recorded business activity.
        </p>
      </article>
    </section>
  );
}
function Mini({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${accent ? "bg-amber-50" : "bg-slate-50"}`}
    >
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p
        className={`mt-1 text-xl font-black ${accent ? "text-amber-800" : "text-slate-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

export function BusinessHealth({ data }: { data: BusinessOverview }) {
  const marginValue = margin(
    data.dashboard.ytdProfit,
    data.dashboard.ytdRevenue,
  );
  const items = [
    {
      label: "Cash flow",
      value: data.kpis.cashPosition >= 0 ? "Healthy" : "Needs review",
      tone: data.kpis.cashPosition >= 0 ? "green" : "orange",
    },
    {
      label: "Invoices",
      value: data.dashboard.invoiceBuckets.overdue.count
        ? `${data.dashboard.invoiceBuckets.overdue.count} overdue`
        : "On track",
      tone: data.dashboard.invoiceBuckets.overdue.count ? "coral" : "green",
    },
    {
      label: "Profit margin",
      value: `${marginValue.toFixed(0)}%`,
      tone: marginValue >= 20 ? "green" : "orange",
    },
    {
      label: "Expenses",
      value:
        data.dashboard.expensesThisMonth <= data.dashboard.expensesLastMonth
          ? "Stable"
          : "Higher this month",
      tone:
        data.dashboard.expensesThisMonth <= data.dashboard.expensesLastMonth
          ? "neutral"
          : "orange",
    },
    {
      label: "GST",
      value: data.dashboard.gst.registered
        ? `${aud(data.dashboard.gst.estimate, true)} estimated`
        : "Not registered",
      tone: "orange",
    },
  ];
  return (
    <section className="surface-card p-6">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[.15em] text-amber-700">
          At a glance
        </p>
        <h2 className="mt-1 text-xl font-black">Business health</h2>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500">{item.label}</p>
            <p
              className={`mt-2 flex items-center gap-2 text-sm font-extrabold ${item.tone === "green" ? "text-emerald-700" : item.tone === "coral" ? "text-red-700" : item.tone === "orange" ? "text-amber-800" : "text-slate-700"}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ExpenseBreakdown({
  items,
}: {
  items: BusinessOverview["dashboard"]["expenseBreakdown"];
}) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return (
    <article className="surface-card p-6">
      <h2 className="text-xl font-black">Where the money went</h2>
      <p className="mt-1 text-sm text-slate-500">
        Recorded expenses this year by category.
      </p>
      {items.length ? (
        <div className="mt-6 space-y-4">
          {items.slice(0, 6).map((item) => (
            <div key={item.category}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-bold text-slate-700">
                  {categoryLabel(item.category)}
                </span>
                <span className="text-slate-500">
                  {aud(item.amount, true)} ·{" "}
                  {Math.round((item.amount / total) * 100)}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-500"
                  style={{ width: `${(item.amount / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          icon={ReceiptText}
          title="No expenses recorded"
          text="Add your first business expense and we'll start showing where your money goes."
          to="/expenses"
          action="Add expense"
        />
      )}
    </article>
  );
}

export function InvoiceInsights({
  data,
}: {
  data: BusinessOverview["dashboard"]["invoiceBuckets"];
}) {
  const config = [
    {
      key: "paid",
      label: "Paid",
      icon: CheckCircle2,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      key: "sent",
      label: "Sent",
      icon: FileText,
      tone: "text-slate-700 bg-slate-50",
    },
    {
      key: "dueSoon",
      label: "Due soon",
      icon: Clock3,
      tone: "text-amber-700 bg-amber-50",
    },
    {
      key: "overdue",
      label: "Overdue",
      icon: CircleAlert,
      tone: "text-red-700 bg-red-50",
    },
  ] as const;
  return (
    <article className="surface-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-black">Invoice pulse</h2>
          <p className="mt-1 text-sm text-slate-500">
            What has been paid and what needs attention.
          </p>
        </div>
        <Link to="/invoices" className="text-sm font-bold text-slate-700 hover:text-amber-700">
          View invoices →
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {config.map(({ key, label, icon: Icon, tone }) => (
          <div key={key} className={`rounded-2xl p-4 ${tone}`}>
            <Icon size={18} />
            <p className="mt-3 text-xs font-bold">
              {label} · {data[key].count}
            </p>
            <p className="mt-1 text-lg font-black">
              {aud(data[key].amount, true)}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function TopProjects({
  projects,
}: {
  projects: BusinessOverview["dashboard"]["topProjects"];
}) {
  return (
    <article className="surface-card p-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-black">Top projects</h2>
          <p className="mt-1 text-sm text-slate-500">
            Profitability based on recorded revenue and costs.
          </p>
        </div>
        <Link to="/projects" className="text-sm font-bold text-slate-700 hover:text-amber-700">
          View all →
        </Link>
      </div>
      {projects.length ? (
        <div className="mt-5 divide-y divide-slate-100">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="grid gap-3 py-4 hover:bg-slate-50 sm:grid-cols-[1fr_repeat(3,auto)] sm:items-center sm:px-2"
            >
              <div>
                <p className="font-extrabold">{project.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {project.customer || "No customer"} ·{" "}
                  {project.status.toLowerCase()}
                </p>
              </div>
              <ProjectValue
                label="Revenue"
                value={project.invoiceTotal || project.revenueBasis}
              />
              <ProjectValue label="Costs" value={project.estimatedTotalCost} />
              <div className="sm:min-w-28 sm:text-right">
                <p className="text-xs text-slate-500">Profit</p>
                <p
                  className={`font-black ${project.estimatedProfit > 0 ? "text-emerald-700" : project.estimatedProfit < 0 ? "text-red-700" : "text-slate-900"}`}
                >
                  {aud(project.estimatedProfit, true)}
                </p>
                <p className="text-xs text-slate-400">
                  {project.estimatedMargin.toFixed(0)}% margin
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          icon={FolderKanban}
          title="No project figures yet"
          text="Link quotes, invoices and expenses to projects to see profitability here."
          to="/projects"
          action="View projects"
        />
      )}
    </article>
  );
}
function ProjectValue({ label, value }: { label: string; value: number }) {
  return (
    <div className="sm:min-w-24 sm:text-right">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-bold">{aud(value, true)}</p>
    </div>
  );
}

export function Insights({ items }: { items: string[] }) {
  return (
    <article className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-amber-400 p-2.5 text-slate-950">
          <Lightbulb size={20} />
        </span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.15em] text-amber-800">
            Friendly insights
          </p>
          <h2 className="text-xl font-black">Worth knowing</h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-amber-100 bg-white p-4 text-sm font-semibold leading-6 text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}

export function ActivityList({ items }: { items: Activity[] }) {
  const icons: Record<string, typeof FileText> = {
    PROJECT: FolderKanban,
    INVOICE: FileText,
    PAYMENT: Banknote,
    EXPENSE: ReceiptText,
    SUBCONTRACTOR_PAYMENT: FileCheck2,
  };
  return (
    <article className="surface-card p-6">
      <h2 className="text-xl font-black">Recent activity</h2>
      <p className="mt-1 text-sm text-slate-500">
        The latest movement across your business.
      </p>
      <div className="mt-5 space-y-1">
        {items.length ? (
          items.slice(0, 6).map((item) => {
            const Icon = icons[item.type] || TrendingUp;
            return (
              <Link
                key={item.id}
                to={item.path}
                className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50"
              >
                <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
                  <Icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>
                <ArrowRight size={16} className="text-slate-300" />
              </Link>
            );
          })
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            Activity will appear as you use the app.
          </p>
        )}
      </div>
    </article>
  );
}

function Empty({
  icon: Icon,
  title,
  text,
  to,
  action,
}: {
  icon: typeof ReceiptText;
  title: string;
  text: string;
  to: string;
  action: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
        <Icon size={22} />
      </span>
      <h3 className="mt-3 font-black">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
        {text}
      </p>
      <Link
        to={to}
        className="btn-primary mt-4"
      >
        {action}
      </Link>
    </div>
  );
}
