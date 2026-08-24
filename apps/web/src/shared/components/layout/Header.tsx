import { Bell, Menu, Search } from "lucide-react";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";

interface HeaderProps {
  onOpenMenu: () => void;
}

export function Header({
  onOpenMenu,
}: HeaderProps) {
  const user = useCurrentUser().data;
  const initials = `${user?.firstName.charAt(0) ?? ""}${user?.lastName.charAt(0) ?? ""}`.toUpperCase();
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
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
          placeholder="Search projects, invoices and receipts..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
        />
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

        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold text-slate-900">
            {user?.firstName} {user?.lastName}
          </p>

          <p className="text-xs text-slate-500">
            {user?.businessName || user?.tradeType || "Sole trader"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
          {initials || "TA"}
        </div>
      </div>
    </header>
  );
}
