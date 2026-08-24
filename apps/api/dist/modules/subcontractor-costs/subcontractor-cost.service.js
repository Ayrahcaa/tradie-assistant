import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
function calculateAmount(rate, quantity) {
    if (rate === undefined ||
        rate === null ||
        quantity === undefined ||
        quantity === null) {
        return null;
    }
    return rate * quantity;
}
function deriveStatus(agreedAmount, amountPaid) {
    if (amountPaid <= 0) {
        return "UNPAID";
    }
    if (amountPaid >= agreedAmount) {
        return "PAID";
    }
    return "PARTIALLY_PAID";
}
async function validateSubcontractor(subcontractorId, ownerId) {
    const subcontractor = await prisma.subcontractor.findFirst({
        where: {
            id: subcontractorId,
            ownerId,
        },
    });
    if (!subcontractor) {
        throw new Error("Subcontractor not found.");
    }
    return subcontractor;
}
async function validateProject(projectId, ownerId) {
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
export async function createSubcontractorCost(ownerId, input) {
    await validateSubcontractor(input.subcontractorId, ownerId);
    await validateProject(input.projectId, ownerId);
    const calculatedAmount = calculateAmount(input.rate, input.quantity);
    const agreedAmount = input.agreedAmount;
    return prisma.subcontractorProjectCost.create({
        data: {
            subcontractorId: input.subcontractorId,
            projectId: input.projectId,
            description: input.description,
            rateType: input.rateType,
            rate: input.rate,
            quantity: input.quantity,
            calculatedAmount,
            agreedAmount,
            amountPaid: 0,
            amountPending: agreedAmount,
            status: "UNPAID",
            notes: input.notes,
            ownerId,
        },
        include: {
            subcontractor: true,
            project: true,
            payments: true,
        },
    });
}
export async function listSubcontractorCosts(ownerId, subcontractorId, projectId) {
    return prisma.subcontractorProjectCost.findMany({
        where: {
            ownerId,
            ...(subcontractorId ? { subcontractorId } : {}),
            ...(projectId ? { projectId } : {}),
        },
        include: {
            subcontractor: true,
            project: true,
            payments: {
                orderBy: {
                    paidAt: "desc",
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
export async function getSubcontractorCostById(ownerId, costId) {
    return prisma.subcontractorProjectCost.findFirst({
        where: {
            id: costId,
            ownerId,
        },
        include: {
            subcontractor: true,
            project: true,
            payments: {
                orderBy: {
                    paidAt: "desc",
                },
            },
        },
    });
}
export async function updateSubcontractorCost(ownerId, costId, input) {
    const existing = await getSubcontractorCostById(ownerId, costId);
    if (!existing) {
        return null;
    }
    if (input.subcontractorId) {
        await validateSubcontractor(input.subcontractorId, ownerId);
    }
    if (input.projectId) {
        await validateProject(input.projectId, ownerId);
    }
    const rate = input.rate === undefined
        ? existing.rate
            ? Number(existing.rate)
            : null
        : input.rate;
    const quantity = input.quantity === undefined
        ? existing.quantity
            ? Number(existing.quantity)
            : null
        : input.quantity;
    const calculatedAmount = calculateAmount(rate, quantity);
    const agreedAmount = input.agreedAmount ?? Number(existing.agreedAmount);
    const amountPaid = Number(existing.amountPaid);
    if (agreedAmount < amountPaid) {
        throw new HttpError(400, `Agreed amount cannot be less than the ${amountPaid.toFixed(2)} already paid.`);
    }
    const amountPending = Math.max(agreedAmount - amountPaid, 0);
    const status = existing.status === "CANCELLED"
        ? "CANCELLED"
        : deriveStatus(agreedAmount, amountPaid);
    return prisma.subcontractorProjectCost.update({
        where: {
            id: costId,
        },
        data: {
            subcontractorId: input.subcontractorId,
            projectId: input.projectId,
            description: input.description,
            rateType: input.rateType,
            rate: input.rate,
            quantity: input.quantity,
            calculatedAmount,
            agreedAmount: input.agreedAmount,
            amountPending,
            status,
            notes: input.notes,
        },
        include: {
            subcontractor: true,
            project: true,
            payments: {
                orderBy: {
                    paidAt: "desc",
                },
            },
        },
    });
}
export async function cancelSubcontractorCost(ownerId, costId) {
    const existing = await getSubcontractorCostById(ownerId, costId);
    if (!existing) {
        return null;
    }
    return prisma.subcontractorProjectCost.update({
        where: {
            id: costId,
        },
        data: {
            status: "CANCELLED",
        },
        include: {
            subcontractor: true,
            project: true,
            payments: true,
        },
    });
}
export async function deleteSubcontractorCost(ownerId, costId) {
    const existing = await getSubcontractorCostById(ownerId, costId);
    if (!existing) {
        return false;
    }
    await prisma.subcontractorProjectCost.delete({
        where: {
            id: costId,
        },
    });
    return true;
}
//# sourceMappingURL=subcontractor-cost.service.js.map