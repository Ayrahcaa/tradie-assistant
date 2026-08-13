import { Router } from "express";

import {
  deleteReceiptHandler,
  downloadReceiptHandler,
  extractReceiptHandler,
  listExpenseReceiptsHandler,
  uploadReceiptHandler,
} from "./receipt.controller.js";

import { receiptUpload } from "./receipt.upload.js";

export const receiptRouter = Router();

receiptRouter.post(
  "/expense/:expenseId",
  receiptUpload.single("receipt"),
  uploadReceiptHandler,
);

receiptRouter.get("/expense/:expenseId", listExpenseReceiptsHandler);

receiptRouter.get("/:receiptId/download", downloadReceiptHandler);

receiptRouter.delete("/:receiptId", deleteReceiptHandler);

receiptRouter.post("/:receiptId/extract", extractReceiptHandler);
