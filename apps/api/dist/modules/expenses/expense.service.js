import { prisma } from "../../lib/prisma.js";
async function validateProject(projectId, ownerId) {
    if (!projectId) {
        return null;
    }
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            ownerId,
        },
    });
    if (!project) {
        throw new Error("Project not found.");
    }
    return project;
}
function deriveExpenseStatus(input) {
    if (input.paidAt) {
        return "PAID";
    }
    if (input.dueDate && input.dueDate.getTime() < Date.now()) {
        return "OVERDUE";
    }
    return input.requestedStatus ?? "PENDING";
}
export async function createExpense(ownerId, input) {
    await validateProject(input.projectId, ownerId);
    const dueDate = input.dueDate ? new Date(input.dueDate) : null;
    const paidAt = input.paidAt ? new Date(input.paidAt) : null;
    const status = deriveExpenseStatus({
        requestedStatus: input.status,
        dueDate,
        paidAt,
    });
    return prisma.expense.create({
        data: {
            description: input.description,
            supplier: input.supplier,
            category: input.category,
            status,
            amount: input.amount,
            gstAmount: input.gstAmount ?? 0,
            expenseDate: new Date(input.expenseDate),
            dueDate,
            paidAt,
            projectId: input.projectId ?? null,
            notes: input.notes,
            ownerId,
        },
        include: {
            project: true,
        },
    });
}
export async function listExpenses(ownerId, status) {
    const expenses = await prisma.expense.findMany({
        where: {
            ownerId,
        },
        include: {
            project: true,
        },
        orderBy: {
            expenseDate: "desc",
        },
    });
    const updated = await Promise.all(expenses.map(async (expense) => {
        const derivedStatus = deriveExpenseStatus({
            requestedStatus: expense.status,
            dueDate: expense.dueDate,
            paidAt: expense.paidAt,
        });
        if (derivedStatus === expense.status) {
            return expense;
        }
        return prisma.expense.update({
            where: {
                id: expense.id,
            },
            data: {
                status: derivedStatus,
            },
            include: {
                project: true,
            },
        });
    }));
    return status
        ? updated.filter((expense) => expense.status === status)
        : updated;
}
export async function getExpenseById(ownerId, expenseId) {
    return prisma.expense.findFirst({
        where: {
            id: expenseId,
            ownerId,
        },
        include: {
            project: true,
        },
    });
}
export async function updateExpense(ownerId, expenseId, input) {
    const existing = await getExpenseById(ownerId, expenseId);
    if (!existing) {
        return null;
    }
    if (input.projectId !== undefined) {
        await validateProject(input.projectId, ownerId);
    }
    const dueDate = input.dueDate === undefined
        ? undefined
        : input.dueDate
            ? new Date(input.dueDate)
            : null;
    const paidAt = input.paidAt === undefined
        ? undefined
        : input.paidAt
            ? new Date(input.paidAt)
            : null;
    const status = deriveExpenseStatus({
        requestedStatus: input.status ?? existing.status,
        dueDate: dueDate === undefined ? existing.dueDate : dueDate,
        paidAt: paidAt === undefined ? existing.paidAt : paidAt,
    });
    return prisma.expense.update({
        where: {
            id: expenseId,
        },
        data: {
            description: input.description,
            supplier: input.supplier,
            category: input.category,
            status,
            amount: input.amount,
            gstAmount: input.gstAmount,
            expenseDate: input.expenseDate === undefined
                ? undefined
                : new Date(input.expenseDate),
            dueDate,
            paidAt,
            projectId: input.projectId,
            notes: input.notes,
        },
        include: {
            project: true,
        },
    });
}
export async function deleteExpense(ownerId, expenseId) {
    const expense = await getExpenseById(ownerId, expenseId);
    if (!expense) {
        return false;
    }
    await prisma.expense.delete({
        where: {
            id: expenseId,
        },
    });
    return true;
}
//# sourceMappingURL=expense.service.js.map