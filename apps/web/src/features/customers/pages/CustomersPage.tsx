import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CircleAlert,
  Mail,
  MapPin,
  Phone,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { getCustomers } from "../api/customers";
import { NewCustomerForm } from "../components/NewCustomerForm";
import type { Customer } from "../types/customer";

import { EmptyState } from "../../../shared/components/ui/EmptyState";
import { Modal } from "../../../shared/components/ui/Modal";
import { PageHeader } from "../../../shared/components/ui/PageHeader";

function CustomerCard({ customer }: { customer: Customer }) {
  const fullName = `${customer.firstName} ${customer.lastName}`;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700">
          {customer.firstName.charAt(0)}
          {customer.lastName.charAt(0)}
        </div>

        {customer.isArchived && (
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
            ARCHIVED
          </span>
        )}
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-950">{fullName}</h2>

      <p className="mt-1 text-sm text-slate-500">
        {customer.businessName || "Residential customer"}
      </p>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Mail size={17} className="text-slate-400" />
          <span className="truncate">{customer.email || "No email"}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Phone size={17} className="text-slate-400" />
          <span>{customer.phone || "No phone"}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-600">
          <MapPin size={17} className="text-slate-400" />
          <span className="truncate">{customer.address || "No address"}</span>
        </div>

        {customer.businessName && (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Building2 size={17} className="text-slate-400" />
            <span>{customer.businessName}</span>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          to={`/customers/${customer.id}`}
          className="text-sm font-bold text-slate-700 hover:text-slate-950"
        >
          View customer
        </Link>
      </div>
    </article>
  );
}

export function CustomersPage() {
  const [includeArchived, setIncludeArchived] = useState(false);

  const [newCustomerOpen, setNewCustomerOpen] = useState(false);

  const customersQuery = useQuery({
    queryKey: ["customers", includeArchived],
    queryFn: () => getCustomers(includeArchived),
  });

  return (
    <>
      <PageHeader
        eyebrow="Customer management"
        title="Customers"
        description="Keep customer contact details, business information and project history organised."
        action={
          <button
            type="button"
            onClick={() => setNewCustomerOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300"
          >
            <UserPlus size={18} />
            New customer
          </button>
        }
      />

      <div className="mb-6">
        <button
          type="button"
          onClick={() => setIncludeArchived((current) => !current)}
          className={[
            "rounded-xl px-4 py-2.5 text-sm font-bold",
            includeArchived
              ? "bg-slate-950 text-white"
              : "border border-slate-200 bg-white text-slate-600",
          ].join(" ")}
        >
          {includeArchived ? "Showing archived customers" : "Include archived"}
        </button>
      </div>

      {customersQuery.isPending && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {customersQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="flex gap-3">
            <CircleAlert size={21} />

            <p className="text-sm font-medium">
              {customersQuery.error.message}
            </p>
          </div>
        </div>
      )}

      {customersQuery.isSuccess && customersQuery.data.data.length === 0 && (
        <EmptyState
          title="No customers found"
          description="Create your first customer so projects, quotes and invoices can be linked to the right person."
        />
      )}

      {customersQuery.isSuccess && customersQuery.data.data.length > 0 && (
        <>
          <p className="mb-4 text-sm font-semibold text-slate-500">
            {customersQuery.data.count} customers
          </p>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {customersQuery.data.data.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        </>
      )}

      <Modal
        open={newCustomerOpen}
        title="Create customer"
        description="Add the customer details now. Projects and invoices can be linked later."
        onClose={() => setNewCustomerOpen(false)}
      >
        <NewCustomerForm
          onSuccess={() => setNewCustomerOpen(false)}
          onCancel={() => setNewCustomerOpen(false)}
        />
      </Modal>
    </>
  );
}
