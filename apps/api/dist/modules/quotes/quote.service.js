import { prisma } from "../../lib/prisma.js";
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
async function generateQuoteNumber(ownerId) {
    const year = new Date().getFullYear();
    const count = await prisma.quote.count({ where: { ownerId } });
    return `Q-${year}-${String(count + 1).padStart(4, "0")}`;
}
export async function createQuote(ownerId, input) {
    await validateCustomer(input.customerId, ownerId);
    await validateProject(input.projectId, ownerId);
    const quoteNumber = await generateQuoteNumber(ownerId);
    const totals = calculateTotals(input.items);
    return prisma.quote.create({
        data: {
            quoteNumber,
            title: input.title,
            description: input.description,
            customerId: input.customerId,
            projectId: input.projectId ?? null,
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
            notes: input.notes,
            terms: input.terms,
            subtotal: totals.subtotal,
            gstAmount: totals.gstAmount,
            totalAmount: totals.totalAmount,
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
export async function listQuotes(ownerId, status) {
    return prisma.quote.findMany({
        where: {
            ownerId,
            ...(status ? { status } : {}),
        },
        include: {
            customer: true,
            project: true,
            items: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
export async function getQuoteById(ownerId, quoteId) {
    return prisma.quote.findFirst({
        where: {
            id: quoteId,
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
        },
    });
}
export async function updateQuote(ownerId, quoteId, input) {
    const existingQuote = await getQuoteById(ownerId, quoteId);
    if (!existingQuote) {
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
            await tx.quoteItem.deleteMany({
                where: {
                    quoteId,
                },
            });
        }
        return tx.quote.update({
            where: {
                id: quoteId,
            },
            data: {
                title: input.title,
                description: input.description,
                customerId: input.customerId,
                projectId: input.projectId,
                expiryDate: input.expiryDate === undefined
                    ? undefined
                    : input.expiryDate
                        ? new Date(input.expiryDate)
                        : null,
                notes: input.notes,
                terms: input.terms,
                subtotal: totals?.subtotal,
                gstAmount: totals?.gstAmount,
                totalAmount: totals?.totalAmount,
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
export async function updateQuoteStatus(ownerId, quoteId, status) {
    const quote = await getQuoteById(ownerId, quoteId);
    if (!quote) {
        return null;
    }
    return prisma.quote.update({
        where: {
            id: quoteId,
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
export async function deleteQuote(ownerId, quoteId) {
    const quote = await getQuoteById(ownerId, quoteId);
    if (!quote) {
        return false;
    }
    await prisma.quote.delete({
        where: {
            id: quoteId,
        },
    });
    return true;
}
//# sourceMappingURL=quote.service.js.map