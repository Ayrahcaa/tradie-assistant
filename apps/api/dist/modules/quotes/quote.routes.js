import { Router } from "express";
import { createQuoteHandler, deleteQuoteHandler, getQuoteHandler, listQuotesHandler, updateQuoteHandler, updateQuoteStatusHandler, } from "./quote.controller.js";
export const quoteRouter = Router();
quoteRouter.get("/", listQuotesHandler);
quoteRouter.get("/:quoteId", getQuoteHandler);
quoteRouter.post("/", createQuoteHandler);
quoteRouter.patch("/:quoteId", updateQuoteHandler);
quoteRouter.patch("/:quoteId/status", updateQuoteStatusHandler);
quoteRouter.delete("/:quoteId", deleteQuoteHandler);
//# sourceMappingURL=quote.routes.js.map