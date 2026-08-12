import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { getCustomers } from "../../customers/api/customers";
import { getProjects } from "../../projects/api/projects";

import { updateQuote, type UpdateQuoteInput } from "../api/quotes";
import type { Quote } from "../types/quote";

interface EditQuoteFormProps {
  quote: Quote;
  onSuccess: () => void;
  onCancel: () => void;
}

interface QuoteItemForm {
  description: string;
  quantity: string;
  unitPrice: string;
}

interface QuoteFormState {
  title: string;
  description: string;
  customerId: string;
  projectId: string;
  expiryDate: string;
  notes: string;
  terms: string;
}

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function money(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

export function EditQuoteForm({
  quote,
  onSuccess,
  onCancel,
}: EditQuoteFormProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<QuoteFormState>({
    title: quote.title,
    description: quote.description ?? "",
    customerId: quote.customerId,
    projectId: quote.projectId ?? "",
    expiryDate: toDateInput(quote.expiryDate),
    notes: quote.notes ?? "",
    terms: quote.terms ?? "",
  });

  const [items, setItems] = useState<QuoteItemForm[]>(
    quote.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  );

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
    mutationFn: (input: UpdateQuoteInput) => updateQuote(quote.id, input),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["quote", quote.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["quotes"],
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

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateItem(
    index: number,
    field: keyof QuoteItemForm,
    value: string,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        description: "",
        quantity: "1",
        unitPrice: "",
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }, 0);

  const gstAmount = subtotal * 0.1;
  const totalAmount = subtotal + gstAmount;

  function validateForm(): string | null {
    if (form.title.trim().length < 2) {
      return "Quote title must contain at least 2 characters.";
    }

    if (!form.customerId) {
      return "Please select a customer.";
    }

    for (const item of items) {
      if (!item.description.trim()) {
        return "Every quote item needs a description.";
      }

      if (Number(item.quantity) <= 0) {
        return "Every quantity must be greater than 0.";
      }

      if (Number(item.unitPrice) < 0) {
        return "Unit price cannot be negative.";
      }
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
      title: form.title.trim(),
      description: form.description.trim() || null,
      customerId: form.customerId,
      projectId: form.projectId || null,
      expiryDate: form.expiryDate
        ? new Date(`${form.expiryDate}T23:59:59`).toISOString()
        : null,
      notes: form.notes.trim() || null,
      terms: form.terms.trim() || null,
      items: items.map((item, index) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        sortOrder: index,
      })),
    });
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
            Quote title
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className={inputClasses}
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
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">Customer</label>

            <select
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              className={inputClasses}
            >
              {customersQuery.data?.data.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName}
                </option>
              ))}
            </select>
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

        <div>
          <label className="text-sm font-bold text-slate-700">
            Expiry date
          </label>

          <input
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <div className="mb-3 flex justify-between">
            <h3 className="text-sm font-bold text-slate-800">Quote items</h3>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold"
            >
              <Plus size={16} />
              Add item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_120px_150px_130px_44px] lg:items-end">
                  <input
                    value={item.description}
                    onChange={(event) =>
                      updateItem(index, "description", event.target.value)
                    }
                    className={inputClasses}
                  />

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, "quantity", event.target.value)
                    }
                    className={inputClasses}
                  />

                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(index, "unitPrice", event.target.value)
                    }
                    className={inputClasses}
                  />

                  <p className="font-bold">
                    {money(Number(item.quantity) * Number(item.unitPrice))}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ml-auto max-w-sm rounded-xl bg-slate-950 p-5 text-white">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>

          <div className="mt-2 flex justify-between">
            <span>GST</span>
            <strong>{money(gstAmount)}</strong>
          </div>

          <div className="mt-3 flex justify-between border-t border-slate-700 pt-3">
            <strong>Total</strong>
            <strong>{money(totalAmount)}</strong>
          </div>
        </div>

        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes"
          rows={3}
          className="w-full rounded-xl border border-slate-200 p-3"
        />

        <textarea
          name="terms"
          value={form.terms}
          onChange={handleChange}
          placeholder="Terms"
          rows={3}
          className="w-full rounded-xl border border-slate-200 p-3"
        />
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
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 font-bold"
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
