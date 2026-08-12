import { Router } from "express";
import { createInvoiceHandler, deleteInvoiceHandler, getInvoiceHandler, listInvoicesHandler, updateInvoiceHandler, updateInvoiceStatusHandler, } from "./invoice.controller.js";
export const invoiceRouter = Router();
invoiceRouter.get("/", listInvoicesHandler);
invoiceRouter.get("/:invoiceId", getInvoiceHandler);
invoiceRouter.post("/", createInvoiceHandler);
invoiceRouter.patch("/:invoiceId", updateInvoiceHandler);
invoiceRouter.patch("/:invoiceId/status", updateInvoiceStatusHandler);
invoiceRouter.delete("/:invoiceId", deleteInvoiceHandler);
//# sourceMappingURL=invoice.routes.js.map