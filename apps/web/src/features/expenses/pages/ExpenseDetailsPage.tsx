import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  Download,
  FileImage,
  FileText,
  Pencil,
  ReceiptText,
  Store,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { deleteExpense, getExpense, updateExpense } from "../api/expenses";

import {
  deleteReceipt,
  getExpenseReceipts,
  getReceiptDownloadUrl,
} from "../api/receipts";

import { EditExpenseForm } from "../components/EditExpenseForm";
import { ReceiptUpload } from "../components/ReceiptUpload";

import type { ExpenseStatus } from "../types/expense";
import type { Receipt } from "../types/receipt";

import { Modal } from "../../../shared/components/ui/Modal";

function money(value: string | number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(value));
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function categoryLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ExpenseDetailsPage() {
  const { expenseId } = useParams<{
    expenseId: string;
  }>();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null);

  const expenseQuery = useQuery({
    queryKey: ["expense", expenseId],

    queryFn: () => getExpense(expenseId!),

    enabled: Boolean(expenseId),
  });

  const receiptsQuery = useQuery({
    queryKey: ["expense-receipts", expenseId],

    queryFn: () => getExpenseReceipts(expenseId!),

    enabled: Boolean(expenseId),
  });

  const markPaidMutation = useMutation({
    mutationFn: () =>
      updateExpense(expenseId!, {
        status: "PAID",
        paidAt: new Date().toISOString(),
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["expense", expenseId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["expenses"],
        }),
      ]);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: () => deleteExpense(expenseId!),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });

      navigate("/expenses");
    },
  });

  const deleteReceiptMutation = useMutation({
    mutationFn: (receiptId: string) => deleteReceipt(receiptId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["expense-receipts", expenseId],
      });

      setReceiptToDelete(null);
    },
  });

  if (!expenseId) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Invalid expense ID.
      </div>
    );
  }

  if (expenseQuery.isPending) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

        <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (expenseQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex items-start gap-3">
          <CircleAlert size={22} className="mt-0.5 shrink-0" />

          <div>
            <h1 className="font-bold">Expense could not be loaded</h1>

            <p className="mt-1 text-sm">{expenseQuery.error.message}</p>

            <Link
              to="/expenses"
              className="mt-4 inline-block text-sm font-bold underline"
            >
              Return to expenses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const expense = expenseQuery.data;

  return (
    <>
      <div className="mb-6">
        <Link
          to="/expenses"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          <ArrowLeft size={18} />
          Back to expenses
        </Link>
      </div>

      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <span
              className={[
                "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                statusClasses(expense.status),
              ].join(" ")}
            >
              {expense.status}
            </span>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
              {categoryLabel(expense.category)}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              {expense.description}
            </h1>

            {expense.project && (
              <p className="mt-2 text-sm text-slate-500">
                Project: {expense.project.name}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300"
          >
            <Pencil size={18} />
            Edit expense
          </button>
        </div>
      </section>

      {/* Summary cards */}
      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CircleDollarSign size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Amount
          </p>

          <p className="mt-1 text-xl font-bold text-slate-950">
            {money(expense.amount)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ReceiptText size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            GST
          </p>

          <p className="mt-1 text-xl font-bold text-slate-950">
            {money(expense.gstAmount)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Store size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Supplier
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {expense.supplier || "Not provided"}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CalendarDays size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Expense date
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {formatDate(expense.expenseDate)}
          </p>
        </article>
      </section>

      {/* Expense details + actions */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Expense details</h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 text-sm">
              <span className="text-slate-500">Due date</span>

              <strong className="text-slate-950">
                {formatDate(expense.dueDate)}
              </strong>
            </div>

            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 text-sm">
              <span className="text-slate-500">Paid date</span>

              <strong className="text-slate-950">
                {formatDate(expense.paidAt)}
              </strong>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">Notes</p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {expense.notes || "No notes provided."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Expense actions</h2>

          <p className="mt-1 text-sm text-slate-500">
            Update payment status or remove this expense.
          </p>

          <div className="mt-5 space-y-3">
            {expense.status !== "PAID" && (
              <button
                type="button"
                onClick={() => markPaidMutation.mutate()}
                disabled={markPaidMutation.isPending}
                className="btn-primary w-full"
              >
                <Clock3 size={18} />

                {markPaidMutation.isPending ? "Updating..." : "Mark as paid"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100"
            >
              <Trash2 size={18} />
              Delete expense
            </button>
          </div>

          {markPaidMutation.isError && (
            <p className="mt-4 text-sm font-medium text-red-700">
              {markPaidMutation.error.message}
            </p>
          )}
        </div>
      </section>

      {/* Receipts */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Receipts</h2>

            <p className="mt-1 text-sm text-slate-500">
              Store receipt images and PDFs against this expense.
            </p>
          </div>

          <ReceiptUpload expenseId={expense.id} />
        </div>

        {receiptsQuery.isPending && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        )}

        {receiptsQuery.isError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3 text-red-700">
              <CircleAlert size={20} className="mt-0.5 shrink-0" />

              <p className="text-sm font-medium">
                {receiptsQuery.error.message}
              </p>
            </div>
          </div>
        )}

        {receiptsQuery.isSuccess && receiptsQuery.data.data.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <FileImage size={30} className="mx-auto text-slate-300" />

            <p className="mt-3 font-semibold text-slate-600">
              No receipts uploaded
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Upload the receipt or invoice associated with this expense.
            </p>
          </div>
        )}

        {receiptsQuery.isSuccess && receiptsQuery.data.data.length > 0 && (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {receiptsQuery.data.data.map((receipt) => {
              const isPdf = receipt.mimeType === "application/pdf";

              return (
                <article
                  key={receipt.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      {isPdf ? <FileText size={20} /> : <FileImage size={20} />}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950">
                        {receipt.originalName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatFileSize(receipt.fileSize)}
                        {" · "}
                        {formatDate(receipt.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a
                      href={getReceiptDownloadUrl(receipt.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
                    >
                      <Download size={16} />
                      View
                    </a>

                    <button
                      type="button"
                      onClick={() => setReceiptToDelete(receipt)}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit expense modal */}
      <Modal
        open={editOpen}
        title="Edit expense"
        description="Update expense information."
        onClose={() => setEditOpen(false)}
      >
        <EditExpenseForm
          expense={expense}
          onSuccess={() => setEditOpen(false)}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      {/* Delete receipt modal */}
      <Modal
        open={receiptToDelete !== null}
        title="Delete receipt"
        description="This removes the uploaded receipt permanently."
        onClose={() => setReceiptToDelete(null)}
      >
        <div className="p-6">
          <p className="text-sm leading-6 text-slate-600">
            Delete <strong>{receiptToDelete?.originalName}</strong>?
          </p>

          {deleteReceiptMutation.isError && (
            <p className="mt-4 text-sm font-medium text-red-700">
              {deleteReceiptMutation.error.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={() => setReceiptToDelete(null)}
            disabled={deleteReceiptMutation.isPending}
            className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleteReceiptMutation.isPending}
            onClick={() => {
              if (receiptToDelete) {
                deleteReceiptMutation.mutate(receiptToDelete.id);
              }
            }}
            className="h-11 rounded-xl bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
          >
            {deleteReceiptMutation.isPending ? "Deleting..." : "Delete receipt"}
          </button>
        </div>
      </Modal>

      {/* Delete expense modal */}
      <Modal
        open={deleteOpen}
        title="Delete expense permanently"
        description="This action cannot be undone."
        onClose={() => setDeleteOpen(false)}
      >
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm leading-6 text-red-800">
              You are about to permanently delete{" "}
              <strong>{expense.description}</strong>.
            </p>
          </div>

          {deleteExpenseMutation.isError && (
            <p className="mt-4 text-sm font-medium text-red-700">
              {deleteExpenseMutation.error.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            disabled={deleteExpenseMutation.isPending}
            className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => deleteExpenseMutation.mutate()}
            disabled={deleteExpenseMutation.isPending}
            className="h-11 rounded-xl bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
          >
            {deleteExpenseMutation.isPending
              ? "Deleting..."
              : "Delete permanently"}
          </button>
        </div>
      </Modal>
    </>
  );
}
