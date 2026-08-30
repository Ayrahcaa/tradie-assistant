import { useQuery } from "@tanstack/react-query";
import { CircleAlert, Plus, ReceiptText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { getExpenses } from "../api/expenses";
import { NewExpenseForm } from "../components/NewExpenseForm";
import type { Expense, ExpenseStatus } from "../types/expense";

import { EmptyState } from "../../../shared/components/ui/EmptyState";
import { Modal } from "../../../shared/components/ui/Modal";
import { PageHeader } from "../../../shared/components/ui/PageHeader";

type ExpenseFilter = "ALL" | "WITH_RECEIPT" | "MISSING_RECEIPT" | ExpenseStatus;

const filters: ExpenseFilter[] = ["ALL", "PAID", "PENDING", "OVERDUE", "WITH_RECEIPT", "MISSING_RECEIPT"];

function money(value: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusClasses(status: ExpenseStatus): string {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700";

    case "PENDING":
      return "bg-amber-100 text-amber-700";

    case "OVERDUE":
      return "bg-red-100 text-red-700";
  }
}

function categoryLabel(category: string): string {
  return category
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ExpenseCard({ expense }: { expense: Expense }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <ReceiptText size={20} />
        </div>

        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-bold",
            statusClasses(expense.status),
          ].join(" ")}
        >
          {expense.status}
        </span>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
        {categoryLabel(expense.category)}
      </p>

      <h2 className="mt-1 text-lg font-bold text-slate-950">
        {expense.description}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {expense.supplier || "No supplier"}
      </p>

      {expense.project && (
        <p className="mt-1 text-xs text-slate-400">{expense.project.name}</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Expense date
          </p>

          <p className="mt-1 text-sm font-bold text-slate-700">
            {formatDate(expense.expenseDate)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Amount
          </p>

          <p className="mt-1 text-lg font-bold text-slate-950">
            {money(expense.amount)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">GST</span>

          <strong>{money(expense.gstAmount)}</strong>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          to={`/expenses/${expense.id}`}
          className="text-sm font-bold text-slate-700 hover:text-slate-950"
        >
          View expense
        </Link>
      </div>
    </article>
  );
}

export function ExpensesPage() {
  const [filter, setFilter] = useState<ExpenseFilter>("ALL");

  const [newExpenseOpen, setNewExpenseOpen] = useState(false);

  const status:ExpenseStatus|undefined = ["PAID","PENDING","OVERDUE"].includes(filter) ? filter as ExpenseStatus : undefined;

  const expensesQuery = useQuery({
    queryKey: ["expenses", status],
    queryFn: () => getExpenses(status),
  });
  const displayedExpenses = expensesQuery.data?.data.filter((expense) => filter === "WITH_RECEIPT" ? Boolean(expense.receipts?.length) : filter === "MISSING_RECEIPT" ? !expense.receipts?.length : true) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Business costs"
        title="Expenses"
        description="Track materials, tools, fuel, subcontractors and other business costs."
        action={
          <button
            type="button"
            onClick={() => setNewExpenseOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300"
          >
            <Plus size={18} />
            New expense
          </button>
        }
      />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={[
              "shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold",
              filter === item
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-600",
            ].join(" ")}
          >
            {item === "ALL" ? "All expenses" : item === "WITH_RECEIPT" ? "With receipt" : item === "MISSING_RECEIPT" ? "Missing receipt" : item}
          </button>
        ))}
      </div>

      {expensesQuery.isPending && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {expensesQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="flex gap-3">
            <CircleAlert size={21} />

            <p className="text-sm font-medium">{expensesQuery.error.message}</p>
          </div>
        </div>
      )}

      {expensesQuery.isSuccess && displayedExpenses.length === 0 && (
        <EmptyState
          title="No expenses found"
          description="Record your first business expense to start tracking costs and GST."
        />
      )}

      {expensesQuery.isSuccess && displayedExpenses.length > 0 && (
        <>
          <p className="mb-4 text-sm font-semibold text-slate-500">
            {displayedExpenses.length} expenses
          </p>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayedExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        </>
      )}

      <Modal
        open={newExpenseOpen}
        title="Create expense"
        description="Record a business cost and optionally link it to a project."
        onClose={() => setNewExpenseOpen(false)}
      >
        <NewExpenseForm
          onSuccess={() => setNewExpenseOpen(false)}
          onCancel={() => setNewExpenseOpen(false)}
        />
      </Modal>
    </>
  );
}
