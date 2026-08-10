import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { createCustomer, type CreateCustomerInput } from "../api/customers";

interface NewCustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface CustomerFormState {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  abn: string;
  notes: string;
}

const initialState: CustomerFormState = {
  firstName: "",
  lastName: "",
  businessName: "",
  email: "",
  phone: "",
  address: "",
  abn: "",
  notes: "",
};

export function NewCustomerForm({ onSuccess, onCancel }: NewCustomerFormProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CustomerFormState>(initialState);

  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createCustomer,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      setForm(initialState);
      onSuccess();
    },
  });

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function buildPayload(): CreateCustomerInput {
    return {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      businessName: form.businessName.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      abn: form.abn.trim() || null,
      notes: form.notes.trim() || null,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setValidationError(null);
    mutation.reset();

    if (!form.firstName.trim()) {
      setValidationError("First name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      setValidationError("Last name is required.");
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

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">
              First name
            </label>

            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">
              Last name
            </label>

            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">
            Business name
          </label>

          <input
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">Email</label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Phone</label>

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Address</label>

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">ABN</label>

          <input
            name="abn"
            value={form.abn}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Notes</label>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
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

          {mutation.isPending ? "Creating..." : "Create customer"}
        </button>
      </div>
    </form>
  );
}
