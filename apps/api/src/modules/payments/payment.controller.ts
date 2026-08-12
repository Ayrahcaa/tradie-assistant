import type { NextFunction, Request, Response } from "express";

import {
  createPayment,
  deletePayment,
  listInvoicePayments,
} from "./payment.service.js";

import {
  createPaymentSchema,
  invoicePaymentsParamsSchema,
  paymentIdSchema,
} from "./payment.schema.js";

export async function createPaymentHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = createPaymentSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Invalid payment data.",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const result = await createPayment(parsed.data);

    response.status(201).json({
      message: "Payment recorded successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function listInvoicePaymentsHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = invoicePaymentsParamsSchema.safeParse(request.params);

    if (!parsed.success) {
      response.status(400).json({
        message: "Invalid invoice ID.",
      });
      return;
    }

    const payments = await listInvoicePayments(parsed.data.invoiceId);

    if (!payments) {
      response.status(404).json({
        message: "Invoice not found.",
      });
      return;
    }

    response.status(200).json({
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePaymentHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = paymentIdSchema.safeParse(request.params);

    if (!parsed.success) {
      response.status(400).json({
        message: "Invalid payment ID.",
      });
      return;
    }

    const invoice = await deletePayment(parsed.data.paymentId);

    if (!invoice) {
      response.status(404).json({
        message: "Payment not found.",
      });
      return;
    }

    response.status(200).json({
      message: "Payment deleted successfully.",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}
