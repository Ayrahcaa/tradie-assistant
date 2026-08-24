import { createExpense, deleteExpense, getExpenseById, listExpenses, updateExpense, } from "./expense.service.js";
import { createExpenseSchema, expenseIdSchema, expenseStatusSchema, updateExpenseSchema, } from "./expense.schema.js";
export async function createExpenseHandler(request, response, next) {
    try {
        const parsed = createExpenseSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid expense data.",
                errors: parsed.error.flatten(),
            });
            return;
        }
        const expense = await createExpense(request.authUser.id, parsed.data);
        response.status(201).json({
            message: "Expense created successfully.",
            data: expense,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function listExpensesHandler(request, response, next) {
    try {
        let status;
        if (typeof request.query.status === "string") {
            const parsed = expenseStatusSchema.safeParse(request.query.status);
            if (!parsed.success) {
                response.status(400).json({
                    message: "Invalid expense status.",
                });
                return;
            }
            status = parsed.data;
        }
        const expenses = await listExpenses(request.authUser.id, status);
        response.status(200).json({
            count: expenses.length,
            data: expenses,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getExpenseHandler(request, response, next) {
    try {
        const parsed = expenseIdSchema.safeParse(request.params);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid expense ID.",
            });
            return;
        }
        const expense = await getExpenseById(request.authUser.id, parsed.data.expenseId);
        if (!expense) {
            response.status(404).json({
                message: "Expense not found.",
            });
            return;
        }
        response.status(200).json({
            data: expense,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateExpenseHandler(request, response, next) {
    try {
        const params = expenseIdSchema.safeParse(request.params);
        const body = updateExpenseSchema.safeParse(request.body);
        if (!params.success) {
            response.status(400).json({
                message: "Invalid expense ID.",
            });
            return;
        }
        if (!body.success) {
            response.status(400).json({
                message: "Invalid expense update.",
                errors: body.error.flatten(),
            });
            return;
        }
        const expense = await updateExpense(request.authUser.id, params.data.expenseId, body.data);
        if (!expense) {
            response.status(404).json({
                message: "Expense not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Expense updated successfully.",
            data: expense,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteExpenseHandler(request, response, next) {
    try {
        const parsed = expenseIdSchema.safeParse(request.params);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid expense ID.",
            });
            return;
        }
        const deleted = await deleteExpense(request.authUser.id, parsed.data.expenseId);
        if (!deleted) {
            response.status(404).json({
                message: "Expense not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Expense deleted permanently.",
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=expense.controller.js.map