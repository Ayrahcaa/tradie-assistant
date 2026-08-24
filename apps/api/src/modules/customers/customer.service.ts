import { prisma } from "../../lib/prisma.js";

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  businessName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  abn?: string | null;
  notes?: string | null;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export async function createCustomer(ownerId: string, input: CreateCustomerInput) {
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

export async function listCustomers(ownerId: string, includeArchived = false) {
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

export async function getCustomerById(ownerId: string, customerId: string) {
  return prisma.customer.findFirst({
    where: {
      id: customerId,
      ownerId,
    },
  });
}

export async function updateCustomer(
  ownerId: string,
  customerId: string,
  input: UpdateCustomerInput,
) {
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

export async function archiveCustomer(ownerId: string, customerId: string) {
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

export async function restoreCustomer(ownerId: string, customerId: string) {
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

export async function deleteCustomer(ownerId: string, customerId: string) {
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
