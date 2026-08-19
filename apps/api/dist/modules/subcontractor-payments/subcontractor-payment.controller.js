import { createSubcontractorPaymentSchema, subcontractorPaymentIdSchema, } from "./subcontractor-payment.schema.js";
import { createSubcontractorPayment, deleteSubcontractorPayment, } from "./subcontractor-payment.service.js";
export async function createSubcontractorPaymentHandler(request, response, next) {
    try {
        const parsed = createSubcontractorPaymentSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid subcontractor payment data.",
                errors: parsed.error.flatten(),
            });
            return;
        }
        const result = await createSubcontractorPayment(parsed.data);
        response.status(201).json({
            message: "Subcontractor payment recorded successfully.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteSubcontractorPaymentHandler(request, response, next) {
    try {
        const parsed = subcontractorPaymentIdSchema.safeParse(request.params);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid subcontractor payment ID.",
            });
            return;
        }
        const result = await deleteSubcontractorPayment(parsed.data.paymentId);
        if (!result) {
            response.status(404).json({
                message: "Subcontractor payment not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Subcontractor payment deleted successfully.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=subcontractor-payment.controller.js.map