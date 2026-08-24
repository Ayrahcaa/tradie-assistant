import { prisma } from "../../lib/prisma.js";

type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  clientName?: string | null;
  address?: string | null;
  quotedValue?: number | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  customerId?: string | null;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

function parseDate(value?: string | null): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return new Date(value);
}

async function validateCustomer(
  customerId: string | null | undefined,
  ownerId: string,
) {
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

export async function createProject(ownerId: string, input: CreateProjectInput) {
  const customer = await validateCustomer(input.customerId, ownerId);

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
      ownerId,
    },

    include: {
      customer: true,
    },
  });
}

export async function listProjects(ownerId: string, status?: ProjectStatus) {
  return prisma.project.findMany({
    where: {
      ownerId,
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

export async function getProjectById(ownerId: string, projectId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
    include: {
      customer: true,
    },
  });
}

export async function updateProject(
  ownerId: string,
  projectId: string,
  input: UpdateProjectInput,
) {
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
  });

  if (!existingProject) {
    return null;
  }

  let customer: Awaited<ReturnType<typeof validateCustomer>> | undefined;

  if (input.customerId !== undefined) {
    customer = await validateCustomer(input.customerId, ownerId);
  }

  return prisma.project.update({
    where: {
      id: projectId,
    },

    data: {
      name: input.name,
      description: input.description,

      customerId:
        input.customerId === undefined ? undefined : (customer?.id ?? null),

      clientName:
        input.customerId === undefined
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

export async function archiveProject(ownerId: string, projectId: string) {
  const existingProject = await getProjectById(ownerId, projectId);

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

export async function deleteProject(ownerId: string, projectId: string) {
  const existingProject = await getProjectById(ownerId, projectId);

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
