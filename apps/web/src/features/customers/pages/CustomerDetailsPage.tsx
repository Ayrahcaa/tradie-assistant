import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ArrowLeft,
  Building2,
  CircleAlert,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RotateCcw,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import {
  archiveCustomer,
  deleteCustomer,
  getCustomer,
  restoreCustomer,
} from "../api/customers";
import { EditCustomerForm } from "../components/EditCustomerForm";

import { Modal } from "../../../shared/components/ui/Modal";

export function CustomerDetailsPage() {
  const { customerId } = useParams<{
    customerId: string;
  }>();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);

  const [archiveOpen, setArchiveOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const customerQuery = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer(customerId!),
    enabled: Boolean(customerId),
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveCustomer(customerId!),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["customer", customerId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["customers"],
        }),
      ]);

      setArchiveOpen(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: () => restoreCustomer(customerId!),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["customer", customerId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["customers"],
        }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCustomer(customerId!),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      navigate("/customers");
    },
  });

  if (!customerId) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Invalid customer ID.
      </div>
    );
  }

  if (customerQuery.isPending) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

        <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (customerQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex gap-3">
          <CircleAlert size={22} />

          <div>
            <h1 className="font-bold">Customer could not be loaded</h1>

            <p className="mt-1 text-sm">{customerQuery.error.message}</p>

            <Link
              to="/customers"
              className="mt-4 inline-block text-sm font-bold underline"
            >
              Return to customers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const customer = customerQuery.data;

  const fullName = `${customer.firstName} ${customer.lastName}`;

  return (
    <>
      <div className="mb-6">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          <ArrowLeft size={18} />
          Back to customers
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-lg font-bold text-amber-800">
                {customer.firstName.charAt(0)}
                {customer.lastName.charAt(0)}
              </span>

              {customer.isArchived && (
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                  ARCHIVED
                </span>
              )}
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-950 sm:text-3xl">
              {fullName}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {customer.businessName || "Residential customer"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300"
          >
            <Pencil size={18} />
            Edit customer
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Mail size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Email
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {customer.email || "Not provided"}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Phone size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Phone
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {customer.phone || "Not provided"}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <MapPin size={20} className="text-slate-500" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Address
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {customer.address || "Not provided"}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {customer.businessName ? (
            <Building2 size={20} className="text-slate-500" />
          ) : (
            <UserRound size={20} className="text-slate-500" />
          )}

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            ABN
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {customer.abn || "Not provided"}
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Notes</h2>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {customer.notes || "No notes have been added for this customer."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Customer actions</h2>

          <p className="mt-2 text-sm text-slate-500">
            Archive customers you no longer actively work with.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {customer.isArchived ? (
              <button
                type="button"
                onClick={() => restoreMutation.mutate()}
                disabled={restoreMutation.isPending}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-700"
              >
                <RotateCcw size={18} />
                Restore customer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setArchiveOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-bold text-amber-800"
              >
                <Archive size={18} />
                Archive
              </button>
            )}

            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </section>

      <Modal
        open={editOpen}
        title="Edit customer"
        description="Update contact details and customer information."
        onClose={() => setEditOpen(false)}
      >
        <EditCustomerForm
          customer={customer}
          onSuccess={() => setEditOpen(false)}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <Modal
        open={archiveOpen}
        title="Archive customer"
        description="The customer remains in your records but will be hidden from the default list."
        onClose={() => setArchiveOpen(false)}
      >
        <div className="p-6">
          <p className="text-sm leading-6 text-slate-600">
            Archive <strong>{fullName}</strong>?
          </p>

          {archiveMutation.isError && (
            <p className="mt-4 text-sm font-medium text-red-700">
              {archiveMutation.error.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={() => setArchiveOpen(false)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => archiveMutation.mutate()}
            disabled={archiveMutation.isPending}
            className="h-11 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 disabled:opacity-50"
          >
            {archiveMutation.isPending ? "Archiving..." : "Archive customer"}
          </button>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        title="Delete customer permanently"
        description="This action cannot be undone."
        onClose={() => setDeleteOpen(false)}
      >
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm leading-6 text-red-800">
              You are about to permanently delete <strong>{fullName}</strong>.
            </p>
          </div>

          {deleteMutation.isError && (
            <p className="mt-4 text-sm font-medium text-red-700">
              {deleteMutation.error.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="h-11 rounded-xl bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </Modal>
    </>
  );
}
