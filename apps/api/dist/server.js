import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { projectRouter } from "./modules/projects/project.routes.js";
import { prisma } from "./lib/prisma.js";
import { customerRouter } from "./modules/customers/customer.routes.js";
import { quoteRouter } from "./modules/quotes/quote.routes.js";
import { invoiceRouter } from "./modules/invoices/invoice.routes.js";
import { paymentRouter } from "./modules/payments/payment.routes.js";
const app = express();
const PORT = Number(process.env.PORT) || 4000;
app.use(helmet());
app.use(cors({
    origin: "http://localhost:5173",
}));
app.use(express.json());
app.use("/api/projects", projectRouter);
app.use("/api/customers", customerRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/payments", paymentRouter);
app.get("/", (_request, response) => {
    response.json({
        message: "Tradie Assistant API is running",
    });
});
app.get("/api/health", (_request, response) => {
    response.status(200).json({
        status: "healthy",
        service: "tradie-assistant-api",
        timestamp: new Date().toISOString(),
    });
});
app.get("/api/health/database", async (_request, response, next) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        response.status(200).json({
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
});
app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({
        message: "An unexpected server error occurred.",
    });
});
const server = app.listen(PORT, () => {
    console.log(`Tradie Assistant API running on http://localhost:${PORT}`);
});
async function shutDown() {
    console.log("Closing server and database connection...");
    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
}
process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
//# sourceMappingURL=server.js.map