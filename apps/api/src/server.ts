import cors from "cors";
import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";

import { projectRouter } from "./modules/projects/project.routes.js";
import { prisma } from "./lib/prisma.js";
import { customerRouter } from "./modules/customers/customer.routes.js";
import { quoteRouter } from "./modules/quotes/quote.routes.js";
import { invoiceRouter } from "./modules/invoices/invoice.routes.js";
import { paymentRouter } from "./modules/payments/payment.routes.js";
import { expenseRouter } from "./modules/expenses/expense.routes.js";
import { receiptRouter } from "./modules/receipts/receipt.routes.js";
import { subcontractorRouter } from "./modules/subcontractors/subcontractor.routes.js";
import { subcontractorCostRouter } from "./modules/subcontractor-costs/subcontractor-cost.routes.js";
import { subcontractorPaymentRouter } from "./modules/subcontractor-payments/subcontractor-payment.routes.js";
import { analyticsRouter } from "./modules/analytics/analytics.routes.js";
import { HttpError } from "./lib/http-error.js";
import { ZodError } from "zod";
import { authRouter } from "./modules/auth/auth.routes.js";
import { requireAuth } from "./modules/auth/auth.middleware.js";

const app = express();

const PORT = Number(process.env.PORT) || 4000;
const allowedWebOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:8081",
  ...(process.env.WEB_ORIGIN ?? "").split(",").map((origin) => origin.trim()).filter(Boolean),
]);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedWebOrigins.has(origin)) callback(null, true);
      else callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (_request: Request, response: Response) => {
  response.json({ message: "Tradie Assistant API is running" });
});

app.get("/api/health", (_request: Request, response: Response) => {
  response.status(200).json({ status: "healthy", service: "tradie-assistant-api", timestamp: new Date().toISOString() });
});

app.get("/api/health/database", async (_request: Request, response: Response, next: NextFunction) => {
  try { await prisma.$queryRaw`SELECT 1`; response.status(200).json({ status: "healthy", database: "connected", timestamp: new Date().toISOString() }); } catch (error) { next(error); }
});

app.use("/api/auth", authRouter);
app.use("/api", requireAuth);

app.use("/api/projects", projectRouter);
app.use("/api/customers", customerRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/receipts", receiptRouter);
app.use("/api/subcontractors", subcontractorRouter);
app.use("/api/subcontractor-costs", subcontractorCostRouter);
app.use("/api/subcontractor-payments", subcontractorPaymentRouter);
app.use("/api/analytics", analyticsRouter);

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "The submitted data is invalid.",
        errors: error.flatten(),
      });
      return;
    }

    if (error instanceof HttpError) {
      response.status(error.statusCode).json({ message: error.message });
      return;
    }

    console.error(error);

    response.status(500).json({
      message: "An unexpected server error occurred.",
    });
  },
);

const server = app.listen(PORT, () => {
  console.log(`Tradie Assistant API running on http://localhost:${PORT}`);
});

async function shutDown(): Promise<void> {
  console.log("Closing server and database connection...");

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
