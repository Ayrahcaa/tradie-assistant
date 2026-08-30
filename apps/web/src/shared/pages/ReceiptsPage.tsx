import { useQuery } from "@tanstack/react-query";
import { CircleAlert, FileImage, ReceiptText, Upload } from "lucide-react";
import { Link } from "react-router";
import { getExpenses } from "../../features/expenses/api/expenses";
import { PageHeader } from "../components/ui/PageHeader";
import { aud, categoryLabel } from "../../features/analytics/dashboard-utils";

export function ReceiptsPage() {
  const query = useQuery({
    queryKey: ["expenses", undefined],
    queryFn: () => getExpenses(),
  });
  const receipts =
    query.data?.data.flatMap((expense) =>
      (expense.receipts || []).map((receipt) => ({ receipt, expense })),
    ) || [];
  return (
    <>
      <PageHeader
        eyebrow="Receipts"
        title="Your receipt library"
        description="Every uploaded file stays connected to its expense and project."
        action={
          <Link
            to="/expenses"
            className="btn-primary"
          >
            <Upload size={17} />
            Upload via expense
          </Link>
        }
      />
      {query.isPending && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      )}
      {query.isError && (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <CircleAlert />
          <p>{query.error.message}</p>
        </div>
      )}
      {query.isSuccess && !receipts.length && (
        <section className="surface-card border-dashed px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-amber-100 text-amber-800">
            <ReceiptText size={28} />
          </span>
          <h2 className="mt-5 text-xl font-black">No receipts yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Upload a receipt from an expense and it will appear here, already
            linked to the right business cost.
          </p>
          <Link
            to="/expenses"
            className="btn-primary mt-5"
          >
            Choose an expense
          </Link>
        </section>
      )}
      {receipts.length > 0 && (
        <>
          <p className="mb-4 text-sm font-bold text-slate-500">
            {receipts.length} uploaded receipt{receipts.length === 1 ? "" : "s"}
          </p>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {receipts.map(({ receipt, expense }) => (
              <Link
                key={receipt.id}
                to={`/expenses/${expense.id}`}
                className="surface-card interactive-card overflow-hidden"
              >
                <div className="flex h-32 items-center justify-center bg-slate-50 text-slate-500">
                  <FileImage size={40} />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold uppercase tracking-wider text-amber-700">
                        {categoryLabel(expense.category)}
                      </p>
                      <h2 className="mt-1 truncate text-lg font-black">
                        {expense.supplier || expense.description}
                      </h2>
                    </div>
                    <strong className="shrink-0 text-lg">
                      {aud(expense.amount)}
                    </strong>
                  </div>
                  <p className="mt-3 truncate text-sm text-slate-500">
                    {receipt.originalName}
                  </p>
                  <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                    <span>
                      {new Intl.DateTimeFormat("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(expense.expenseDate))}
                    </span>
                    <span>{expense.project?.name || "No project"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        </>
      )}
    </>
  );
}
