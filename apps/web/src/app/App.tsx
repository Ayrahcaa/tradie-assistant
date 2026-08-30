import { createBrowserRouter, RouterProvider } from "react-router";

import { ProjectDetailsPage } from "../features/projects/pages/ProjectDetailsPage";
import { ProjectsPage } from "../features/projects/pages/ProjectsPage";
import { AppLayout } from "../shared/components/layout/AppLayout";
import { DashboardPage } from "../shared/pages/DashboardPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { CustomerDetailsPage } from "../features/customers/pages/CustomerDetailsPage";
import { QuotesPage } from "../features/quotes/pages/QuotesPage";
import { QuoteDetailsPage } from "../features/quotes/pages/QuoteDetailsPage";
import { InvoicesPage } from "../features/invoices/pages/InvoicesPage";
import { InvoiceDetailsPage } from "../features/invoices/pages/InvoiceDetailsPage";
import { ExpensesPage } from "../features/expenses/pages/ExpensesPage";
import { ExpenseDetailsPage } from "../features/expenses/pages/ExpenseDetailsPage";
import { SubcontractorsPage } from "../features/subcontractors/pages/SubcontractorsPage";
import { SubcontractorDetailsPage } from "../features/subcontractors/pages/SubcontractorDetailsPage";
import { FinancialOverviewPage } from "../features/analytics/FinancialOverviewPage";
import { OutstandingPage } from "../features/analytics/OutstandingPage";
import { AssistantPage } from "../shared/pages/AssistantPage";
import { ReceiptsPage } from "../shared/pages/ReceiptsPage";
import { SettingsPage } from "../shared/pages/SettingsPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ProtectedRoute, PublicOnlyRoute } from "../features/auth/components/AuthGuards";
import { TaxAndGstPage } from "../features/analytics/TaxAndGstPage";
import { BusinessCheckPage } from "../features/analytics/BusinessCheckPage";
import { SubcontractorStatementPage } from "../features/analytics/SubcontractorStatementPage";
import { AccountantExportPage } from "../features/analytics/AccountantExportPage";

const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
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
        element: <ReceiptsPage />,
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
        element: <SubcontractorsPage />,
      },
      {
        path: "subcontractors/:subcontractorId",
        element: <SubcontractorDetailsPage />,
      },
      { path: "subcontractors/:subcontractorId/statement", element: <SubcontractorStatementPage /> },
      {
        path: "finances",
        element: <FinancialOverviewPage />,
      },
      {
        path: "outstanding",
        element: <OutstandingPage />,
      },
      { path: "tax", element: <TaxAndGstPage /> },
      { path: "business-check", element: <BusinessCheckPage /> },
      { path: "accountant-export", element: <AccountantExportPage /> },
      {
        path: "assistant",
        element: <AssistantPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
