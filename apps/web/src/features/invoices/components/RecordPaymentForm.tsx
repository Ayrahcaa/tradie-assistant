import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { createPayment, type CreatePaymentInput } from "../api/payments";

import type { Invoice, PaymentMethod } from "../types/invoice";

interface RecordPaymentFormProps {
  invoice: Invoice;
  onSuccess: () => void;
  onCancel: () => void;
}

interface PaymentFormState {
  amount: string;
  method: PaymentMethod;
  reference: string;
  notes: string;
  paidAt: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RecordPaymentForm({
  invoice,
  onSuccess,
  onCancel,
}: RecordPaymentFormProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<PaymentFormState>({
    amount: invoice.balanceDue,
    method: "BANK_TRANSFER",
    reference: "",
    notes: "",
    paidAt: today(),
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createPayment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["invoice", invoice.id],
        }),

        queryClient.invalidateQueries({
          queryKey: ["invoices"],
        }),
        ...(invoice.projectId ? [queryClient.invalidateQueries({ queryKey: ["project-overview", invoice.projectId] })] : []),
        queryClient.invalidateQueries({ queryKey: ["business-overview"] }),
      ]);

      onSuccess();
    },
  });

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setValidationError(null);
    mutation.reset();

    const amount = Number(form.amount);

    const balance = Number(invoice.balanceDue);

    if (!Number.isFinite(amount) || amount <= 0) {
      setValidationError("Enter a valid payment amount.");
      return;
    }

    if (amount > balance) {
      setValidationError("Payment cannot exceed the outstanding balance.");
      return;
    }

    const payload: CreatePaymentInput = {
      invoiceId: invoice.id,
      amount,
      method: form.method,

      reference: form.reference.trim() || null,

      notes: form.notes.trim() || null,

      paidAt: new Date(`${form.paidAt}T12:00:00`).toISOString(),
    };

    mutation.mutate(payload);
  }

  const inputClasses =
    "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5 p-6">
        {(validationError || mutation.isError) && (
          <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <CircleAlert size={20} />

            <p className="text-sm font-medium">
              {validationError ?? mutation.error?.message}
            </p>
          </div>
        )}

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase text-slate-400">
            Outstanding balance
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {new Intl.NumberFormat("en-AU", {
              style: "currency",
              currency: "AUD",
            }).format(Number(invoice.balanceDue))}
          </p>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">
            Payment amount
          </label>

          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={invoice.balanceDue}
            value={form.amount}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">
            Payment method
          </label>

          <select
            name="method"
            value={form.method}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="BANK_TRANSFER">Bank transfer</option>

            <option value="CASH">Cash</option>

            <option value="CARD">Card</option>

            <option value="CHEQUE">Cheque</option>

            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">
            Payment date
          </label>

          <input
            name="paidAt"
            type="date"
            value={form.paidAt}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Reference</label>

          <input
            name="reference"
            value={form.reference}
            onChange={handleChange}
            placeholder="Bank transaction reference"
            className={inputClasses}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Notes</label>

          <textarea
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-xl border px-5 font-bold"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary"
        >
          {mutation.isPending && (
            <LoaderCircle size={18} className="animate-spin" />
          )}
          Record payment
        </button>
      </div>
    </form>
  );
}
