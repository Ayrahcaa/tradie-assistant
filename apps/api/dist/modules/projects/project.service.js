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
export async function createProject(input) {
    const owner = await getDemoUser();
    return prisma.project.create({
        data: {
            name: input.name,
            description: input.description,
            clientName: input.clientName,
            address: input.address,
            quotedValue: input.quotedValue,
            status: input.status ?? "ACTIVE",
            startDate: parseDate(input.startDate),
            endDate: parseDate(input.endDate),
            ownerId: owner.id,
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
    });
}
export async function updateProject(projectId, input) {
    const existingProject = await getProjectById(projectId);
    if (!existingProject) {
        return null;
    }
    return prisma.project.update({
        where: {
            id: projectId,
        },
        data: {
            name: input.name,
            description: input.description,
            clientName: input.clientName,
            address: input.address,
            quotedValue: input.quotedValue,
            status: input.status,
            startDate: parseDate(input.startDate),
            endDate: parseDate(input.endDate),
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