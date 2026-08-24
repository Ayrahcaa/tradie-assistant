import { prisma } from "../../lib/prisma.js";
function deriveCostStatus(agreedAmount, amountPaid) {
    if (amountPaid <= 0) {
        return "UNPAID";
    }
    if (amountPaid >= agreedAmount) {
        return "PAID";
    }
    return "PARTIALLY_PAID";
}
export async function createSubcontractorPayment(ownerId, input) {
    return prisma.$transaction(async (tx) => {
        const cost = await tx.subcontractorProjectCost.findFirst({
            where: {
                id: input.costId,
                ownerId,
            },
            include: {
                payments: true,
            },
        });
        if (!cost) {
            throw new Error("Subcontractor cost not found.");
        }
        if (cost.status === "CANCELLED") {
            throw new Error("Payments cannot be added to a cancelled cost.");
        }
        const agreedAmount = Number(cost.agreedAmount);
        const currentPaid = cost.payments.reduce((total, payment) => total + Number(payment.amount), 0);
        const remaining = Math.max(agreedAmount - currentPaid, 0);
        if (remaining <= 0) {
            throw new Error("This subcontractor cost has already been paid in full.");
        }
        if (input.amount > remaining) {
            throw new Error(`Payment cannot exceed the outstanding amount of $${remaining.toFixed(2)}.`);
        }
        const payment = await tx.subcontractorPayment.create({
            data: {
                costId: cost.id,
                ownerId,
                amount: input.amount,
                paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
                reference: input.reference ?? null,
                notes: input.notes ?? null,
            },
        });
        const amountPaid = currentPaid + input.amount;
        const amountPending = Math.max(agreedAmount - amountPaid, 0);
        const status = deriveCostStatus(agreedAmount, amountPaid);
        const updatedCost = await tx.subcontractorProjectCost.update({
            where: {
                id: cost.id,
            },
            data: {
                amountPaid,
                amountPending,
                status,
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
        return {
            payment,
            cost: updatedCost,
        };
    });
}
export async function deleteSubcontractorPayment(ownerId, paymentId) {
    return prisma.$transaction(async (tx) => {
        const payment = await tx.subcontractorPayment.findFirst({
            where: {
                id: paymentId,
                ownerId,
            },
        });
        if (!payment) {
            return null;
        }
        await tx.subcontractorPayment.delete({
            where: {
                id: payment.id,
            },
        });
        const cost = await tx.subcontractorProjectCost.findFirst({
            where: {
                id: payment.costId,
                ownerId,
            },
            include: {
                payments: true,
            },
        });
        if (!cost) {
            throw new Error("Associated subcontractor cost could not be found.");
        }
        const amountPaid = cost.payments.reduce((total, item) => total + Number(item.amount), 0);
        const agreedAmount = Number(cost.agreedAmount);
        const amountPending = Math.max(agreedAmount - amountPaid, 0);
        const status = cost.status === "CANCELLED"
            ? "CANCELLED"
            : deriveCostStatus(agreedAmount, amountPaid);
        return tx.subcontractorProjectCost.update({
            where: {
                id: cost.id,
            },
            data: {
                amountPaid,
                amountPending,
                status,
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
    });
}
//# sourceMappingURL=subcontractor-payment.service.js.map