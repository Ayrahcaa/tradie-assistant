import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import {
  updateProject,
  type UpdateProjectInput,
} from "../../api/projects";
import type {
  Project,
  ProjectStatus,
} from "../../types/project";

interface EditProjectFormProps {
  project: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProjectFormState {
  name: string;
  description: string;
  clientName: string;
  address: string;
  quotedValue: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
}

function toDateInput(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function EditProjectForm({
  project,
  onSuccess,
  onCancel,
}: EditProjectFormProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ProjectFormState>({
    name: project.name,
    description: project.description ?? "",
    clientName: project.clientName ?? "",
    address: project.address ?? "",
    quotedValue: project.quotedValue ?? "",
    status: project.status,
    startDate: toDateInput(project.startDate),
    endDate: toDateInput(project.endDate),
  });

  const [validationError, setValidationError] =
    useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (input: UpdateProjectInput) =>
      updateProject(project.id, input),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["project", project.id],
        }),

        queryClient.invalidateQueries({
          queryKey: ["projects"],
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

  function validateForm(): string | null {
    if (form.name.trim().length < 2) {
      return "Project name must contain at least 2 characters.";
    }

    if (
      form.quotedValue !== "" &&
      Number(form.quotedValue) < 0
    ) {
      return "Quoted value cannot be negative.";
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

  function buildPayload(): UpdateProjectInput {
    return {
      name: form.name.trim(),
      description: form.description.trim() || null,
      clientName: form.clientName.trim() || null,
      address: form.address.trim() || null,

      quotedValue:
        form.quotedValue === ""
          ? null
          : Number(form.quotedValue),

      status: form.status,

      startDate: form.startDate
        ? new Date(`${form.startDate}T09:00:00`).toISOString()
        : null,

      endDate: form.endDate
        ? new Date(`${form.endDate}T17:00:00`).toISOString()
        : null,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setValidationError(null);
    updateMutation.reset();

    const error = validateForm();

    if (error) {
      setValidationError(error);
      return;
    }

    updateMutation.mutate(buildPayload());
  }

  const inputClasses =
    "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5 p-6">
        {(validationError || updateMutation.isError) && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <CircleAlert
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-medium">
              {validationError ??
                updateMutation.error?.message}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="edit-project-name"
            className="text-sm font-bold text-slate-700"
          >
            Project name
          </label>

          <input
            id="edit-project-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="text-sm font-bold text-slate-700"
          >
            Description
          </label>

          <textarea
            id="edit-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit-client"
              className="text-sm font-bold text-slate-700"
            >
              Customer name
            </label>

            <input
              id="edit-client"
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="text-sm font-bold text-slate-700"
            >
              Status
            </label>

            <select
              id="edit-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="ACTIVE">
                Active
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="ARCHIVED">
                Archived
              </option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="edit-address"
            className="text-sm font-bold text-slate-700"
          >
            Project address
          </label>

          <input
            id="edit-address"
            name="address"
            value={form.address}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="edit-value"
            className="text-sm font-bold text-slate-700"
          >
            Quoted value
          </label>

          <input
            id="edit-value"
            name="quotedValue"
            type="number"
            min="0"
            step="0.01"
            value={form.quotedValue}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit-start"
              className="text-sm font-bold text-slate-700"
            >
              Start date
            </label>

            <input
              id="edit-start"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label
              htmlFor="edit-end"
              className="text-sm font-bold text-slate-700"
            >
              End date
            </label>

            <input
              id="edit-end"
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
          disabled={updateMutation.isPending}
          className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
        >
          {updateMutation.isPending && (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          )}

          {updateMutation.isPending
            ? "Saving..."
            : "Save changes"}
        </button>
      </div>
    </form>
  );
}