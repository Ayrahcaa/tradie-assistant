import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { getCustomers } from "../../customers/api/customers";
import { getProjects } from "../../projects/api/projects";

import { createInvoice, type CreateInvoiceInput } from "../api/invoices";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";

interface NewInvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  projectId?: string;
  projectName?: string;
  customerId?: string;
  customerName?: string;
}

interface InvoiceItemForm {
  description: string;
  quantity: string;
  unitPrice: string;
  gstApplicable: boolean;
}

interface InvoiceFormState {
  title: string;
  description: string;
  customerId: string;
  projectId: string;
  dueDate: string;
  notes: string;
  terms: string;
}

const initialFormState: InvoiceFormState = {
  title: "",
  description: "",
  customerId: "",
  projectId: "",
  dueDate: "",
  notes: "",
  terms: "",
};

const initialItem: InvoiceItemForm = {
  description: "",
  quantity: "1",
  unitPrice: "",
  gstApplicable: true,
};

function money(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

export function NewInvoiceForm({ onSuccess, onCancel, projectId, projectName, customerId, customerName }: NewInvoiceFormProps) {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser().data;

  const [form, setForm] = useState<InvoiceFormState>({ ...initialFormState, projectId: projectId ?? "", customerId: customerId ?? "" });

  const [items, setItems] = useState<InvoiceItemForm[]>([{ ...initialItem }]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const customersQuery = useQuery({
    queryKey: ["customers", false],
    queryFn: () => getCustomers(false),
  });

  const projectsQuery = useQuery({
    queryKey: ["projects", undefined],
    queryFn: () => getProjects(),
  });

  const mutation = useMutation({
    mutationFn: createInvoice,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["invoices"] }),
        ...(projectId ? [queryClient.invalidateQueries({ queryKey: ["project-overview", projectId] })] : []),
        queryClient.invalidateQueries({ queryKey: ["business-overview"] }),
      ]);

      setForm(initialFormState);
      setItems([{ ...initialItem }]);
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

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateItem(
    index: number,
    field: keyof InvoiceItemForm,
    value: string,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [...current, { ...initialItem }]);
  }

  function removeItem(index: number) {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;

    const unitPrice = Number(item.unitPrice) || 0;

    return sum + quantity * unitPrice;
  }, 0);

  const taxableSubtotal = items.reduce((sum,item)=>sum+(item.gstApplicable?(Number(item.quantity)||0)*(Number(item.unitPrice)||0):0),0);
  const gstAmount = currentUser?.gstRegistered ? taxableSubtotal * 0.1 : 0;

  const totalAmount = subtotal + gstAmount;

  function validateForm(): string | null {
    if (form.title.trim().length < 2) {
      return "Invoice title must contain at least 2 characters.";
    }

    if (!form.customerId) {
      return "Please select a customer.";
    }

    for (const item of items) {
      if (!item.description.trim()) {
        return "Every invoice item needs a description.";
      }

      if (
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return "Every item quantity must be greater than 0.";
      }

      if (
        !Number.isFinite(Number(item.unitPrice)) ||
        Number(item.unitPrice) < 0
      ) {
        return "Every item needs a valid unit price.";
      }
    }

    return null;
  }

  function buildPayload(): CreateInvoiceInput {
    return {
      title: form.title.trim(),

      description: form.description.trim() || null,

      customerId: form.customerId,

      projectId: form.projectId || null,

      dueDate: form.dueDate
        ? new Date(`${form.dueDate}T23:59:59`).toISOString()
        : null,

      notes: form.notes.trim() || null,

      terms: form.terms.trim() || null,

      items: items.map((item, index) => ({
        description: item.description.trim(),

        quantity: Number(item.quantity),

        unitPrice: Number(item.unitPrice),

        gstApplicable: item.gstApplicable,

        sortOrder: index,
      })),
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
      <div className="space-y-6 p-6">
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
            Invoice title
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Bathroom Renovation Progress Invoice"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe what this invoice covers."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">Customer</label>

            {customerId ? <div className="mt-2 flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700">{customerName ?? "Project customer"}</div> : <select
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              className={inputClasses}
              required
            >
              <option value="">Select customer</option>

              {customersQuery.data?.data.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName}
                  {customer.businessName ? ` — ${customer.businessName}` : ""}
                </option>
              ))}
            </select>}
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

        <div>
          <label className="text-sm font-bold text-slate-700">Due date</label>

          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Invoice items
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Add labour, materials, subcontracting or other charges.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <Plus size={16} />
              Add item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const lineTotal =
                (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_120px_150px_130px_44px] lg:items-end">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Description
                      </label>

                      <input
                        value={item.description}
                        onChange={(event) =>
                          updateItem(index, "description", event.target.value)
                        }
                        placeholder="Electrical labour"
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Qty
                      </label>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(index, "quantity", event.target.value)
                        }
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Unit price
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) =>
                          updateItem(index, "unitPrice", event.target.value)
                        }
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Total
                      </p>

                      <p className="mt-3 font-bold text-slate-950">
                        {money(lineTotal)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Remove item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-600"><input type="checkbox" checked={item.gstApplicable} onChange={(event)=>setItems((current)=>current.map((entry,itemIndex)=>itemIndex===index?{...entry,gstApplicable:event.target.checked}:entry))} className="h-4 w-4 accent-amber-500"/>GST applies to this line when the business is GST registered</label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ml-auto max-w-sm rounded-xl bg-slate-950 p-5 text-white">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Subtotal</span>

              <span className="font-bold">{money(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-300">GST (10%)</span>

              <span className="font-bold">{money(gstAmount)}</span>
            </div>

            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>

                <span className="font-bold">{money(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Notes</label>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Thank you for your business."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Terms</label>

          <textarea
            name="terms"
            value={form.terms}
            onChange={handleChange}
            rows={3}
            placeholder="Payment due within 14 days."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={mutation.isPending}
          className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
        >
          {mutation.isPending && (
            <LoaderCircle size={18} className="animate-spin" />
          )}

          {mutation.isPending ? "Creating invoice..." : "Create invoice"}
        </button>
      </div>
    </form>
  );
}
