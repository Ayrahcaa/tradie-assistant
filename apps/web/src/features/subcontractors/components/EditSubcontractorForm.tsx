import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

import {
  updateSubcontractor,
  type UpdateSubcontractorInput,
} from "../api/subcontractors";

import type { Subcontractor } from "../types/subcontractor";

interface EditSubcontractorFormProps {
  subcontractor: Subcontractor;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditSubcontractorForm({
  subcontractor,
  onSuccess,
  onCancel,
}: EditSubcontractorFormProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    firstName: subcontractor.firstName,

    lastName: subcontractor.lastName ?? "",

    businessName: subcontractor.businessName ?? "",

    abn: subcontractor.abn ?? "",

    email: subcontractor.email ?? "",

    phone: subcontractor.phone ?? "",

    address: subcontractor.address ?? "",

    notes: subcontractor.notes ?? "",
  });

  const mutation = useMutation({
    mutationFn: (input: UpdateSubcontractorInput) =>
      updateSubcontractor(subcontractor.id, input),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["subcontractor", subcontractor.id],
        }),

        queryClient.invalidateQueries({
          queryKey: ["subcontractors"],
        }),
      ]);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    mutation.mutate({
      firstName: form.firstName.trim(),

      lastName: form.lastName.trim() || null,

      businessName: form.businessName.trim() || null,

      abn: form.abn.trim() || null,

      email: form.email.trim() || null,

      phone: form.phone.trim() || null,

      address: form.address.trim() || null,

      notes: form.notes.trim() || null,
    });
  }

  const inputClasses =
    "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5 p-6">
        {mutation.isError && (
          <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <CircleAlert size={20} />

            <p className="text-sm font-medium">{mutation.error.message}</p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First name"
            className={inputClasses}
          />

          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last name"
            className={inputClasses}
          />
        </div>

        <input
          name="businessName"
          value={form.businessName}
          onChange={handleChange}
          placeholder="Business name"
          className={inputClasses}
        />

        <input
          name="abn"
          value={form.abn}
          onChange={handleChange}
          placeholder="ABN"
          className={inputClasses}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={inputClasses}
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className={inputClasses}
          />
        </div>

        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          className={inputClasses}
        />

        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Notes"
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
