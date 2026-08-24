import type { NextFunction, Request, Response } from "express";

import {
  archiveCustomer,
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  restoreCustomer,
  updateCustomer,
} from "./customer.service.js";

import {
  createCustomerSchema,
  customerIdSchema,
  updateCustomerSchema,
} from "./customer.schema.js";

export async function createCustomerHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedBody = createCustomerSchema.safeParse(request.body);

    if (!parsedBody.success) {
      response.status(400).json({
        message: "Invalid customer data.",
        errors: parsedBody.error.flatten(),
      });
      return;
    }

    const customer = await createCustomer(request.authUser!.id, parsedBody.data);

    response.status(201).json({
      message: "Customer created successfully.",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function listCustomersHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const includeArchived = request.query.includeArchived === "true";

    const customers = await listCustomers(request.authUser!.id, includeArchived);

    response.status(200).json({
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedParams = customerIdSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({
        message: "Invalid customer ID.",
      });
      return;
    }

    const customer = await getCustomerById(request.authUser!.id, parsedParams.data.customerId);

    if (!customer) {
      response.status(404).json({
        message: "Customer not found.",
      });
      return;
    }

    response.status(200).json({
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomerHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedParams = customerIdSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({
        message: "Invalid customer ID.",
      });
      return;
    }

    const parsedBody = updateCustomerSchema.safeParse(request.body);

    if (!parsedBody.success) {
      response.status(400).json({
        message: "Invalid customer update.",
        errors: parsedBody.error.flatten(),
      });
      return;
    }

    const customer = await updateCustomer(
      request.authUser!.id,
      parsedParams.data.customerId,
      parsedBody.data,
    );

    if (!customer) {
      response.status(404).json({
        message: "Customer not found.",
      });
      return;
    }

    response.status(200).json({
      message: "Customer updated successfully.",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function archiveCustomerHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedParams = customerIdSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({
        message: "Invalid customer ID.",
      });
      return;
    }

    const customer = await archiveCustomer(request.authUser!.id, parsedParams.data.customerId);

    if (!customer) {
      response.status(404).json({
        message: "Customer not found.",
      });
      return;
    }

    response.status(200).json({
      message: "Customer archived successfully.",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function restoreCustomerHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedParams = customerIdSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({
        message: "Invalid customer ID.",
      });
      return;
    }

    const customer = await restoreCustomer(request.authUser!.id, parsedParams.data.customerId);

    if (!customer) {
      response.status(404).json({
        message: "Customer not found.",
      });
      return;
    }

    response.status(200).json({
      message: "Customer restored successfully.",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCustomerHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedParams = customerIdSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({
        message: "Invalid customer ID.",
      });
      return;
    }

    const deleted = await deleteCustomer(request.authUser!.id, parsedParams.data.customerId);

    if (!deleted) {
      response.status(404).json({
        message: "Customer not found.",
      });
      return;
    }

    response.status(200).json({
      message: "Customer deleted permanently.",
    });
  } catch (error) {
    next(error);
  }
}
