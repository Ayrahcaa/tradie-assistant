import { prisma } from "../../lib/prisma.js";
function deriveInvoiceStatus(input) {
    const { currentStatus, totalAmount, amountPaid, dueDate } = input;
    if (currentStatus === "CANCELLED") {
        return "CANCELLED";
    }
    if (amountPaid >= totalAmount && totalAmount > 0) {
        return "PAID";
    }
    if (amountPaid > 0) {
        return "PARTIALLY_PAID";
    }
    if (currentStatus === "DRAFT") {
        return "DRAFT";
    }
    if (dueDate && dueDate.getTime() < Date.now()) {
        return "OVERDUE";
    }
    return "SENT";
}
async function validateCustomer(customerId, ownerId) {
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
function calculateTotals(items) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const gstAmount = subtotal * 0.1;
    const totalAmount = subtotal + gstAmount;
    return {
        subtotal,
        gstAmount,
        totalAmount,
    };
}
async function generateInvoiceNumber(ownerId) {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({ where: { ownerId } });
    return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}
export async function createInvoice(ownerId, input) {
    await validateCustomer(input.customerId, ownerId);
    await validateProject(input.projectId, ownerId);
    const totals = calculateTotals(input.items);
    const invoiceNumber = await generateInvoiceNumber(ownerId);
    return prisma.invoice.create({
        data: {
            invoiceNumber,
            title: input.title,
            description: input.description,
            customerId: input.customerId,
            projectId: input.projectId ?? null,
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            notes: input.notes,
            terms: input.terms,
            subtotal: totals.subtotal,
            gstAmount: totals.gstAmount,
            totalAmount: totals.totalAmount,
            amountPaid: 0,
            balanceDue: totals.totalAmount,
            ownerId,
            items: {
                create: input.items.map((item, index) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal: item.quantity * item.unitPrice,
                    sortOrder: item.sortOrder ?? index,
                })),
            },
        },
        include: {
            customer: true,
            project: true,
            items: {
                orderBy: {
                    sortOrder: "asc",
                },
            },
        },
    });
}
export async function listInvoices(ownerId, status) {
    const invoices = await prisma.invoice.findMany({
        where: {
            ownerId,
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
        orderBy: {
            createdAt: "desc",
        },
    });
    const updatedInvoices = await Promise.all(invoices.map(async (invoice) => {
        const derivedStatus = deriveInvoiceStatus({
            currentStatus: invoice.status,
            totalAmount: Number(invoice.totalAmount),
            amountPaid: Number(invoice.amountPaid),
            dueDate: invoice.dueDate,
        });
        if (derivedStatus === invoice.status) {
            return invoice;
        }
        return prisma.invoice.update({
            where: {
                id: invoice.id,
            },
            data: {
                status: derivedStatus,
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
    }));
    return status
        ? updatedInvoices.filter((invoice) => invoice.status === status)
        : updatedInvoices;
}
export async function getInvoiceById(ownerId, invoiceId) {
    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            ownerId,
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
    if (!invoice) {
        return null;
    }
    const derivedStatus = deriveInvoiceStatus({
        currentStatus: invoice.status,
        totalAmount: Number(invoice.totalAmount),
        amountPaid: Number(invoice.amountPaid),
        dueDate: invoice.dueDate,
    });
    if (derivedStatus === invoice.status) {
        return invoice;
    }
    return prisma.invoice.update({
        where: {
            id: invoice.id,
        },
        data: {
            status: derivedStatus,
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
}
export async function updateInvoice(ownerId, invoiceId, input) {
    const existing = await getInvoiceById(ownerId, invoiceId);
    if (!existing) {
        return null;
    }
    if (input.customerId) {
        await validateCustomer(input.customerId, ownerId);
    }
    if (input.projectId !== undefined) {
        await validateProject(input.projectId, ownerId);
    }
    const totals = input.items ? calculateTotals(input.items) : null;
    return prisma.$transaction(async (tx) => {
        if (input.items) {
            await tx.invoiceItem.deleteMany({
                where: {
                    invoiceId,
                },
            });
        }
        const totalAmount = totals?.totalAmount;
        const amountPaid = Number(existing.amountPaid);
        return tx.invoice.update({
            where: {
                id: invoiceId,
            },
            data: {
                title: input.title,
                description: input.description,
                customerId: input.customerId,
                projectId: input.projectId,
                dueDate: input.dueDate === undefined
                    ? undefined
                    : input.dueDate
                        ? new Date(input.dueDate)
                        : null,
                notes: input.notes,
                terms: input.terms,
                subtotal: totals?.subtotal,
                gstAmount: totals?.gstAmount,
                totalAmount,
                balanceDue: totalAmount === undefined
                    ? undefined
                    : Math.max(totalAmount - amountPaid, 0),
                ...(input.items
                    ? {
                        items: {
                            create: input.items.map((item, index) => ({
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                lineTotal: item.quantity * item.unitPrice,
                                sortOrder: item.sortOrder ?? index,
                            })),
                        },
                    }
                    : {}),
            },
            include: {
                customer: true,
                project: true,
                items: {
                    orderBy: {
                        sortOrder: "asc",
                    },
                },
            },
        });
    });
}
export async function updateInvoiceStatus(ownerId, invoiceId, status) {
    const invoice = await getInvoiceById(ownerId, invoiceId);
    if (!invoice) {
        return null;
    }
    return prisma.invoice.update({
        where: {
            id: invoiceId,
        },
        data: {
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
        },
    });
}
export async function deleteInvoice(ownerId, invoiceId) {
    const invoice = await getInvoiceById(ownerId, invoiceId);
    if (!invoice) {
        return false;
    }
    await prisma.invoice.delete({
        where: {
            id: invoiceId,
        },
    });
    return true;
}
//# sourceMappingURL=invoice.service.js.map