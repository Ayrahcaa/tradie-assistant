import {
  CircleDollarSign,
  FolderKanban,
  HandCoins,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router";

import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";

const activity = [
  {
    title: "Smith Bathroom Renovation",
    description: "New project created",
    time: "Today",
    icon: FolderKanban,
  },
  {
    title: "Bunnings receipt",
    description: "$287.60 materials expense",
    time: "Example",
    icon: ReceiptText,
  },
  {
    title: "Invoice #1001",
    description: "$4,300 awaiting payment",
    time: "Example",
    icon: HandCoins,
  },
];

export function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Thursday, 6 August 2026"
        title="Good morning, Demo"
        description="Here is a simple overview of your trade business. Financial values are placeholders until the expense and invoice modules are connected."
        action={
          <Link
            to="/projects"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            View projects
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total revenue"
          value="$0.00"
          description="Invoices and customer payments"
          icon={CircleDollarSign}
        />

        <StatCard
          title="Total expenses"
          value="$0.00"
          description="Receipts, bills and subcontractors"
          icon={WalletCards}
        />

        <StatCard
          title="Current profit"
          value="$0.00"
          description="Revenue minus recorded costs"
          icon={TrendingUp}
        />

        <StatCard
          title="Money outstanding"
          value="$0.00"
          description="Unpaid customer invoices"
          icon={HandCoins}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Business performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Revenue and expense chart will appear here.
              </p>
            </div>

            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
              defaultValue="6-months"
            >
              <option value="6-months">
                Last 6 months
              </option>
              <option value="12-months">
                Last 12 months
              </option>
            </select>
          </div>

          <div className="mt-8 flex min-h-72 items-center justify-center rounded-xl bg-slate-50">
            <div className="text-center">
              <TrendingUp
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Financial chart coming soon
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Recent activity
          </h2>

          <div className="mt-5 space-y-5">
            {activity.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex gap-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {item.title}
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}