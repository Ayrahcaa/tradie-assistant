import fs from "node:fs/promises";

import { prisma } from "../../lib/prisma.js";

async function getDemoUser() {
  const email = process.env.DEMO_USER_EMAIL ?? "demo@tradieassistant.com";

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Demo user was not found.");
  }

  return user;
}

export async function createReceipt(
  expenseId: string,
  file: Express.Multer.File,
) {
  const owner = await getDemoUser();

  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      ownerId: owner.id,
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

      ownerId: owner.id,
    },
  });
}

export async function listExpenseReceipts(expenseId: string) {
  const owner = await getDemoUser();

  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      ownerId: owner.id,
    },
  });

  if (!expense) {
    return null;
  }

  return prisma.receipt.findMany({
    where: {
      expenseId,
      ownerId: owner.id,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getReceiptById(receiptId: string) {
  const owner = await getDemoUser();

  return prisma.receipt.findFirst({
    where: {
      id: receiptId,
      ownerId: owner.id,
    },
  });
}

export async function deleteReceipt(receiptId: string) {
  const receipt = await getReceiptById(receiptId);

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
