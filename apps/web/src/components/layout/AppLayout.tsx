import { useState } from "react";
import { Outlet } from "react-router";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <Header
          onOpenMenu={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}