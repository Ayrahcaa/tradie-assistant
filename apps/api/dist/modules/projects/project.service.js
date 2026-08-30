import { prisma } from "../../lib/prisma.js";
function parseDate(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return new Date(value);
}
async function validateCustomer(customerId, ownerId) {
    if (!customerId) {
        return null;
    }
    const customer = await prisma.customer.findFirst({
        where: {
            id: customerId,
            ownerId,
        },
    });
    if (!customer) {
        throw new Error("Customer not found.");
    }
    return customer;
}
export async function createProject(ownerId, input) {
    const customer = await validateCustomer(input.customerId, ownerId);
    return prisma.project.create({
        data: {
            name: input.name,
            description: input.description,
            clientName: customer
                ? `${customer.firstName} ${customer.lastName}`
                : input.clientName,
            customerId: customer?.id ?? null,
            address: input.address,
            quotedValue: input.quotedValue,
            status: input.status ?? "ACTIVE",
            startDate: parseDate(input.startDate),
            endDate: parseDate(input.endDate),
            ownerId,
        },
        include: {
            customer: true,
        },
    });
}
export async function listProjects(ownerId, status) {
    const projects = await prisma.project.findMany({
        where: {
            ownerId,
            ...(status ? { status } : {}),
        },
        include: {
            customer: true,
            invoices: { select: { status: true, totalAmount: true } },
            expenses: { select: { category: true, amount: true } },
            subcontractorProjectCosts: { select: { status: true, agreedAmount: true } },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return projects.map((project) => {
        const revenue = project.invoices.filter((invoice) => invoice.status !== "DRAFT" && invoice.status !== "CANCELLED").reduce((total, invoice) => total + Number(invoice.totalAmount), 0);
        const expenses = project.expenses.filter((expense) => expense.category !== "SUBCONTRACTOR").reduce((total, expense) => total + Number(expense.amount), 0);
        const subcontractors = project.subcontractorProjectCosts.filter((cost) => cost.status !== "CANCELLED").reduce((total, cost) => total + Number(cost.agreedAmount), 0);
        const profit = revenue - expenses - subcontractors;
        const { invoices: _invoices, expenses: _expenses, subcontractorProjectCosts: _costs, ...result } = project;
        void _invoices;
        void _expenses;
        void _costs;
        return { ...result, financialSummary: { revenue, costs: expenses + subcontractors, profit, margin: revenue ? profit / revenue * 100 : 0 } };
    });
}
export async function getProjectById(ownerId, projectId) {
    return prisma.project.findFirst({
        where: {
            id: projectId,
            ownerId,
        },
        include: {
            customer: true,
        },
    });
}
export async function updateProject(ownerId, projectId, input) {
    const existingProject = await prisma.project.findFirst({
        where: {
            id: projectId,
            ownerId,
        },
    });
    if (!existingProject) {
        return null;
    }
    let customer;
    if (input.customerId !== undefined) {
        customer = await validateCustomer(input.customerId, ownerId);
    }
    return prisma.project.update({
        where: {
            id: projectId,
        },
        data: {
            name: input.name,
            description: input.description,
            customerId: input.customerId === undefined ? undefined : (customer?.id ?? null),
            clientName: input.customerId === undefined
                ? input.clientName
                : customer
                    ? `${customer.firstName} ${customer.lastName}`
                    : null,
            address: input.address,
            quotedValue: input.quotedValue,
            status: input.status,
            startDate: parseDate(input.startDate),
            endDate: parseDate(input.endDate),
        },
        include: {
            customer: true,
        },
    });
}
export async function archiveProject(ownerId, projectId) {
    const existingProject = await getProjectById(ownerId, projectId);
    if (!existingProject) {
        return null;
    }
    return prisma.project.update({
        where: {
            id: projectId,
        },
        data: {
            status: "ARCHIVED",
        },
    });
}
export async function deleteProject(ownerId, projectId) {
    const existingProject = await getProjectById(ownerId, projectId);
    if (!existingProject) {
        return false;
    }
    await prisma.project.delete({
        where: {
            id: projectId,
        },
    });
    return true;
}
//# sourceMappingURL=project.service.js.map