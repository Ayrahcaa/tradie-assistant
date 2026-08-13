import { Router } from "express";
import { createExpenseHandler, deleteExpenseHandler, getExpenseHandler, listExpensesHandler, updateExpenseHandler, } from "./expense.controller.js";
export const expenseRouter = Router();
expenseRouter.get("/", listExpensesHandler);
expenseRouter.get("/:expenseId", getExpenseHandler);
expenseRouter.post("/", createExpenseHandler);
expenseRouter.patch("/:expenseId", updateExpenseHandler);
expenseRouter.delete("/:expenseId", deleteExpenseHandler);
//# sourceMappingURL=expense.routes.js.map