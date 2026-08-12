import { createInvoice, deleteInvoice, getInvoiceById, listInvoices, updateInvoice, updateInvoiceStatus, } from "./invoice.service.js";
import { createInvoiceSchema, invoiceIdSchema, invoiceStatusSchema, updateInvoiceSchema, updateInvoiceStatusSchema, } from "./invoice.schema.js";
export async function createInvoiceHandler(request, response, next) {
    try {
        const parsed = createInvoiceSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid invoice data.",
                errors: parsed.error.flatten(),
            });
            return;
        }
        const invoice = await createInvoice(parsed.data);
        response.status(201).json({
            message: "Invoice created successfully.",
            data: invoice,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function listInvoicesHandler(request, response, next) {
    try {
        let status;
        if (typeof request.query.status === "string") {
            const parsed = invoiceStatusSchema.safeParse(request.query.status);
            if (!parsed.success) {
                response.status(400).json({
                    message: "Invalid invoice status.",
                });
                return;
            }
            status = parsed.data;
        }
        const invoices = await listInvoices(status);
        response.status(200).json({
            count: invoices.length,
            data: invoices,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getInvoiceHandler(request, response, next) {
    try {
        const parsed = invoiceIdSchema.safeParse(request.params);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid invoice ID.",
            });
            return;
        }
        const invoice = await getInvoiceById(parsed.data.invoiceId);
        if (!invoice) {
            response.status(404).json({
                message: "Invoice not found.",
            });
            return;
        }
        response.status(200).json({
            data: invoice,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateInvoiceHandler(request, response, next) {
    try {
        const params = invoiceIdSchema.safeParse(request.params);
        if (!params.success) {
            response.status(400).json({
                message: "Invalid invoice ID.",
            });
            return;
        }
        const body = updateInvoiceSchema.safeParse(request.body);
        if (!body.success) {
            response.status(400).json({
                message: "Invalid invoice update.",
                errors: body.error.flatten(),
            });
            return;
        }
        const invoice = await updateInvoice(params.data.invoiceId, body.data);
        if (!invoice) {
            response.status(404).json({
                message: "Invoice not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Invoice updated successfully.",
            data: invoice,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateInvoiceStatusHandler(request, response, next) {
    try {
        const params = invoiceIdSchema.safeParse(request.params);
        const body = updateInvoiceStatusSchema.safeParse(request.body);
        if (!params.success || !body.success) {
            response.status(400).json({
                message: "Invalid invoice status update.",
            });
            return;
        }
        const invoice = await updateInvoiceStatus(params.data.invoiceId, body.data.status);
        if (!invoice) {
            response.status(404).json({
                message: "Invoice not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Invoice status updated.",
            data: invoice,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteInvoiceHandler(request, response, next) {
    try {
        const parsed = invoiceIdSchema.safeParse(request.params);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid invoice ID.",
            });
            return;
        }
        const deleted = await deleteInvoice(parsed.data.invoiceId);
        if (!deleted) {
            response.status(404).json({
                message: "Invoice not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Invoice deleted permanently.",
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=invoice.controller.js.map