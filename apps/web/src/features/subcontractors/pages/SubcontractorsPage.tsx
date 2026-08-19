import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, CircleAlert, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { getSubcontractors } from "../api/subcontractors";

import { NewSubcontractorForm } from "../components/NewSubcontractorForm";

import type { Subcontractor } from "../types/subcontractor";

import { EmptyState } from "../../../shared/components/ui/EmptyState";

import { Modal } from "../../../shared/components/ui/Modal";

import { PageHeader } from "../../../shared/components/ui/PageHeader";

function fullName(subcontractor: Subcontractor): string {
  return [subcontractor.firstName, subcontractor.lastName]
    .filter(Boolean)
    .join(" ");
}

function SubcontractorCard({
  subcontractor,
}: {
  subcontractor: Subcontractor;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <BriefcaseBusiness size={20} />
        </div>

        {subcontractor.isArchived && (
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
            ARCHIVED
          </span>
        )}
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-950">
        {fullName(subcontractor)}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {subcontractor.businessName || "Independent subcontractor"}
      </p>

      <div className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm">
        <p className="text-slate-600">
          <span className="font-semibold">Phone:</span>{" "}
          {subcontractor.phone || "Not provided"}
        </p>

        <p className="truncate text-slate-600">
          <span className="font-semibold">Email:</span>{" "}
          {subcontractor.email || "Not provided"}
        </p>

        <p className="text-slate-600">
          <span className="font-semibold">ABN:</span>{" "}
          {subcontractor.abn || "Not provided"}
        </p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          to={`/subcontractors/${subcontractor.id}`}
          className="text-sm font-bold text-slate-700 hover:text-slate-950"
        >
          View subcontractor
        </Link>
      </div>
    </article>
  );
}

export function SubcontractorsPage() {
  const [includeArchived, setIncludeArchived] = useState(false);

  const [newSubcontractorOpen, setNewSubcontractorOpen] = useState(false);

  const subcontractorsQuery = useQuery({
    queryKey: ["subcontractors", includeArchived],

    queryFn: () => getSubcontractors(includeArchived),
  });

  return (
    <>
      <PageHeader
        eyebrow="Workforce"
        title="Subcontractors"
        description="Manage subcontractors, their contact information and business details."
        action={
          <button
            type="button"
            onClick={() => setNewSubcontractorOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300"
          >
            <Plus size={18} />
            New subcontractor
          </button>
        }
      />

      <div className="mb-6">
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(event) => setIncludeArchived(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Include archived
        </label>
      </div>

      {subcontractorsQuery.isPending && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {subcontractorsQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="flex gap-3">
            <CircleAlert size={21} />

            <p className="text-sm font-medium">
              {subcontractorsQuery.error.message}
            </p>
          </div>
        </div>
      )}

      {subcontractorsQuery.isSuccess &&
        subcontractorsQuery.data.data.length === 0 && (
          <EmptyState
            title="No subcontractors found"
            description="Add your first subcontractor to begin tracking people you hire for projects."
          />
        )}

      {subcontractorsQuery.isSuccess &&
        subcontractorsQuery.data.data.length > 0 && (
          <>
            <p className="mb-4 text-sm font-semibold text-slate-500">
              {subcontractorsQuery.data.count} subcontractors
            </p>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {subcontractorsQuery.data.data.map((subcontractor) => (
                <SubcontractorCard
                  key={subcontractor.id}
                  subcontractor={subcontractor}
                />
              ))}
            </div>
          </>
        )}

      <Modal
        open={newSubcontractorOpen}
        title="New subcontractor"
        description="Add a subcontractor to your business records."
        onClose={() => setNewSubcontractorOpen(false)}
      >
        <NewSubcontractorForm
          onSuccess={() => setNewSubcontractorOpen(false)}
          onCancel={() => setNewSubcontractorOpen(false)}
        />
      </Modal>
    </>
  );
}
