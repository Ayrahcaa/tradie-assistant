import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Pencil,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { deleteQuote, getQuote, updateQuoteStatus } from "../api/quotes";
import { EditQuoteForm } from "../components/EditQuoteForm";
import type { QuoteStatus } from "../types/quote";

import { Modal } from "../../../shared/components/ui/Modal";
import { ShareMenu } from "../../../shared/components/ui/ShareMenu";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { shareOrFallback } from "../../../shared/utils/sharing";

function money(value: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(value));
}

function statusClasses(status: QuoteStatus) {
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

export function QuoteDetailsPage() {
  const { quoteId } = useParams<{
    quoteId: string;
  }>();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const quoteQuery = useQuery({
    queryKey: ["quote", quoteId],
    queryFn: () => getQuote(quoteId!),
    enabled: Boolean(quoteId),
  });
  const currentUserQuery = useCurrentUser();

  const statusMutation = useMutation({
    mutationFn: (status: QuoteStatus) => updateQuoteStatus(quoteId!, status),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["quote", quoteId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["quotes"],
        }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteQuote(quoteId!),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["quotes"],
      });

      navigate("/quotes");
    },
  });

  if (quoteQuery.isPending) {
    return <p>Loading quote...</p>;
  }

  if (quoteQuery.isError) {
    return (
      <div className="rounded-xl bg-red-50 p-5 text-red-700">
        <CircleAlert size={20} />
        {quoteQuery.error.message}
      </div>
    );
  }

  const quote = quoteQuery.data;
  const shareInput = { kind: "Quote" as const, number: quote.quoteNumber, businessName: currentUserQuery.data?.businessName || [currentUserQuery.data?.firstName, currentUserQuery.data?.lastName].filter(Boolean).join(" ") || "Your business", customerName: `${quote.customer.firstName} ${quote.customer.lastName}`, customerEmail: quote.customer.email, customerPhone: quote.customer.phone, projectName: quote.project?.name, total: quote.totalAmount };

  return (
    <>
      <Link
        to="/quotes"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
      >
        <ArrowLeft size={18} />
        Back to quotes
      </Link>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div>
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-bold",
                statusClasses(quote.status),
              ].join(" ")}
            >
              {quote.status}
            </span>

            <p className="mt-4 text-sm font-bold text-slate-400">
              {quote.quoteNumber}
            </p>

            <h1 className="mt-1 text-3xl font-bold">{quote.title}</h1>

            <p className="mt-2 text-slate-500">
              {quote.customer.firstName} {quote.customer.lastName}
            </p>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 font-bold"
          >
            <Pencil size={18} />
            Edit quote
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-bold">Quote items</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-slate-400">
                <th className="py-3">Description</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-4">{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{money(item.unitPrice)}</td>
                  <td className="text-right font-bold">
                    {money(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-6 max-w-sm space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{money(quote.subtotal)}</strong>
          </div>

          <div className="flex justify-between">
            <span>GST</span>
            <strong>{money(quote.gstAmount)}</strong>
          </div>

          <div className="flex justify-between border-t pt-3 text-lg">
            <strong>Total</strong>
            <strong>{money(quote.totalAmount)}</strong>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6">
        <h2 className="font-bold">Quote actions</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => void shareOrFallback(shareInput, () => setShareOpen(true))}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950 hover:bg-amber-300"
          >
            <Send size={18} />
            Send quote
          </button>

          {quote.status === "DRAFT" && (
            <button
              onClick={() => statusMutation.mutate("SENT")}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-bold"
            >
              <Send size={18} />
              Mark sent
            </button>
          )}

          {quote.status === "SENT" && (
            <>
              <button
                onClick={() => statusMutation.mutate("ACCEPTED")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 font-bold text-emerald-700"
              >
                <CheckCircle2 size={18} />
                Accept
              </button>

              <button
                onClick={() => statusMutation.mutate("REJECTED")}
                className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 font-bold text-red-700"
              >
                <XCircle size={18} />
                Reject
              </button>
            </>
          )}

          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 font-bold text-red-700"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </section>

      <ShareMenu
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        document={shareInput}
      />

      <Modal
        open={editOpen}
        title="Edit quote"
        description="Update quote details and line items."
        onClose={() => setEditOpen(false)}
      >
        <EditQuoteForm
          quote={quote}
          onSuccess={() => setEditOpen(false)}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <Modal
        open={deleteOpen}
        title="Delete quote permanently"
        description="This action cannot be undone."
        onClose={() => setDeleteOpen(false)}
      >
        <div className="p-6">
          <p>
            Delete <strong>{quote.quoteNumber}</strong>?
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
          <button
            onClick={() => setDeleteOpen(false)}
            className="rounded-xl border px-5 py-2 font-bold"
          >
            Cancel
          </button>

          <button
            onClick={() => deleteMutation.mutate()}
            className="rounded-xl bg-red-700 px-5 py-2 font-bold text-white"
          >
            Delete permanently
          </button>
        </div>
      </Modal>
    </>
  );
}
