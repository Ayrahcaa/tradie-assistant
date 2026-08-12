import { Router } from "express";
import { createPaymentHandler, deletePaymentHandler, listInvoicePaymentsHandler, } from "./payment.controller.js";
export const paymentRouter = Router();
paymentRouter.post("/", createPaymentHandler);
paymentRouter.get("/invoice/:invoiceId", listInvoicePaymentsHandler);
paymentRouter.delete("/:paymentId", deletePaymentHandler);
//# sourceMappingURL=payment.routes.js.map