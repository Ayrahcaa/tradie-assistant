import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle, UserPlus } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { createProject, type CreateProjectInput } from "../api/projects";
import { getCustomers } from "../../customers/api/customers";
import { NewCustomerForm } from "../../customers/components/NewCustomerForm";
import { Modal } from "../../../shared/components/ui/Modal";

interface NewProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProjectFormState {
  name: string;
  description: string;
  customerId: string;
  address: string;
  quotedValue: string;
  startDate: string;
  endDate: string;
}

const initialFormState: ProjectFormState = {
  name: "",
  description: "",
  customerId: "",
  address: "",
  quotedValue: "",
  startDate: "",
  endDate: "",
};

export function NewProjectForm({ onSuccess, onCancel }: NewProjectFormProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ProjectFormState>(initialFormState);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);

  const customersQuery = useQuery({
    queryKey: ["customers", false],
    queryFn: () => getCustomers(false),
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

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

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function buildPayload(): CreateProjectInput {
    return {
      name: form.name.trim(),

      description: form.description.trim() || null,

      customerId: form.customerId || null,

      address: form.address.trim() || null,

      quotedValue: form.quotedValue === "" ? null : Number(form.quotedValue),

      status: "ACTIVE",

      startDate: form.startDate
        ? new Date(`${form.startDate}T09:00:00`).toISOString()
        : null,

      endDate: form.endDate
        ? new Date(`${form.endDate}T17:00:00`).toISOString()
        : null,
    };
  }

  function validateForm(): string | null {
    if (form.name.trim().length < 2) {
      return "Project name must contain at least 2 characters.";
    }

    if (
      form.quotedValue !== "" &&
      (!Number.isFinite(Number(form.quotedValue)) ||
        Number(form.quotedValue) < 0)
    ) {
      return "Quoted value must be a valid positive amount.";
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      return "End date cannot be before the start date.";
    }

    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setValidationError(null);
    createProjectMutation.reset();

    const error = validateForm();

    if (error) {
      setValidationError(error);
      return;
    }

    createProjectMutation.mutate(buildPayload());
  }

  const inputClasses =
    "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <>
    <form onSubmit={handleSubmit}>
      <div className="space-y-5 p-6">
        {(validationError || createProjectMutation.isError) && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <CircleAlert size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm font-medium">
              {validationError ?? createProjectMutation.error?.message}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="project-name"
            className="text-sm font-bold text-slate-700"
          >
            Project name
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            id="project-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Smith Bathroom Renovation"
            className={inputClasses}
            maxLength={120}
            autoFocus
            required
          />
        </div>

        <div>
          <label
            htmlFor="project-description"
            className="text-sm font-bold text-slate-700"
          >
            Description
          </label>

          <textarea
            id="project-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the work included in this project."
            rows={4}
            maxLength={500}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="customerId"
              className="text-sm font-bold text-slate-700"
            >
              Customer
            </label>

            <select
              id="customerId"
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">No customer selected</option>

              {customersQuery.data?.data.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName}
                  {customer.businessName ? ` — ${customer.businessName}` : ""}
                </option>
              ))}
            </select>

            {customersQuery.isPending && (
              <p className="mt-2 text-xs text-slate-500">
                Loading customers...
              </p>
            )}

            {customersQuery.isError && (
              <p className="mt-2 text-xs font-medium text-red-600">
                Unable to load customers.
              </p>
            )}
            <button type="button" onClick={() => setNewCustomerOpen(true)} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-amber-800 hover:text-amber-950"><UserPlus size={17}/>Create new customer</button>
          </div>

          <div>
            <label
              htmlFor="quoted-value"
              className="text-sm font-bold text-slate-700"
            >
              Quoted value
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-sm font-semibold text-slate-400">
                $
              </span>

              <input
                id="quoted-value"
                name="quotedValue"
                type="number"
                min="0"
                step="0.01"
                value={form.quotedValue}
                onChange={handleChange}
                placeholder="18500.00"
                className={`${inputClasses} pl-8`}
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="project-address"
            className="text-sm font-bold text-slate-700"
          >
            Project address
          </label>

          <input
            id="project-address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="24 King Street, Adelaide SA 5000"
            className={inputClasses}
            maxLength={250}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="start-date"
              className="text-sm font-bold text-slate-700"
            >
              Start date
            </label>

            <input
              id="start-date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label
              htmlFor="end-date"
              className="text-sm font-bold text-slate-700"
            >
              Expected end date
            </label>

            <input
              id="end-date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              min={form.startDate || undefined}
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={createProjectMutation.isPending}
          className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={createProjectMutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createProjectMutation.isPending && (
            <LoaderCircle size={18} className="animate-spin" />
          )}

          {createProjectMutation.isPending
            ? "Creating project..."
            : "Create project"}
        </button>
      </div>
    </form>
    <Modal open={newCustomerOpen} title="Create customer" description="The new customer will be selected automatically for this project." onClose={() => setNewCustomerOpen(false)}>
      <NewCustomerForm onCancel={() => setNewCustomerOpen(false)} onSuccess={(customer) => { setForm((current) => ({ ...current, customerId: customer.id, address: current.address || customer.address || "" })); setNewCustomerOpen(false); }} />
    </Modal>
    </>
  );
}
