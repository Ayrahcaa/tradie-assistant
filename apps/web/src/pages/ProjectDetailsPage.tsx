import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  CircleDollarSign,
  MapPin,
  Pencil,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { useState } from "react";

import { getProject } from "../api/projects";
import type { ProjectStatus } from "../types/project";

import { EditProjectForm } from "../components/projects/EditProjectForm";
import { Modal } from "../components/ui/Modal";

function formatMoney(value: string | null): string {
  if (!value) {
    return "Not quoted";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function statusClasses(status: ProjectStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    case "ARCHIVED":
      return "bg-slate-200 text-slate-600";
  }
}

export function ProjectDetailsPage() {
  const [editOpen, setEditOpen] = useState(false);

  const { projectId } = useParams<{
    projectId: string;
  }>();

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId!),
    enabled: Boolean(projectId),
  });

  if (!projectId) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Invalid project ID.
      </div>
    );
  }

  if (projectQuery.isPending) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

        <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />

          <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  if (projectQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex gap-3">
          <CircleAlert
            size={22}
            className="mt-0.5 shrink-0"
          />

          <div>
            <h1 className="font-bold">
              Project could not be loaded
            </h1>

            <p className="mt-1 text-sm">
              {projectQuery.error.message}
            </p>

            <Link
              to="/projects"
              className="mt-4 inline-block text-sm font-bold underline"
            >
              Return to projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const project = projectQuery.data;

  return (
    <>
      <div className="mb-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          <ArrowLeft size={18} />
          Back to projects
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <span
              className={[
                "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                statusClasses(project.status),
              ].join(" ")}
            >
              {project.status}
            </span>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {project.name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
              {project.description ||
                "No project description has been added yet."}
            </p>
          </div>

          <button
  type="button"
  onClick={() => setEditOpen(true)}
  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300"
>
  <Pencil size={18} />
  Edit project
</button>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <UserRound size={20} />
          </span>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Customer
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {project.clientName || "Not assigned"}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <MapPin size={20} />
          </span>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Address
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {project.address || "Not provided"}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CalendarDays size={20} />
          </span>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Start date
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {formatDate(project.startDate)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <CircleDollarSign size={20} />
          </span>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Quoted value
          </p>

          <p className="mt-1 text-xl font-bold text-slate-950">
            {formatMoney(project.quotedValue)}
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Project timeline
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Start date
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {formatDate(project.startDate)}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Expected completion
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {formatDate(project.endDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Financial summary
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Expenses, invoices and profit will appear here once those modules
            are connected.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Revenue received
              </span>

              <span className="font-bold text-slate-900">
                $0.00
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Project expenses
              </span>

              <span className="font-bold text-slate-900">
                $0.00
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">
                  Current profit
                </span>

                <span className="font-bold text-slate-950">
                  $0.00
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Modal
  open={editOpen}
  title="Edit project"
  description="Update project information, dates, quoted value or status."
  onClose={() => setEditOpen(false)}
>
  <EditProjectForm
    project={project}
    onSuccess={() => setEditOpen(false)}
    onCancel={() => setEditOpen(false)}
  />
</Modal>
    </>
  );
}