import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";

import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { ProjectsPage } from "./pages/ProjectsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "customers",
        element: (
          <PlaceholderPage
            title="Customers"
            description="Store customer details and view their projects, quotes, invoices and payments."
          />
        ),
      },
      {
        path: "expenses",
        element: (
          <PlaceholderPage
            title="Expenses"
            description="Record project costs, supplier bills, fuel, tools and other business expenses."
          />
        ),
      },
      {
        path: "receipts",
        element: (
          <PlaceholderPage
            title="Receipts"
            description="Upload receipts and use AI to extract supplier, amount and GST information."
          />
        ),
      },
      {
        path: "quotes",
        element: (
          <PlaceholderPage
            title="Quotes"
            description="Prepare and track customer quotes."
          />
        ),
      },
      {
        path: "invoices",
        element: (
          <PlaceholderPage
            title="Invoices"
            description="Generate invoices and monitor paid, pending and overdue amounts."
          />
        ),
      },
      {
        path: "subcontractors",
        element: (
          <PlaceholderPage
            title="Subcontractors"
            description="Track subcontractor details, bills and payments."
          />
        ),
      },
      {
        path: "assistant",
        element: (
          <PlaceholderPage
            title="AI Assistant"
            description="Ask questions about projects, expenses, invoices and business performance."
          />
        ),
      },
      {
        path: "settings",
        element: (
          <PlaceholderPage
            title="Settings"
            description="Manage business details, GST registration, preferences and security."
          />
        ),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}