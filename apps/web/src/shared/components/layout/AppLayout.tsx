import { useState } from "react";
import {
  FilePlus2,
  FolderKanban,
  Home,
  Menu,
  Plus,
  ReceiptText,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        <Header onOpenMenu={() => setSidebarOpen(true)} />

        <main className="mx-auto max-w-[1600px] p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-2xl border border-slate-200 bg-white/95 px-2 py-2 shadow-2xl backdrop-blur lg:hidden"
      >
        <MobileLink to="/" label="Home" icon={Home} />
        <MobileLink to="/projects" label="Projects" icon={FolderKanban} />
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="-mt-6 flex flex-col items-center gap-1 text-xs font-bold text-slate-800"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/25">
            <Plus size={25} />
          </span>
          Add
        </button>
        <MobileLink to="/invoices" label="Invoices" icon={FilePlus2} />
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center gap-1 rounded-xl py-1 text-xs font-semibold text-slate-500"
        >
          <Menu size={20} />
          More
        </button>
      </nav>
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-3 backdrop-blur-sm"
          onMouseDown={() => setAddOpen(false)}
        >
          <section
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-[1.75rem] bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Quick add
                </p>
                <h2 className="mt-1 text-xl font-extrabold">
                  What are you adding?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-xl bg-slate-100 p-2"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <QuickLink
                to="/projects"
                label="New project"
                icon={FolderKanban}
                onNavigate={() => setAddOpen(false)}
              />
              <QuickLink
                to="/invoices"
                label="Create invoice"
                icon={FilePlus2}
                onNavigate={() => setAddOpen(false)}
              />
              <QuickLink
                to="/expenses"
                label="Add expense"
                icon={WalletCards}
                onNavigate={() => setAddOpen(false)}
              />
              <QuickLink
                to="/receipts"
                label="Upload receipt"
                icon={ReceiptText}
                onNavigate={() => setAddOpen(false)}
              />
              <QuickLink
                to="/customers"
                label="Add customer"
                icon={Users}
                onNavigate={() => setAddOpen(false)}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function MobileLink({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof Home;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-1 rounded-xl py-1 text-xs font-semibold ${isActive ? "text-slate-950" : "text-slate-500"}`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  );
}
function QuickLink({
  to,
  label,
  icon: Icon,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 font-bold text-slate-700 hover:border-amber-300 hover:bg-amber-50"
    >
      <span className="rounded-xl bg-amber-100 p-2 text-amber-700">
        <Icon size={19} />
      </span>
      {label}
    </Link>
  );
}
