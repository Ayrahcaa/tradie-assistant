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
export async function createProject(input) {
    const owner = await getDemoUser();
    const customer = await validateCustomer(input.customerId, owner.id);
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
            ownerId: owner.id,
        },
        include: {
            customer: true,
        },
    });
}
export async function listProjects(status) {
    const owner = await getDemoUser();
    return prisma.project.findMany({
        where: {
            ownerId: owner.id,
            ...(status ? { status } : {}),
        },
        include: {
            customer: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
export async function getProjectById(projectId) {
    const owner = await getDemoUser();
    return prisma.project.findFirst({
        where: {
            id: projectId,
            ownerId: owner.id,
        },
        include: {
            customer: true,
        },
    });
}
export async function updateProject(projectId, input) {
    const owner = await getDemoUser();
    const existingProject = await prisma.project.findFirst({
        where: {
            id: projectId,
            ownerId: owner.id,
        },
    });
    if (!existingProject) {
        return null;
    }
    let customer;
    if (input.customerId !== undefined) {
        customer = await validateCustomer(input.customerId, owner.id);
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
export async function archiveProject(projectId) {
    const existingProject = await getProjectById(projectId);
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
export async function deleteProject(projectId) {
    const existingProject = await getProjectById(projectId);
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