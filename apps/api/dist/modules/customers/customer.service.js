import { prisma } from "../../lib/prisma.js";
export async function createCustomer(ownerId, input) {
    return prisma.customer.create({
        data: {
            firstName: input.firstName,
            lastName: input.lastName,
            businessName: input.businessName,
            email: input.email,
            phone: input.phone,
            address: input.address,
            abn: input.abn,
            notes: input.notes,
            ownerId,
        },
    });
}
export async function listCustomers(ownerId, includeArchived = false) {
    return prisma.customer.findMany({
        where: {
            ownerId,
            ...(includeArchived
                ? {}
                : {
                    isArchived: false,
                }),
        },
        orderBy: [
            {
                firstName: "asc",
            },
            {
                lastName: "asc",
            },
        ],
    });
}
export async function getCustomerById(ownerId, customerId) {
    return prisma.customer.findFirst({
        where: {
            id: customerId,
            ownerId,
        },
    });
}
export async function updateCustomer(ownerId, customerId, input) {
    const customer = await getCustomerById(ownerId, customerId);
    if (!customer) {
        return null;
    }
    return prisma.customer.update({
        where: {
            id: customerId,
        },
        data: {
            firstName: input.firstName,
            lastName: input.lastName,
            businessName: input.businessName,
            email: input.email,
            phone: input.phone,
            address: input.address,
            abn: input.abn,
            notes: input.notes,
        },
    });
}
export async function archiveCustomer(ownerId, customerId) {
    const customer = await getCustomerById(ownerId, customerId);
    if (!customer) {
        return null;
    }
    return prisma.customer.update({
        where: {
            id: customerId,
        },
        data: {
            isArchived: true,
        },
    });
}
export async function restoreCustomer(ownerId, customerId) {
    const customer = await getCustomerById(ownerId, customerId);
    if (!customer) {
        return null;
    }
    return prisma.customer.update({
        where: {
            id: customerId,
        },
        data: {
            isArchived: false,
        },
    });
}
export async function deleteCustomer(ownerId, customerId) {
    const customer = await getCustomerById(ownerId, customerId);
    if (!customer) {
        return false;
    }
    await prisma.customer.delete({
        where: {
            id: customerId,
        },
    });
    return true;
}
//# sourceMappingURL=customer.service.js.map