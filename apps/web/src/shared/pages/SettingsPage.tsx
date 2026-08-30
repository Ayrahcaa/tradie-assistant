import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CircleAlert,
  Landmark,
  LoaderCircle,
  LogOut,
  Save,
} from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { logout, updateProfile } from "../../features/auth/api/auth";
import {
  authQueryKey,
  useCurrentUser,
} from "../../features/auth/hooks/useCurrentUser";
import { PageHeader } from "../components/ui/PageHeader";
const input =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
export function SettingsPage() {
  const query = useCurrentUser();
  const user = query.data!;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    firstName: user.firstName,
    lastName: user.lastName,
    businessName: user.businessName || "",
    abn: user.abn || "",
    phone: user.phone || "",
    address: user.address || "",
    tradeType: user.tradeType || "",
    gstRegistered: user.gstRegistered,
    businessStructure: user.businessStructure,
    gstAccountingMethod: user.gstAccountingMethod,
    basFrequency: user.basFrequency,
    taxProfile: user.taxProfile,
    taxFinancialYear: user.taxFinancialYear,
    otherTaxableIncome: String(user.otherTaxableIncome ?? 0),
    additionalDeductions: String(user.additionalDeductions ?? 0),
  }));
  const save = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      qc.setQueryData(authQueryKey, updated);
      void qc.invalidateQueries({ queryKey: ["business-overview"] });
      void qc.invalidateQueries({ queryKey: ["tax-summary"] });
    },
  });
  const signout = useMutation({
    mutationFn: logout,
    onSettled: () => {
      qc.clear();
      navigate("/login", { replace: true });
    },
  });
  function change(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;
    setForm((x) => ({ ...x, [name]: type === "checkbox" ? checked : value }));
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    save.mutate({
      ...form,
      businessName: form.businessName || null,
      abn: form.abn || null,
      phone: form.phone || null,
      address: form.address || null,
      tradeType: form.tradeType || null,
      otherTaxableIncome: Number(form.otherTaxableIncome),
      additionalDeductions: Number(form.additionalDeductions),
    });
  }
  return (
    <>
      <PageHeader
        eyebrow="Account and bookkeeping"
        title="Settings"
        description="Business identity, GST method, and optional tax-planning assumptions."
      />
      <form onSubmit={submit} className="space-y-6">
        <Section
          icon={Building2}
          title="Business profile"
          description="Shown in your workspace and shared document details."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={change}
            />
            <Field
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={change}
            />
          </div>
          <Field
            label="Business name"
            name="businessName"
            value={form.businessName}
            onChange={change}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="ABN" name="abn" value={form.abn} onChange={change} />
            <Field
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={change}
            />
          </div>
          <Field
            label="Business address"
            name="address"
            value={form.address}
            onChange={change}
          />
          <Select
            label="Business structure"
            name="businessStructure"
            value={form.businessStructure}
            onChange={change}
            options={[
              ["SOLE_TRADER", "Sole trader"],
              ["COMPANY", "Company"],
              ["PARTNERSHIP", "Partnership"],
              ["TRUST", "Trust"],
              ["OTHER", "Other"],
            ]}
          />
        </Section>
        <Section
          icon={Landmark}
          title="GST and BAS settings"
          description="These settings control invoice GST and the timing used in GST estimates."
        >
          <label className="flex items-start gap-3 rounded-xl border p-4">
            <input
              type="checkbox"
              name="gstRegistered"
              checked={form.gstRegistered}
              onChange={change}
              className="mt-1 h-4 w-4 accent-amber-500"
            />
            <span>
              <strong className="block text-sm">Registered for GST</strong>
              <span className="mt-1 block text-xs text-slate-500">
                When off, new invoices do not charge GST and credits are not
                claimed.
              </span>
            </span>
          </label>
          {form.gstRegistered && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="GST accounting method"
                name="gstAccountingMethod"
                value={form.gstAccountingMethod}
                onChange={change}
                options={[
                  ["CASH", "Cash"],
                  ["ACCRUAL", "Accrual / non-cash"],
                ]}
              />
              <Select
                label="BAS reporting frequency"
                name="basFrequency"
                value={form.basFrequency}
                onChange={change}
                options={[
                  ["MONTHLY", "Monthly"],
                  ["QUARTERLY", "Quarterly"],
                  ["ANNUALLY", "Annually"],
                ]}
              />
            </div>
          )}
        </Section>
        <Section
          icon={Landmark}
          title="Income-tax planning"
          description="Optional calculator inputs, separate from bookkeeping transactions."
        >
          <Select
            label="Tax profile"
            name="taxProfile"
            value={form.taxProfile}
            onChange={change}
            options={[
              ["UNSPECIFIED", "Not selected — no estimate"],
              [
                "AUSTRALIAN_RESIDENT_INDIVIDUAL",
                "Australian resident individual",
              ],
              ["UNSUPPORTED", "Other / unsupported"],
            ]}
          />
          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              label="Configured financial year"
              name="taxFinancialYear"
              value={form.taxFinancialYear}
              onChange={change}
            />
            <Field
              label="Other taxable income"
              name="otherTaxableIncome"
              type="number"
              value={form.otherTaxableIncome}
              onChange={change}
            />
            <Field
              label="Additional deductions"
              name="additionalDeductions"
              type="number"
              value={form.additionalDeductions}
              onChange={change}
            />
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Selecting the resident profile is an explicit calculator assumption,
            not a determination of residency. The estimate excludes Medicare
            levy, offsets, HELP and circumstances not recorded here.
          </p>
        </Section>
        {save.isError && (
          <p className="flex gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <CircleAlert size={18} />
            Settings could not be saved.
          </p>
        )}
        {save.isSuccess && (
          <p className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            Settings saved.
          </p>
        )}
        <div className="flex justify-end">
          <button
            disabled={save.isPending}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold"
          >
            {save.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Save />
            )}
            Save settings
          </button>
        </div>
      </form>
      <section className="mt-10 border-t pt-6">
        <button
          onClick={() => {
            if (confirm("Sign out of Tradie Assistant?")) signout.mutate();
          }}
          className="inline-flex items-center gap-2 text-sm font-bold text-red-700"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </section>
    </>
  );
}
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="flex gap-3 border-b p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
          <Icon />
        </span>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}
function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        className={input}
        name={name}
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}
function Select({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options: string[][];
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <select className={input} name={name} value={value} onChange={onChange}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
