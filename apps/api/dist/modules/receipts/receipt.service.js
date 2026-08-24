import fs from "node:fs/promises";
import { prisma } from "../../lib/prisma.js";
export async function createReceipt(ownerId, expenseId, file) {
    const expense = await prisma.expense.findFirst({
        where: {
            id: expenseId,
            ownerId,
        },
    });
    if (!expense) {
        await fs.unlink(file.path).catch(() => undefined);
        throw new Error("Expense not found.");
    }
    return prisma.receipt.create({
        data: {
            originalName: file.originalname,
            fileName: file.filename,
            mimeType: file.mimetype,
            fileSize: file.size,
            storagePath: file.path,
            expenseId: expense.id,
            ownerId,
        },
    });
}
export async function listExpenseReceipts(ownerId, expenseId) {
    const expense = await prisma.expense.findFirst({
        where: {
            id: expenseId,
            ownerId,
        },
    });
    if (!expense) {
        return null;
    }
    return prisma.receipt.findMany({
        where: {
            expenseId,
            ownerId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
export async function getReceiptById(ownerId, receiptId) {
    return prisma.receipt.findFirst({
        where: {
            id: receiptId,
            ownerId,
        },
    });
}
export async function deleteReceipt(ownerId, receiptId) {
    const receipt = await getReceiptById(ownerId, receiptId);
    if (!receipt) {
        return false;
    }
    await prisma.receipt.delete({
        where: {
            id: receipt.id,
        },
    });
    await fs.unlink(receipt.storagePath).catch(() => undefined);
    return true;
}
//# sourceMappingURL=receipt.service.js.map