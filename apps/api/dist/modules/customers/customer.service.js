import { prisma } from "../../lib/prisma.js";
async function getDemoUser() {
    const email = process.env.DEMO_USER_EMAIL ?? "demo@tradieassistant.com";
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        throw new Error("Demo user was not found. Run npm run seed in apps/api.");
    }
    return user;
}
export async function createCustomer(input) {
    const owner = await getDemoUser();
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
            ownerId: owner.id,
        },
    });
}
export async function listCustomers(includeArchived = false) {
    const owner = await getDemoUser();
    return prisma.customer.findMany({
        where: {
            ownerId: owner.id,
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
export async function getCustomerById(customerId) {
    const owner = await getDemoUser();
    return prisma.customer.findFirst({
        where: {
            id: customerId,
            ownerId: owner.id,
        },
    });
}
export async function updateCustomer(customerId, input) {
    const customer = await getCustomerById(customerId);
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
export async function archiveCustomer(customerId) {
    const customer = await getCustomerById(customerId);
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
export async function restoreCustomer(customerId) {
    const customer = await getCustomerById(customerId);
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
export async function deleteCustomer(customerId) {
    const customer = await getCustomerById(customerId);
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