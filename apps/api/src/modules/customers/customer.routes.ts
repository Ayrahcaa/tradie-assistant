import { Router } from "express";

import {
  archiveCustomerHandler,
  createCustomerHandler,
  deleteCustomerHandler,
  getCustomerHandler,
  listCustomersHandler,
  restoreCustomerHandler,
  updateCustomerHandler,
} from "./customer.controller.js";

export const customerRouter = Router();

customerRouter.get("/", listCustomersHandler);

customerRouter.get("/:customerId", getCustomerHandler);

customerRouter.post("/", createCustomerHandler);

customerRouter.patch("/:customerId", updateCustomerHandler);

customerRouter.patch("/:customerId/archive", archiveCustomerHandler);

customerRouter.patch("/:customerId/restore", restoreCustomerHandler);

customerRouter.delete("/:customerId", deleteCustomerHandler);
