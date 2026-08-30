import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { getProjects } from "../../projects/api/projects";

import { createExpense, type CreateExpenseInput } from "../api/expenses";
import type { ExpenseCategory, ExpenseStatus } from "../types/expense";

interface NewExpenseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  projectId?: string;
  projectName?: string;
}

interface ExpenseFormState {
  description: string;
  supplier: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  amount: string;
  gstAmount: string;
  gstTreatment: "GST_INCLUDED"|"GST_FREE"|"MANUAL"|"NOT_CLAIMABLE"|"UNKNOWN";
  expenseDate: string;
  dueDate: string;
  paidAt: string;
  projectId: string;
  notes: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const initialFormState: ExpenseFormState = {
  description: "",
  supplier: "",
  category: "MATERIALS",
  status: "PAID",
  amount: "",
  gstAmount: "",
  gstTreatment: "GST_INCLUDED",
  expenseDate: today(),
  dueDate: "",
  paidAt: today(),
  projectId: "",
  notes: "",
};

export function NewExpenseForm({ onSuccess, onCancel, projectId, projectName }: NewExpenseFormProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ExpenseFormState>({ ...initialFormState, projectId: projectId ?? "" });

  const [validationError, setValidationError] = useState<string | null>(null);

  const projectsQuery = useQuery({
    queryKey: ["projects", undefined],
    queryFn: () => getProjects(),
  });

  const mutation = useMutation({
    mutationFn: createExpense,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["expenses"] }),
        ...(projectId ? [queryClient.invalidateQueries({ queryKey: ["project-overview", projectId] })] : []),
        queryClient.invalidateQueries({ queryKey: ["business-overview"] }),
      ]);

      setForm(initialFormState);
      setValidationError(null);
      onSuccess();
    },
  });

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (name === "status" && value !== "PAID") {
        next.paidAt = "";
      }

      if (name === "status" && value === "PAID" && !next.paidAt) {
        next.paidAt = today();
      }

      return next;
    });
  }

  function validateForm(): string | null {
    if (form.description.trim().length < 2) {
      return "Description must contain at least 2 characters.";
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return "Expense amount must be greater than 0.";
    }

    const gst = form.gstAmount === "" ? 0 : Number(form.gstAmount);

    if (!Number.isFinite(gst) || gst < 0) {
      return "GST amount cannot be negative.";
    }

    if (gst > amount) {
      return "GST amount cannot exceed the expense amount.";
    }

    if (!form.expenseDate) {
      return "Expense date is required.";
    }

    return null;
  }

  function buildPayload(): CreateExpenseInput {
    return {
      description: form.description.trim(),

      supplier: form.supplier.trim() || null,

      category: form.category,

      status: form.status,

      amount: Number(form.amount),

      gstAmount: form.gstAmount === "" ? 0 : Number(form.gstAmount),
      gstTreatment: form.gstTreatment,
      gstClaimable: form.gstTreatment === "GST_INCLUDED" || form.gstTreatment === "MANUAL",

      expenseDate: new Date(`${form.expenseDate}T12:00:00`).toISOString(),

      dueDate: form.dueDate
        ? new Date(`${form.dueDate}T23:59:59`).toISOString()
        : null,

      paidAt:
        form.status === "PAID" && form.paidAt
          ? new Date(`${form.paidAt}T12:00:00`).toISOString()
          : null,

      projectId: form.projectId || null,

      notes: form.notes.trim() || null,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setValidationError(null);
    mutation.reset();

    const error = validateForm();

    if (error) {
      setValidationError(error);
      return;
    }

    mutation.mutate(buildPayload());
  }

  const inputClasses =
    "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5 p-6">
        {(validationError || mutation.isError) && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <CircleAlert size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm font-medium">
              {validationError ?? mutation.error?.message}
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-bold text-slate-700">
            Description
          </label>

          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Timber and framing materials"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">GST treatment</label>
          <select name="gstTreatment" value={form.gstTreatment} onChange={handleChange} className={inputClasses}>
            <option value="GST_INCLUDED">GST included — claimable with documentation</option>
            <option value="GST_FREE">GST free / no GST</option>
            <option value="MANUAL">Enter GST amount manually</option>
            <option value="NOT_CLAIMABLE">Not claimable</option>
            <option value="UNKNOWN">Unknown — review later</option>
          </select>
          <p className="mt-2 text-xs text-slate-500">Categories are for bookkeeping only. Confirm credit eligibility with your BAS agent.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">Supplier</label>

            <input
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              placeholder="Bunnings Warehouse"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Project</label>

            {projectId ? <div className="mt-2 flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700">{projectName ?? "Current project"}</div> : <select
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">No project selected</option>

              {projectsQuery.data?.data.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="MATERIALS">Materials</option>
              <option value="TOOLS">Tools</option>
              <option value="FUEL">Fuel</option>
              <option value="VEHICLE">Vehicle</option>
              <option value="SUBCONTRACTOR">Subcontractor</option>
              <option value="EQUIPMENT_HIRE">Equipment hire</option>
              <option value="INSURANCE">Insurance</option>
              <option value="PHONE_INTERNET">Phone & internet</option>
              <option value="OFFICE">Office</option>
              <option value="TRAVEL">Travel</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">Amount</label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-sm font-semibold text-slate-400">
                $
              </span>

              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                className={`${inputClasses} pl-8`}
                placeholder="1100.00"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">
              GST amount
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-sm font-semibold text-slate-400">
                $
              </span>

              <input
                name="gstAmount"
                type="number"
                min="0"
                step="0.01"
                value={form.gstAmount}
                onChange={handleChange}
                className={`${inputClasses} pl-8`}
                placeholder="100.00"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">
              Expense date
            </label>

            <input
              name="expenseDate"
              type="date"
              value={form.expenseDate}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Due date</label>

            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className={inputClasses}
              disabled={form.status === "PAID"}
            />
          </div>
        </div>

        {form.status === "PAID" && (
          <div>
            <label className="text-sm font-bold text-slate-700">
              Paid date
            </label>

            <input
              name="paidAt"
              type="date"
              value={form.paidAt}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        )}

        <div>
          <label className="text-sm font-bold text-slate-700">Notes</label>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Materials purchased for the bathroom renovation."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={mutation.isPending}
          className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 disabled:opacity-50"
        >
          {mutation.isPending && (
            <LoaderCircle size={18} className="animate-spin" />
          )}

          {mutation.isPending ? "Creating expense..." : "Create expense"}
        </button>
      </div>
    </form>
  );
}
