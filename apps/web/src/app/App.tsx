import { createBrowserRouter, RouterProvider } from "react-router";

import { ProjectDetailsPage } from "../features/projects/pages/ProjectDetailsPage";
import { ProjectsPage } from "../features/projects/pages/ProjectsPage";
import { AppLayout } from "../shared/components/layout/AppLayout";
import { DashboardPage } from "../shared/pages/DashboardPage";
import { PlaceholderPage } from "../shared/pages/PlaceholderPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { CustomerDetailsPage } from "../features/customers/pages/CustomerDetailsPage";
import { QuotesPage } from "../features/quotes/pages/QuotesPage";
import { QuoteDetailsPage } from "../features/quotes/pages/QuoteDetailsPage";
import { InvoicesPage } from "../features/invoices/pages/InvoicesPage";
import { InvoiceDetailsPage } from "../features/invoices/pages/InvoiceDetailsPage";
import { ExpensesPage } from "../features/expenses/pages/ExpensesPage";
import { ExpenseDetailsPage } from "../features/expenses/pages/ExpenseDetailsPage";

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
        path: "projects/:projectId",
        element: <ProjectDetailsPage />,
      },
      {
        path: "customers",
        element: <CustomersPage />,
      },
      {
        path: "customers/:customerId",
        element: <CustomerDetailsPage />,
      },
      {
        path: "invoices/:invoiceId",
        element: <InvoiceDetailsPage />,
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
        element: <QuotesPage />,
      },
      {
        path: "quotes/:quoteId",
        element: <QuoteDetailsPage />,
      },
      {
        path: "invoices",
        element: <InvoicesPage />,
      },
      {
        path: "expenses",
        element: <ExpensesPage />,
      },
      {
        path: "expenses/:expenseId",
        element: <ExpenseDetailsPage />,
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
