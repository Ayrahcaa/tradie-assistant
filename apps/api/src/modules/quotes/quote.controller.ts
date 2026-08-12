import type { NextFunction, Request, Response } from "express";

import {
  createQuote,
  deleteQuote,
  getQuoteById,
  listQuotes,
  updateQuote,
  updateQuoteStatus,
} from "./quote.service.js";

import {
  createQuoteSchema,
  quoteIdSchema,
  quoteStatusSchema,
  updateQuoteSchema,
  updateQuoteStatusSchema,
} from "./quote.schema.js";

export async function createQuoteHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedBody = createQuoteSchema.safeParse(request.body);

    if (!parsedBody.success) {
      response.status(400).json({
        message: "Invalid quote data.",
        errors: parsedBody.error.flatten(),
      });
      return;
    }

    const quote = await createQuote(parsedBody.data);

    response.status(201).json({
      message: "Quote created successfully.",
      data: quote,
    });
  } catch (error) {
    next(error);
  }
}

export async function listQuotesHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rawStatus = request.query.status;

    let status:
      | "DRAFT"
      | "SENT"
      | "ACCEPTED"
      | "REJECTED"
      | "EXPIRED"
      | undefined;

    if (typeof rawStatus === "string") {
      const parsedStatus = quoteStatusSchema.safeParse(rawStatus);

      if (!parsedStatus.success) {
        response.status(400).json({
          message: "Invalid quote status.",
        });
        return;
      }

      status = parsedStatus.data;
    }

    const quotes = await listQuotes(status);

    response.status(200).json({
      count: quotes.length,
      data: quotes,
    });
  } catch (error) {
    next(error);
  }
}

export async function getQuoteHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedParams = quoteIdSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({
        message: "Invalid quote ID.",
      });
      return;
    }

    const quote = await getQuoteById(parsedParams.data.quoteId);

    if (!quote) {
      response.status(404).json({
        message: "Quote not found.",
      });
      return;
    }

    response.status(200).json({
      data: quote,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateQuoteHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedParams = quoteIdSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({
        message: "Invalid quote ID.",
      });
      return;
    }

    const parsedBody = updateQuoteSchema.safeParse(request.body);

    if (!parsedBody.success) {
      response.status(400).json({
        message: "Invalid quote update.",
        errors: parsedBody.error.flatten(),
      });
      return;
    }

    const quote = await updateQuote(parsedParams.data.quoteId, parsedBody.data);

    if (!quote) {
      response.status(404).json({
        message: "Quote not found.",
      });
      return;
    }

    response.status(200).json({
      message: "Quote updated successfully.",
      data: quote,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateQuoteStatusHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedParams = quoteIdSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({
        message: "Invalid quote ID.",
      });
      return;
    }

    const parsedBody = updateQuoteStatusSchema.safeParse(request.body);

    if (!parsedBody.success) {
      response.status(400).json({
        message: "Invalid quote status.",
      });
      return;
    }

    const quote = await updateQuoteStatus(
      parsedParams.data.quoteId,
      parsedBody.data.status,
    );

    if (!quote) {
      response.status(404).json({
        message: "Quote not found.",
      });
      return;
    }

    response.status(200).json({
      message: "Quote status updated.",
      data: quote,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteQuoteHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedParams = quoteIdSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({
        message: "Invalid quote ID.",
      });
      return;
    }

    const deleted = await deleteQuote(parsedParams.data.quoteId);

    if (!deleted) {
      response.status(404).json({
        message: "Quote not found.",
      });
      return;
    }

    response.status(200).json({
      message: "Quote deleted permanently.",
    });
  } catch (error) {
    next(error);
  }
}
