import { prisma } from "../../lib/prisma.js";
async function getDemoUser() {
    const email = process.env.DEMO_USER_EMAIL ?? "demo@tradieassistant.com";
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        throw new Error("Demo user was not found.");
    }
    return user;
}
function calculateInvoiceStatus(amountPaid, totalAmount, dueDate) {
    if (amountPaid >= totalAmount) {
        return "PAID";
    }
    if (amountPaid > 0) {
        if (dueDate && dueDate.getTime() < Date.now()) {
            return "OVERDUE";
        }
        return "PARTIALLY_PAID";
    }
    if (dueDate && dueDate.getTime() < Date.now()) {
        return "OVERDUE";
    }
    return "SENT";
}
export async function createPayment(input) {
    const owner = await getDemoUser();
    return prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
            where: {
                id: input.invoiceId,
                ownerId: owner.id,
            },
            include: {
                payments: true,
            },
        });
        if (!invoice) {
            throw new Error("Invoice not found.");
        }
        if (invoice.status === "CANCELLED") {
            throw new Error("Payments cannot be added to a cancelled invoice.");
        }
        const totalAmount = Number(invoice.totalAmount);
        const alreadyPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const remainingBalance = Math.max(totalAmount - alreadyPaid, 0);
        if (remainingBalance <= 0) {
            throw new Error("This invoice has already been paid in full.");
        }
        if (input.amount > remainingBalance) {
            throw new Error(`Payment cannot exceed the remaining balance of $${remainingBalance.toFixed(2)}.`);
        }
        const payment = await tx.payment.create({
            data: {
                amount: input.amount,
                method: input.method,
                reference: input.reference ?? null,
                notes: input.notes ?? null,
                paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
                invoiceId: invoice.id,
                ownerId: owner.id,
            },
        });
        const amountPaid = alreadyPaid + input.amount;
        const balanceDue = Math.max(totalAmount - amountPaid, 0);
        const status = calculateInvoiceStatus(amountPaid, totalAmount, invoice.dueDate);
        const updatedInvoice = await tx.invoice.update({
            where: {
                id: invoice.id,
            },
            data: {
                amountPaid,
                balanceDue,
                status,
            },
            include: {
                customer: true,
                project: true,
                items: {
                    orderBy: {
                        sortOrder: "asc",
                    },
                },
                payments: {
                    orderBy: {
                        paidAt: "desc",
                    },
                },
            },
        });
        return {
            payment,
            invoice: updatedInvoice,
        };
    });
}
export async function listInvoicePayments(invoiceId) {
    const owner = await getDemoUser();
    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            ownerId: owner.id,
        },
    });
    if (!invoice) {
        return null;
    }
    return prisma.payment.findMany({
        where: {
            invoiceId,
            ownerId: owner.id,
        },
        orderBy: {
            paidAt: "desc",
        },
    });
}
export async function deletePayment(paymentId) {
    const owner = await getDemoUser();
    return prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
            where: {
                id: paymentId,
                ownerId: owner.id,
            },
        });
        if (!payment) {
            return null;
        }
        await tx.payment.delete({
            where: {
                id: payment.id,
            },
        });
        const invoice = await tx.invoice.findFirst({
            where: {
                id: payment.invoiceId,
                ownerId: owner.id,
            },
            include: {
                payments: true,
            },
        });
        if (!invoice) {
            throw new Error("Associated invoice was not found.");
        }
        const amountPaid = invoice.payments.reduce((sum, item) => sum + Number(item.amount), 0);
        const totalAmount = Number(invoice.totalAmount);
        const balanceDue = Math.max(totalAmount - amountPaid, 0);
        const status = calculateInvoiceStatus(amountPaid, totalAmount, invoice.dueDate);
        const updatedInvoice = await tx.invoice.update({
            where: {
                id: invoice.id,
            },
            data: {
                amountPaid,
                balanceDue,
                status,
            },
            include: {
                customer: true,
                project: true,
                items: true,
                payments: {
                    orderBy: {
                        paidAt: "desc",
                    },
                },
            },
        });
        return updatedInvoice;
    });
}
//# sourceMappingURL=payment.service.js.map