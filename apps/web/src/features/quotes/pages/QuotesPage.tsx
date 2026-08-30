import { useQuery } from "@tanstack/react-query";
import { CircleAlert, FilePlus2, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { getQuotes } from "../api/quotes";
import { NewQuoteForm } from "../components/NewQuoteForm";
import type { Quote, QuoteStatus } from "../types/quote";

import { EmptyState } from "../../../shared/components/ui/EmptyState";
import { Modal } from "../../../shared/components/ui/Modal";
import { PageHeader } from "../../../shared/components/ui/PageHeader";

type QuoteFilter = "ALL" | QuoteStatus;

const filters: QuoteFilter[] = [
  "ALL",
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
];

function formatMoney(value: string): string {
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

function statusClasses(status: QuoteStatus): string {
  switch (status) {
    case "DRAFT":
      return "bg-slate-100 text-slate-700";

    case "SENT":
      return "bg-slate-100 text-slate-700";

    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "EXPIRED":
      return "bg-amber-100 text-amber-700";
  }
}

function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <FileText size={20} />
        </div>

        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-bold",
            statusClasses(quote.status),
          ].join(" ")}
        >
          {quote.status}
        </span>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
        {quote.quoteNumber}
      </p>

      <h2 className="mt-1 text-lg font-bold text-slate-950">{quote.title}</h2>

      <p className="mt-2 text-sm text-slate-500">
        {quote.customer.firstName} {quote.customer.lastName}
      </p>

      {quote.project && (
        <p className="mt-1 text-xs text-slate-400">{quote.project.name}</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Issued
          </p>

          <p className="mt-1 text-sm font-bold text-slate-700">
            {formatDate(quote.issueDate)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total
          </p>

          <p className="mt-1 text-lg font-bold text-slate-950">
            {formatMoney(quote.totalAmount)}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          to={`/quotes/${quote.id}`}
          className="text-sm font-bold text-slate-700 hover:text-slate-950"
        >
          View quote
        </Link>
      </div>
    </article>
  );
}

export function QuotesPage() {
  const [filter, setFilter] = useState<QuoteFilter>("ALL");

  const [newQuoteOpen, setNewQuoteOpen] = useState(false);

  const status = filter === "ALL" ? undefined : filter;

  const quotesQuery = useQuery({
    queryKey: ["quotes", status],
    queryFn: () => getQuotes(status),
  });

  return (
    <>
      <PageHeader
        eyebrow="Sales"
        title="Quotes"
        description="Create professional quotes, track their status and manage line items."
        action={
          <button
            type="button"
            onClick={() => setNewQuoteOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300"
          >
            <FilePlus2 size={18} />
            New quote
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
            {item === "ALL" ? "All quotes" : item}
          </button>
        ))}
      </div>

      {quotesQuery.isPending && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {quotesQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="flex gap-3">
            <CircleAlert size={21} />

            <p className="text-sm font-medium">{quotesQuery.error.message}</p>
          </div>
        </div>
      )}

      {quotesQuery.isSuccess && quotesQuery.data.data.length === 0 && (
        <EmptyState
          title="No quotes found"
          description="Create your first quote and add labour, materials and other line items."
        />
      )}

      {quotesQuery.isSuccess && quotesQuery.data.data.length > 0 && (
        <>
          <p className="mb-4 text-sm font-semibold text-slate-500">
            {quotesQuery.data.count} quotes
          </p>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {quotesQuery.data.data.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        </>
      )}

      <Modal
        open={newQuoteOpen}
        title="Create quote"
        description="Build an itemised quote for a customer or project."
        onClose={() => setNewQuoteOpen(false)}
      >
        <NewQuoteForm
          onSuccess={() => setNewQuoteOpen(false)}
          onCancel={() => setNewQuoteOpen(false)}
        />
      </Modal>
    </>
  );
}
