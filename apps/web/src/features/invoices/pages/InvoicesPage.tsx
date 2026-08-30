import { useQuery } from "@tanstack/react-query";
import { CircleAlert, FilePlus2, ReceiptText, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { getInvoices } from "../api/invoices";
import { NewInvoiceForm } from "../components/NewInvoiceForm";
import type { Invoice, InvoiceStatus } from "../types/invoice";

import { EmptyState } from "../../../shared/components/ui/EmptyState";
import { Modal } from "../../../shared/components/ui/Modal";
import { PageHeader } from "../../../shared/components/ui/PageHeader";

type InvoiceFilter = "ALL" | InvoiceStatus;

const filters: InvoiceFilter[] = [
  "ALL",
  "DRAFT",
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

function formatMoney(value: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(value));
}

function formatDate(value: string | null): string {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusClasses(status: InvoiceStatus): string {
  switch (status) {
    case "DRAFT":
      return "bg-slate-100 text-slate-700";

    case "SENT":
      return "bg-slate-100 text-slate-700";

    case "PARTIALLY_PAID":
      return "bg-amber-100 text-amber-800";

    case "PAID":
      return "bg-emerald-100 text-emerald-700";

    case "OVERDUE":
      return "bg-red-100 text-red-700";

    case "CANCELLED":
      return "bg-amber-100 text-amber-700";
  }
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <ReceiptText size={20} />
        </div>

        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-bold",
            statusClasses(invoice.status),
          ].join(" ")}
        >
          {invoice.status.replace("_", " ")}
        </span>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
        {invoice.invoiceNumber}
      </p>

      <h2 className="mt-1 text-lg font-bold text-slate-950">{invoice.title}</h2>

      <p className="mt-2 text-sm text-slate-500">
        {invoice.customer.firstName} {invoice.customer.lastName}
      </p>

      {invoice.project && (
        <p className="mt-1 text-xs text-slate-400">{invoice.project.name}</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Due
          </p>

          <p className="mt-1 text-sm font-bold text-slate-700">
            {formatDate(invoice.dueDate)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total
          </p>

          <p className="mt-1 text-lg font-bold text-slate-950">
            {formatMoney(invoice.totalAmount)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Paid</span>

          <strong>{formatMoney(invoice.amountPaid)}</strong>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span className="font-semibold text-slate-600">Balance due</span>

          <strong className="text-slate-950">
            {formatMoney(invoice.balanceDue)}
          </strong>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          to={`/invoices/${invoice.id}`}
          className="text-sm font-bold text-slate-700 hover:text-slate-950"
        >
          View invoice
        </Link>
      </div>
    </article>
  );
}

export function InvoicesPage() {
  const [filter, setFilter] = useState<InvoiceFilter>("ALL");

  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [search, setSearch] = useState("");

  const status = filter === "ALL" ? undefined : filter;

  const invoicesQuery = useQuery({
    queryKey: ["invoices", status],

    queryFn: () => getInvoices(status),
  });
  const displayedInvoices = invoicesQuery.data?.data.filter((invoice) => `${invoice.invoiceNumber} ${invoice.title} ${invoice.customer.firstName} ${invoice.customer.lastName} ${invoice.project?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Accounts receivable"
        title="Invoices"
        description="Create invoices, track due dates, monitor payments and see outstanding balances."
        action={
          <button
            type="button"
            onClick={() => setNewInvoiceOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300"
          >
            <FilePlus2 size={18} />
            New invoice
          </button>
        }
      />

      <div className="surface-card mb-6 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1"><Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><span className="sr-only">Search invoices</span><input type="search" value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search invoices, customers or projects" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:bg-white"/></label>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
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
            {item === "ALL" ? "All invoices" : item.replace("_", " ")}
          </button>
        ))}
        </div>
      </div>

      {invoicesQuery.isPending && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {invoicesQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="flex gap-3">
            <CircleAlert size={21} />

            <p className="text-sm font-medium">{invoicesQuery.error.message}</p>
          </div>
        </div>
      )}

      {invoicesQuery.isSuccess && displayedInvoices.length === 0 && (
        <EmptyState
          title="No invoices found"
          description="Create your first invoice and begin tracking amounts due and paid."
        />
      )}

      {invoicesQuery.isSuccess && displayedInvoices.length > 0 && (
        <>
          <p className="mb-4 text-sm font-semibold text-slate-500">
            {displayedInvoices.length} invoice{displayedInvoices.length === 1 ? "" : "s"}
          </p>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayedInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        </>
      )}

      <Modal
        open={newInvoiceOpen}
        title="Create invoice"
        description="Build an itemised invoice for a customer or project."
        onClose={() => setNewInvoiceOpen(false)}
      >
        <NewInvoiceForm
          onSuccess={() => setNewInvoiceOpen(false)}
          onCancel={() => setNewInvoiceOpen(false)}
        />
      </Modal>
    </>
  );
}
