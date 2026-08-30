import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CircleAlert,
  CircleDollarSign,
  ReceiptText,
  Send,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import {
  deleteInvoice,
  getInvoice,
  updateInvoiceStatus,
} from "../api/invoices";
import { deletePayment } from "../api/payments";
import { RecordPaymentForm } from "../components/RecordPaymentForm";
import type { InvoiceStatus, Payment, PaymentMethod } from "../types/invoice";

import { Modal } from "../../../shared/components/ui/Modal";
import { ShareMenu } from "../../../shared/components/ui/ShareMenu";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { shareOrFallback } from "../../../shared/utils/sharing";

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

function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "BANK_TRANSFER":
      return "Bank transfer";

    case "CASH":
      return "Cash";

    case "CARD":
      return "Card";

    case "CHEQUE":
      return "Cheque";

    case "OTHER":
      return "Other";
  }
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

export function InvoiceDetailsPage() {
  const { invoiceId } = useParams<{
    invoiceId: string;
  }>();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const [deleteInvoiceOpen, setDeleteInvoiceOpen] = useState(false);

  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const invoiceQuery = useQuery({
    queryKey: ["invoice", invoiceId],

    queryFn: () => getInvoice(invoiceId!),

    enabled: Boolean(invoiceId),
  });
  const currentUserQuery = useCurrentUser();

  const statusMutation = useMutation({
    mutationFn: (status: InvoiceStatus) =>
      updateInvoiceStatus(invoiceId!, status),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["invoice", invoiceId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["invoices"],
        }),
      ]);
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: () => deleteInvoice(invoiceId!),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["invoices"],
      });

      navigate("/invoices");
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => deletePayment(paymentId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["invoice", invoiceId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["invoices"],
        }),
      ]);

      setPaymentToDelete(null);
    },
  });

  if (!invoiceId) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Invalid invoice ID.
      </div>
    );
  }

  if (invoiceQuery.isPending) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

        <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (invoiceQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex gap-3">
          <CircleAlert size={22} />

          <div>
            <h1 className="font-bold">Invoice could not be loaded</h1>

            <p className="mt-1 text-sm">{invoiceQuery.error.message}</p>

            <Link
              to="/invoices"
              className="mt-4 inline-block text-sm font-bold underline"
            >
              Return to invoices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const invoice = invoiceQuery.data;

  const canRecordPayment =
    Number(invoice.balanceDue) > 0 && invoice.status !== "CANCELLED";
  const shareInput = {
    kind: "Invoice" as const, number: invoice.invoiceNumber,
    businessName: currentUserQuery.data?.businessName || [currentUserQuery.data?.firstName, currentUserQuery.data?.lastName].filter(Boolean).join(" ") || "Your business",
    customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`, customerEmail: invoice.customer.email, customerPhone: invoice.customer.phone,
    projectName: invoice.project?.name, total: invoice.totalAmount, outstanding: invoice.balanceDue, dueDate: invoice.dueDate,
  };

  return (
    <>
      <div className="mb-6">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          <ArrowLeft size={18} />
          Back to invoices
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <span
              className={[
                "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                statusClasses(invoice.status),
              ].join(" ")}
            >
              {invoice.status.replace("_", " ")}
            </span>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
              {invoice.invoiceNumber}
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {invoice.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {invoice.description || "No invoice description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {invoice.status === "DRAFT" && (
              <button
                type="button"
                onClick={() => statusMutation.mutate("SENT")}
                disabled={statusMutation.isPending}
                className="btn-secondary"
              >
                <Send size={18} />
                Mark sent
              </button>
            )}

            {canRecordPayment && (
              <button
                type="button"
                onClick={() => setPaymentOpen(true)}
                className="btn-primary"
              >
                <Banknote size={18} />
                Record payment
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <UserRound size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Customer
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {invoice.customer.firstName} {invoice.customer.lastName}
          </p>

          {invoice.customer.businessName && (
            <p className="mt-1 text-sm text-slate-500">
              {invoice.customer.businessName}
            </p>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CalendarDays size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Due date
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {formatDate(invoice.dueDate)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CircleDollarSign size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Amount paid
          </p>

          <p className="mt-1 text-xl font-bold text-emerald-700">
            {money(invoice.amountPaid)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ReceiptText size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Balance due
          </p>

          <p className="mt-1 text-xl font-bold text-slate-950">
            {money(invoice.balanceDue)}
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Invoice items</h2>

          <p className="mt-1 text-sm text-slate-500">
            Labour, materials and other charges included in this invoice.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                <th className="py-3">Description</th>
                <th className="py-3">Qty</th>
                <th className="py-3">Unit price</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-4 font-medium text-slate-900">
                    {item.description}
                  </td>

                  <td className="py-4 text-slate-600">{item.quantity}</td>

                  <td className="py-4 text-slate-600">
                    {money(item.unitPrice)}
                  </td>

                  <td className="py-4 text-right font-bold text-slate-950">
                    {money(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-6 max-w-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>

            <strong>{money(invoice.subtotal)}</strong>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">GST (10%)</span>

            <strong>{money(invoice.gstAmount)}</strong>
          </div>

          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg">
            <strong>Total</strong>

            <strong>{money(invoice.totalAmount)}</strong>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Payment history
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Every payment recorded against this invoice.
            </p>
          </div>

          {invoice.payments.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <Banknote size={28} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                No payments recorded yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-bold text-slate-950">
                      {money(payment.amount)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {paymentMethodLabel(payment.method)}
                      {" · "}
                      {formatDate(payment.paidAt)}
                    </p>

                    {payment.reference && (
                      <p className="mt-1 text-xs text-slate-400">
                        Ref: {payment.reference}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaymentToDelete(payment)}
                    className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 sm:self-auto"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Payment summary
            </h2>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Invoice total</span>

                <strong>{money(invoice.totalAmount)}</strong>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Paid</span>

                <strong className="text-emerald-700">
                  {money(invoice.amountPaid)}
                </strong>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-700">Outstanding</span>

                <strong className="text-lg">{money(invoice.balanceDue)}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Invoice actions
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void shareOrFallback(shareInput, () => setShareOpen(true))}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 hover:bg-amber-300"
              >
                <Send size={18} />
                Send invoice
              </button>

              <button
                type="button"
                disabled
                className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400"
                title="Online payments require a payment provider connection"
              >
                <CircleDollarSign size={18} />
                Pay online · Coming soon
              </button>
              {invoice.status !== "CANCELLED" && invoice.status !== "PAID" && (
                <button
                  type="button"
                  onClick={() => statusMutation.mutate("CANCELLED")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-700"
                >
                  <XCircle size={18} />
                  Cancel invoice
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteInvoiceOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700"
              >
                <Trash2 size={18} />
                Delete invoice
              </button>
            </div>
          </div>
        </div>
      </section>

      <ShareMenu
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        document={shareInput}
      />

      <Modal
        open={paymentOpen}
        title="Record payment"
        description="Record money received against this invoice."
        onClose={() => setPaymentOpen(false)}
      >
        <RecordPaymentForm
          invoice={invoice}
          onSuccess={() => setPaymentOpen(false)}
          onCancel={() => setPaymentOpen(false)}
        />
      </Modal>

      <Modal
        open={paymentToDelete !== null}
        title="Delete payment"
        description="The invoice balance will be recalculated automatically."
        onClose={() => setPaymentToDelete(null)}
      >
        <div className="p-6">
          <p className="text-sm leading-6 text-slate-600">
            Delete this payment of{" "}
            <strong>
              {paymentToDelete ? money(paymentToDelete.amount) : ""}
            </strong>
            ?
          </p>

          {deletePaymentMutation.isError && (
            <p className="mt-4 text-sm font-medium text-red-700">
              {deletePaymentMutation.error.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={() => setPaymentToDelete(null)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deletePaymentMutation.isPending}
            onClick={() => {
              if (paymentToDelete) {
                deletePaymentMutation.mutate(paymentToDelete.id);
              }
            }}
            className="h-11 rounded-xl bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
          >
            {deletePaymentMutation.isPending ? "Deleting..." : "Delete payment"}
          </button>
        </div>
      </Modal>

      <Modal
        open={deleteInvoiceOpen}
        title="Delete invoice permanently"
        description="This action cannot be undone."
        onClose={() => setDeleteInvoiceOpen(false)}
      >
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm leading-6 text-red-800">
              You are about to permanently delete{" "}
              <strong>{invoice.invoiceNumber}</strong>.
            </p>
          </div>

          {deleteInvoiceMutation.isError && (
            <p className="mt-4 text-sm font-medium text-red-700">
              {deleteInvoiceMutation.error.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={() => setDeleteInvoiceOpen(false)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => deleteInvoiceMutation.mutate()}
            disabled={deleteInvoiceMutation.isPending}
            className="h-11 rounded-xl bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
          >
            {deleteInvoiceMutation.isPending
              ? "Deleting..."
              : "Delete permanently"}
          </button>
        </div>
      </Modal>
    </>
  );
}
