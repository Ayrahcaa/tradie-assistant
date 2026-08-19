import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { createSubcontractorPayment } from "../api/subcontractor-payments";
import type { SubcontractorProjectCost } from "../types/subcontractor-cost";

interface Props { cost: SubcontractorProjectCost; onSuccess: () => void; onCancel: () => void }
const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
const inputClass = "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

export function RecordSubcontractorPaymentForm({ cost, onSuccess, onCancel }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ amount: cost.amountPending, paidAt: new Date().toISOString().slice(0, 10), reference: "", notes: "" });
  const [validation, setValidation] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: createSubcontractorPayment,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["subcontractor-costs"] }); onSuccess(); },
  });
  function change(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function submit(event: FormEvent) {
    event.preventDefault(); setValidation(null); mutation.reset();
    const amount = Number(form.amount); const outstanding = Number(cost.amountPending);
    if (!Number.isFinite(amount) || amount <= 0) return setValidation("Payment must be greater than zero.");
    if (amount > outstanding) return setValidation("Payment cannot exceed the outstanding amount.");
    if (!form.paidAt) return setValidation("Select a payment date.");
    mutation.mutate({ costId: cost.id, amount, paidAt: new Date(`${form.paidAt}T12:00:00`).toISOString(), reference: form.reference.trim() || null, notes: form.notes.trim() || null });
  }
  return <form onSubmit={submit}>
    <div className="space-y-5 p-6">
      {(validation || mutation.isError) && <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"><CircleAlert size={20}/>{validation ?? mutation.error?.message}</div>}
      <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Outstanding balance</p><p className="mt-1 text-2xl font-bold">{money.format(Number(cost.amountPending))}</p></div>
      <div><label className="text-sm font-bold text-slate-700">Amount</label><input name="amount" type="number" min="0.01" max={cost.amountPending} step="0.01" value={form.amount} onChange={change} className={inputClass}/></div>
      <div><label className="text-sm font-bold text-slate-700">Payment date</label><input name="paidAt" type="date" value={form.paidAt} onChange={change} className={inputClass}/></div>
      <div><label className="text-sm font-bold text-slate-700">Reference</label><input name="reference" value={form.reference} onChange={change} placeholder="Bank transaction reference" className={inputClass}/></div>
      <div><label className="text-sm font-bold text-slate-700">Notes</label><textarea name="notes" rows={3} value={form.notes} onChange={change} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></div>
    </div>
    <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4"><button type="button" onClick={onCancel} className="h-11 rounded-xl border px-5 font-bold">Cancel</button><button disabled={mutation.isPending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 font-bold text-white disabled:opacity-50">{mutation.isPending && <LoaderCircle size={18} className="animate-spin"/>}Record payment</button></div>
  </form>;
}
