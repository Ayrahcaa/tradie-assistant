import { prisma } from "../../lib/prisma.js";
async function getDemoUser() {
    const email = process.env.DEMO_USER_EMAIL ?? "demo@tradieassistant.com";
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("Demo user was not found.");
    }
    return user;
}
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
export async function createSubcontractorCost(input) {
    const owner = await getDemoUser();
    await validateSubcontractor(input.subcontractorId, owner.id);
    await validateProject(input.projectId, owner.id);
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
            ownerId: owner.id,
        },
        include: {
            subcontractor: true,
            project: true,
            payments: true,
        },
    });
}
export async function listSubcontractorCosts(subcontractorId, projectId) {
    const owner = await getDemoUser();
    return prisma.subcontractorProjectCost.findMany({
        where: {
            ownerId: owner.id,
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
export async function getSubcontractorCostById(costId) {
    const owner = await getDemoUser();
    return prisma.subcontractorProjectCost.findFirst({
        where: {
            id: costId,
            ownerId: owner.id,
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
export async function updateSubcontractorCost(costId, input) {
    const owner = await getDemoUser();
    const existing = await getSubcontractorCostById(costId);
    if (!existing) {
        return null;
    }
    if (input.subcontractorId) {
        await validateSubcontractor(input.subcontractorId, owner.id);
    }
    if (input.projectId) {
        await validateProject(input.projectId, owner.id);
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
export async function cancelSubcontractorCost(costId) {
    const existing = await getSubcontractorCostById(costId);
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
export async function deleteSubcontractorCost(costId) {
    const existing = await getSubcontractorCostById(costId);
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