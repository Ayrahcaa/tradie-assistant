import { extractReceiptData } from "./receipt.ai.service.js";
import { createReceipt, deleteReceipt, getReceiptById, listExpenseReceipts, } from "./receipt.service.js";
export async function uploadReceiptHandler(request, response, next) {
    try {
        const { expenseId } = request.params;
        if (!request.file) {
            response.status(400).json({
                message: "Receipt file is required.",
            });
            return;
        }
        const receipt = await createReceipt(request.authUser.id, expenseId, request.file);
        response.status(201).json({
            message: "Receipt uploaded successfully.",
            data: receipt,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function listExpenseReceiptsHandler(request, response, next) {
    try {
        const { expenseId } = request.params;
        const receipts = await listExpenseReceipts(request.authUser.id, expenseId);
        if (!receipts) {
            response.status(404).json({
                message: "Expense not found.",
            });
            return;
        }
        response.status(200).json({
            count: receipts.length,
            data: receipts,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function downloadReceiptHandler(request, response, next) {
    try {
        const { receiptId } = request.params;
        const receipt = await getReceiptById(request.authUser.id, receiptId);
        if (!receipt) {
            response.status(404).json({
                message: "Receipt not found.",
            });
            return;
        }
        response.download(receipt.storagePath, receipt.originalName);
    }
    catch (error) {
        next(error);
    }
}
export async function deleteReceiptHandler(request, response, next) {
    try {
        const { receiptId } = request.params;
        const deleted = await deleteReceipt(request.authUser.id, receiptId);
        if (!deleted) {
            response.status(404).json({
                message: "Receipt not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Receipt deleted successfully.",
        });
    }
    catch (error) {
        next(error);
    }
}
export async function extractReceiptHandler(request, response, next) {
    try {
        const { receiptId } = request.params;
        const extraction = await extractReceiptData(request.authUser.id, receiptId);
        response.status(200).json({
            message: "Receipt analysed successfully.",
            data: extraction,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=receipt.controller.js.map