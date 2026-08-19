import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";

import { getProjects } from "../../projects/api/projects";
import { createSubcontractorCost, updateSubcontractorCost, type SubcontractorCostInput } from "../api/subcontractor-costs";
import type { SubcontractorProjectCost, SubcontractorRateType } from "../types/subcontractor-cost";

interface Props {
  subcontractorId: string;
  cost?: SubcontractorProjectCost;
  onSuccess: () => void;
  onCancel: () => void;
}

const rateTypes: { value: SubcontractorRateType; label: string }[] = [
  { value: "HOURLY", label: "Hourly" }, { value: "SQUARE_METRE", label: "Square metre" },
  { value: "DAILY", label: "Daily" }, { value: "FIXED_TASK", label: "Fixed task" },
  { value: "FIXED_PROJECT", label: "Fixed project" }, { value: "PER_UNIT", label: "Per unit" },
  { value: "OTHER", label: "Other" },
];

const inputClass = "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

function labels(type: SubcontractorRateType) {
  if (type === "HOURLY") return { rate: "Rate ($ / hour)", quantity: "Hours" };
  if (type === "SQUARE_METRE") return { rate: "Rate ($ / m²)", quantity: "Square metres" };
  if (type === "DAILY") return { rate: "Rate ($ / day)", quantity: "Days" };
  if (type === "PER_UNIT") return { rate: "Rate ($ / unit)", quantity: "Units" };
  return { rate: "Rate", quantity: "Quantity" };
}

export function AddSubcontractorCostForm({ subcontractorId, cost, onSuccess, onCancel }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    projectId: cost?.projectId ?? "", description: cost?.description ?? "",
    rateType: cost?.rateType ?? "HOURLY" as SubcontractorRateType,
    rate: cost?.rate ?? "", quantity: cost?.quantity ?? "",
    agreedAmount: cost?.agreedAmount ?? "", notes: cost?.notes ?? "",
  });
  const [agreedTouched, setAgreedTouched] = useState(Boolean(cost));
  const [validation, setValidation] = useState<string | null>(null);
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => getProjects() });
  const calculated = useMemo(() => {
    const rate = Number(form.rate); const quantity = Number(form.quantity);
    return form.rate !== "" && form.quantity !== "" && Number.isFinite(rate) && Number.isFinite(quantity) ? rate * quantity : null;
  }, [form.rate, form.quantity]);
  const fixed = form.rateType === "FIXED_TASK" || form.rateType === "FIXED_PROJECT";
  const fieldLabels = labels(form.rateType);

  const mutation = useMutation({
    mutationFn: (input: SubcontractorCostInput) => cost ? updateSubcontractorCost(cost.id, input) : createSubcontractorCost(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subcontractor-costs"] });
      onSuccess();
    },
  });

  function change(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (!agreedTouched && (name === "rate" || name === "quantity")) {
        const r = Number(next.rate); const q = Number(next.quantity);
        next.agreedAmount = next.rate !== "" && next.quantity !== "" && Number.isFinite(r * q) ? String(r * q) : "";
      }
      return next;
    });
    if (name === "agreedAmount") setAgreedTouched(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault(); setValidation(null); mutation.reset();
    const agreedAmount = Number(form.agreedAmount);
    const rate = form.rate === "" ? null : Number(form.rate);
    const quantity = form.quantity === "" ? null : Number(form.quantity);
    if (!form.projectId) return setValidation("Select a project.");
    if (!Number.isFinite(agreedAmount) || agreedAmount <= 0) return setValidation("Agreed amount must be greater than zero.");
    if ((rate !== null && (!Number.isFinite(rate) || rate < 0)) || (quantity !== null && (!Number.isFinite(quantity) || quantity <= 0))) return setValidation("Rate and quantity must be valid non-negative values.");
    mutation.mutate({ subcontractorId, projectId: form.projectId, description: form.description.trim() || null, rateType: form.rateType, rate, quantity, agreedAmount, notes: form.notes.trim() || null });
  }

  return <form onSubmit={submit}>
    <div className="space-y-5 p-6">
      {(validation || mutation.isError) && <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"><CircleAlert size={20}/>{validation ?? mutation.error?.message}</div>}
      <div><label className="text-sm font-bold text-slate-700">Project *</label><select name="projectId" value={form.projectId} onChange={change} className={inputClass} disabled={projects.isPending}><option value="">Select a project</option>{projects.data?.data.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>{projects.isError && <p className="mt-2 text-sm text-red-700">{projects.error.message}</p>}</div>
      <div><label className="text-sm font-bold text-slate-700">Description</label><input name="description" value={form.description} onChange={change} placeholder="e.g. Tiling work" className={inputClass}/></div>
      <div><label className="text-sm font-bold text-slate-700">Rate type *</label><select name="rateType" value={form.rateType} onChange={change} className={inputClass}>{rateTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div>
      {!fixed && <div className="grid gap-4 sm:grid-cols-2"><div><label className="text-sm font-bold text-slate-700">{fieldLabels.rate}</label><input name="rate" type="number" min="0" step="0.01" value={form.rate} onChange={change} className={inputClass}/></div><div><label className="text-sm font-bold text-slate-700">{fieldLabels.quantity}</label><input name="quantity" type="number" min="0.01" step="0.01" value={form.quantity} onChange={change} className={inputClass}/></div></div>}
      {!fixed && <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Calculated amount</p><p className="mt-1 text-xl font-bold">{calculated === null ? "—" : money.format(calculated)}</p></div>}
      <div><label className="text-sm font-bold text-slate-700">Agreed amount *</label><input name="agreedAmount" type="number" min="0.01" step="0.01" value={form.agreedAmount} onChange={change} className={inputClass}/><p className="mt-2 text-xs text-slate-500">This can differ from the calculated amount.</p></div>
      <div><label className="text-sm font-bold text-slate-700">Notes</label><textarea name="notes" rows={3} value={form.notes} onChange={change} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></div>
    </div>
    <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4"><button type="button" onClick={onCancel} className="h-11 rounded-xl border px-5 font-bold">Cancel</button><button disabled={mutation.isPending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 font-bold disabled:opacity-50">{mutation.isPending && <LoaderCircle size={18} className="animate-spin"/>}{cost ? "Save changes" : "Add project cost"}</button></div>
  </form>;
}
