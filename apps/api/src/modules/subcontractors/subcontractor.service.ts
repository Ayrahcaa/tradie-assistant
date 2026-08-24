import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";

import type {
  CreateSubcontractorInput,
  UpdateSubcontractorInput,
} from "./subcontractor.schema.js";

export async function createSubcontractor(ownerId: string, input: CreateSubcontractorInput) {
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
      ownerId,
    },
  });
}

export async function listSubcontractors(ownerId: string, includeArchived = false) {
  return prisma.subcontractor.findMany({
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

export async function getSubcontractorById(ownerId: string, subcontractorId: string) {
  return prisma.subcontractor.findFirst({
    where: {
      id: subcontractorId,
      ownerId,
    },
  });
}

export async function updateSubcontractor(
  ownerId: string,
  subcontractorId: string,
  input: UpdateSubcontractorInput,
) {
  const existing = await getSubcontractorById(ownerId, subcontractorId);

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

export async function archiveSubcontractor(ownerId: string, subcontractorId: string) {
  return updateSubcontractor(ownerId, subcontractorId, {
    isArchived: true,
  });
}

export async function restoreSubcontractor(ownerId: string, subcontractorId: string) {
  return updateSubcontractor(ownerId, subcontractorId, {
    isArchived: false,
  });
}

export async function deleteSubcontractor(ownerId: string, subcontractorId: string) {
  const existing = await getSubcontractorById(ownerId, subcontractorId);

  if (!existing) {
    return false;
  }

  const costCount = await prisma.subcontractorProjectCost.count({
    where: { subcontractorId, ownerId: existing.ownerId },
  });

  if (costCount > 0) {
    throw new HttpError(
      409,
      "This subcontractor has project work history. Archive them instead of deleting the financial record.",
    );
  }

  await prisma.subcontractor.delete({
    where: {
      id: subcontractorId,
    },
  });

  return true;
}
