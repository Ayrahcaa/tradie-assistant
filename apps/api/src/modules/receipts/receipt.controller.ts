import type { NextFunction, Request, Response } from "express";
import { extractReceiptData } from "./receipt.ai.service.js";

import {
  createReceipt,
  deleteReceipt,
  getReceiptById,
  listExpenseReceipts,
} from "./receipt.service.js";

type ExpenseParams = {
  expenseId: string;
};

type ReceiptParams = {
  receiptId: string;
};

export async function uploadReceiptHandler(
  request: Request<ExpenseParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { expenseId } = request.params;

    if (!request.file) {
      response.status(400).json({
        message: "Receipt file is required.",
      });
      return;
    }

    const receipt = await createReceipt(expenseId, request.file);

    response.status(201).json({
      message: "Receipt uploaded successfully.",
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
}

export async function listExpenseReceiptsHandler(
  request: Request<ExpenseParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { expenseId } = request.params;

    const receipts = await listExpenseReceipts(expenseId);

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
  } catch (error) {
    next(error);
  }
}

export async function downloadReceiptHandler(
  request: Request<ReceiptParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { receiptId } = request.params;

    const receipt = await getReceiptById(receiptId);

    if (!receipt) {
      response.status(404).json({
        message: "Receipt not found.",
      });
      return;
    }

    response.download(receipt.storagePath, receipt.originalName);
  } catch (error) {
    next(error);
  }
}

export async function deleteReceiptHandler(
  request: Request<ReceiptParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { receiptId } = request.params;

    const deleted = await deleteReceipt(receiptId);

    if (!deleted) {
      response.status(404).json({
        message: "Receipt not found.",
      });
      return;
    }

    response.status(200).json({
      message: "Receipt deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}
export async function extractReceiptHandler(
  request: Request<ReceiptParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { receiptId } = request.params;

    const extraction = await extractReceiptData(receiptId);

    response.status(200).json({
      message: "Receipt analysed successfully.",
      data: extraction,
    });
  } catch (error) {
    next(error);
  }
}
