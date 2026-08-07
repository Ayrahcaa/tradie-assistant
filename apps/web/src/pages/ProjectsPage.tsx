import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  CircleAlert,
  FolderPlus,
  MapPin,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { getProjects } from "../api/projects";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import type {
  Project,
  ProjectStatus,
} from "../types/project";
import { NewProjectForm } from "../components/projects/NewProjectForm";
import { Modal } from "../components/ui/Modal";

type ProjectFilter = "ALL" | ProjectStatus;

const filters: ProjectFilter[] = [
  "ALL",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
];



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
    month: "short",
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

function ProjectCard({
  project,
}: {
  project: Project;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-bold",
            statusClasses(project.status),
          ].join(" ")}
        >
          {project.status}
        </span>

        <Link
          to={`/projects/${project.id}`}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={`Project options for ${project.name}`}
        >
          <MoreHorizontal size={19} />
        </Link>
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-950">
        {project.name}
      </h2>

      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
        {project.description || "No description provided."}
      </p>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <UserRound
            size={17}
            className="shrink-0 text-slate-400"
          />

          <span className="truncate">
            {project.clientName || "No customer assigned"}
          </span>
        </div>

         <div className="flex items-center gap-3 text-sm text-slate-600">
          <MapPin
            size={17}
            className="shrink-0 text-slate-400"
          />

          <span className="truncate">
            {project.address || "No address provided"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-600">
          <CalendarDays
            size={17}
            className="shrink-0 text-slate-400"
          />

          <span>
            {formatDate(project.startDate)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between rounded-xl bg-slate-50 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Quoted value
          </p>

          <p className="mt-1 text-lg font-bold text-slate-950">
            {formatMoney(project.quotedValue)}
          </p>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="text-sm font-bold text-slate-700 hover:text-slate-950"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

export function ProjectsPage() {
  const [filter, setFilter] =
    useState<ProjectFilter>("ALL");

  const [newProjectOpen, setNewProjectOpen] =
    useState(false);

  const status =
    filter === "ALL" ? undefined : filter;

  const projectsQuery = useQuery({
    queryKey: ["projects", status],
    queryFn: () => getProjects(status),
  });

  return (
    <>
      <PageHeader
        eyebrow="Project management"
        title="Projects"
        description="Manage jobs, customers, dates and quoted values from one place."
        action={
         <button
  type="button"
  onClick={() => setNewProjectOpen(true)}
  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
>
  <FolderPlus size={19} />
  New project
</button>
        }
      />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={[
              "shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition",
              filter === item
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            {item === "ALL" ? "All projects" : item}
          </button>
        ))}
      </div>

      {projectsQuery.isPending && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {projectsQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="flex items-start gap-3">
            <CircleAlert
              size={22}
              className="mt-0.5 shrink-0"
            />

            <div>
              <h2 className="font-bold">
                Projects could not be loaded
              </h2>

              <p className="mt-1 text-sm">
                {projectsQuery.error.message}
              </p>

              <button
                type="button"
                onClick={() => projectsQuery.refetch()}
                className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {projectsQuery.isSuccess &&
        projectsQuery.data.data.length === 0 && (
          <EmptyState
            title="No projects found"
            description={
              filter === "ALL"
                ? "Create your first project to begin tracking customers, expenses and profit."
                : `There are no ${filter.toLowerCase()} projects.`
            }
          />
        )}

      {projectsQuery.isSuccess &&
        projectsQuery.data.data.length > 0 && (
          <>
            <p className="mb-4 text-sm font-semibold text-slate-500">
              {projectsQuery.data.count}{" "}
              {projectsQuery.data.count === 1
                ? "project"
                : "projects"}
            </p>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projectsQuery.data.data.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          </>
        )}
        <Modal
  open={newProjectOpen}
  title="Create a new project"
  description="Add the project details now. Expenses and invoices can be linked later."
  onClose={() => setNewProjectOpen(false)}
>
  <NewProjectForm
    onSuccess={() => setNewProjectOpen(false)}
    onCancel={() => setNewProjectOpen(false)}
  />
</Modal>
    </>
  );
}
