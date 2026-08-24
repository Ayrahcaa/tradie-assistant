import fs from "node:fs/promises";

import { prisma } from "../../lib/prisma.js";

export async function createReceipt(
  ownerId: string,
  expenseId: string,
  file: Express.Multer.File,
) {
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

export async function listExpenseReceipts(ownerId: string, expenseId: string) {
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

export async function getReceiptById(ownerId: string, receiptId: string) {
  return prisma.receipt.findFirst({
    where: {
      id: receiptId,
      ownerId,
    },
  });
}

export async function deleteReceipt(ownerId: string, receiptId: string) {
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
