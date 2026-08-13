import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { getProjects } from "../../projects/api/projects";

import { updateExpense, type UpdateExpenseInput } from "../api/expenses";

import type { Expense, ExpenseCategory, ExpenseStatus } from "../types/expense";

interface EditExpenseFormProps {
  expense: Expense;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ExpenseFormState {
  description: string;
  supplier: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  amount: string;
  gstAmount: string;
  expenseDate: string;
  dueDate: string;
  paidAt: string;
  projectId: string;
  notes: string;
}

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function EditExpenseForm({
  expense,
  onSuccess,
  onCancel,
}: EditExpenseFormProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ExpenseFormState>({
    description: expense.description,
    supplier: expense.supplier ?? "",
    category: expense.category,
    status: expense.status,
    amount: expense.amount,
    gstAmount: expense.gstAmount,
    expenseDate: toDateInput(expense.expenseDate),
    dueDate: toDateInput(expense.dueDate),
    paidAt: toDateInput(expense.paidAt),
    projectId: expense.projectId ?? "",
    notes: expense.notes ?? "",
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const projectsQuery = useQuery({
    queryKey: ["projects", undefined],
    queryFn: () => getProjects(),
  });

  const mutation = useMutation({
    mutationFn: (input: UpdateExpenseInput) => updateExpense(expense.id, input),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["expense", expense.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["expenses"],
        }),
      ]);

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

    return null;
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

    mutation.mutate({
      description: form.description.trim(),
      supplier: form.supplier.trim() || null,
      category: form.category,
      status: form.status,
      amount: Number(form.amount),
      gstAmount: form.gstAmount === "" ? 0 : Number(form.gstAmount),

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
    });
  }

  const inputClasses =
    "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5 p-6">
        {(validationError || mutation.isError) && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <CircleAlert size={20} />

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
            className={inputClasses}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">Supplier</label>

            <input
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Project</label>

            <select
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
            </select>
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

            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">
              GST amount
            </label>

            <input
              name="gstAmount"
              type="number"
              min="0"
              step="0.01"
              value={form.gstAmount}
              onChange={handleChange}
              className={inputClasses}
            />
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
              disabled={form.status === "PAID"}
              className={inputClasses}
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
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none"
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
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 font-bold disabled:opacity-50"
        >
          {mutation.isPending && (
            <LoaderCircle size={18} className="animate-spin" />
          )}
          Save changes
        </button>
      </div>
    </form>
  );
}
