import { Router } from "express";
import { createSubcontractorPaymentHandler, deleteSubcontractorPaymentHandler, } from "./subcontractor-payment.controller.js";
export const subcontractorPaymentRouter = Router();
subcontractorPaymentRouter.post("/", createSubcontractorPaymentHandler);
subcontractorPaymentRouter.delete("/:paymentId", deleteSubcontractorPaymentHandler);
//# sourceMappingURL=subcontractor-payment.routes.js.map