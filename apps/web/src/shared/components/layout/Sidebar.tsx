import {
  Bot,
  BriefcaseBusiness,
  Building2,
  FileText,
  FolderKanban,
  Gauge,
  HandCoins,
  Landmark,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { NavLink } from "react-router";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../../../features/auth/api/auth";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { label: "Overview", items: [{ label: "Dashboard", path: "/", icon: Gauge }] },
  { label: "Work", items: [{ label: "Projects", path: "/projects", icon: FolderKanban }, { label: "Customers", path: "/customers", icon: Users }] },
  { label: "Sales", items: [{ label: "Quotes", path: "/quotes", icon: FileText }, { label: "Invoices", path: "/invoices", icon: HandCoins }] },
  { label: "Money", items: [{ label: "Expenses", path: "/expenses", icon: WalletCards }, { label: "Outstanding", path: "/outstanding", icon: Landmark }, { label: "Financial overview", path: "/finances", icon: HandCoins }] },
  { label: "People & tools", items: [{ label: "Subcontractors", path: "/subcontractors", icon: BriefcaseBusiness }, { label: "Receipts", path: "/receipts", icon: ReceiptText }, { label: "AI Assistant", path: "/assistant", icon: Bot }] },
];

export function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const user = useCurrentUser().data;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logoutMutation = useMutation({ mutationFn: logout, onSettled: () => { queryClient.clear(); onClose(); navigate("/login", { replace: true }); } });
  const initials = `${user?.firstName.charAt(0) ?? ""}${user?.lastName.charAt(0) ?? ""}`.toUpperCase();
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col",
          "border-r border-slate-200 bg-white",
          "transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <NavLink
            to="/"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
              <Building2 size={24} strokeWidth={2.2} />
            </span>

            <span>
              <span className="block text-lg font-bold text-slate-950">
                Tradie Assistant
              </span>

              <span className="block text-xs font-medium text-slate-500">
                Business made simple
              </span>
            </span>
          </NavLink>

          <button type="button" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
            <LogOut size={20} />
            {logoutMutation.isPending ? "Logging out…" : "Log out"}
          </button>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-5">
            {navigation.map((section) => <div key={section.label}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{section.label}</p>
              <div className="space-y-1">{section.items.map((item) => { const Icon = item.icon; return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-3",
                      "text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-slate-950 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                    ].join(" ")
                  }
                >
                  <Icon size={20} />
                  {item.label}
                </NavLink>
              ); })}</div>
            </div>)}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            <Settings size={20} />
            Settings
          </NavLink>

          <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-100 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-950">
              {initials || "TA"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.businessName || user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export { Menu };
