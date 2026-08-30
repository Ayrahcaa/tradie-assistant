import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { logout } from "../../../features/auth/api/auth";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";

interface HeaderProps {
  onOpenMenu: () => void;
}

export function Header({ onOpenMenu }: HeaderProps) {
  const user = useCurrentUser().data;
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
  });
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const initials =
    `${user?.firstName.charAt(0) ?? ""}${user?.lastName.charAt(0) ?? ""}`.toUpperCase();
  return (
    <header className="sticky top-0 z-20 flex h-18 items-center gap-4 border-b border-slate-200 bg-slate-50/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={21} />
      </button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Jump to projects, invoices, receipts..."
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        {search && (
          <div className="absolute inset-x-0 top-12 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            {[
              { label: "Projects", to: "/projects" },
              { label: "Customers", to: "/customers" },
              { label: "Quotes", to: "/quotes" },
              { label: "Invoices", to: "/invoices" },
              { label: "Expenses", to: "/expenses" },
              { label: "Receipts", to: "/receipts" },
              { label: "Subcontractors", to: "/subcontractors" },
              { label: "Reports", to: "/finances" },
            ]
              .filter((item) =>
                item.label.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSearch("")}
                  className="block rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-slate-950"
                >
                  Go to {item.label}
                </Link>
              ))}
            {![
              "projects",
              "customers",
              "quotes",
              "invoices",
              "expenses",
              "receipts",
              "subcontractors",
              "reports",
            ].some((item) => item.includes(search.toLowerCase())) && (
              <p className="px-3 py-2 text-sm text-slate-500">
                No matching area
              </p>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((value) => !value)}
            className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#152238] text-sm font-bold text-white">
              {initials || "TA"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-slate-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="max-w-36 truncate text-xs text-slate-500">
                {user?.businessName || user?.tradeType || "Sole trader"}
              </p>
            </div>
            <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2 sm:hidden">
                <p className="font-bold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Settings size={18} />
                Business settings
              </Link>
              <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                <LogOut size={18} />
                {logoutMutation.isPending ? "Signing out…" : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
