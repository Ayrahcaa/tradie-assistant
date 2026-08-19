import { prisma } from "../../lib/prisma.js";

import type {
  CreateSubcontractorInput,
  UpdateSubcontractorInput,
} from "./subcontractor.schema.js";

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

export async function createSubcontractor(input: CreateSubcontractorInput) {
  const owner = await getDemoUser();

  return prisma.subcontractor.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      businessName: input.businessName,
      abn: input.abn,
      email: input.email,
      phone: input.phone,
      address: input.address,
      notes: input.notes,
      isArchived: input.isArchived ?? false,
      ownerId: owner.id,
    },
  });
}

export async function listSubcontractors(includeArchived = false) {
  const owner = await getDemoUser();

  return prisma.subcontractor.findMany({
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

export async function getSubcontractorById(subcontractorId: string) {
  const owner = await getDemoUser();

  return prisma.subcontractor.findFirst({
    where: {
      id: subcontractorId,
      ownerId: owner.id,
    },
  });
}

export async function updateSubcontractor(
  subcontractorId: string,
  input: UpdateSubcontractorInput,
) {
  const existing = await getSubcontractorById(subcontractorId);

  if (!existing) {
    return null;
  }

  return prisma.subcontractor.update({
    where: {
      id: subcontractorId,
    },

    data: input,
  });
}

export async function archiveSubcontractor(subcontractorId: string) {
  return updateSubcontractor(subcontractorId, {
    isArchived: true,
  });
}

export async function restoreSubcontractor(subcontractorId: string) {
  return updateSubcontractor(subcontractorId, {
    isArchived: false,
  });
}

export async function deleteSubcontractor(subcontractorId: string) {
  const existing = await getSubcontractorById(subcontractorId);

  if (!existing) {
    return false;
  }

  await prisma.subcontractor.delete({
    where: {
      id: subcontractorId,
    },
  });

  return true;
}
