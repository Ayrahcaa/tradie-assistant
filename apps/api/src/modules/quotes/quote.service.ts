import { prisma } from "../../lib/prisma.js";

type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface QuoteItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder?: number;
}

export interface CreateQuoteInput {
  title: string;
  description?: string | null;
  customerId: string;
  projectId?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  terms?: string | null;
  items: QuoteItemInput[];
}

export type UpdateQuoteInput = Partial<CreateQuoteInput>;

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

async function validateCustomer(customerId: string, ownerId: string) {
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

async function validateProject(
  projectId: string | null | undefined,
  ownerId: string,
) {
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

function calculateTotals(items: QuoteItemInput[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const gstAmount = subtotal * 0.1;
  const totalAmount = subtotal + gstAmount;

  return {
    subtotal,
    gstAmount,
    totalAmount,
  };
}

async function generateQuoteNumber() {
  const year = new Date().getFullYear();

  const count = await prisma.quote.count();

  return `Q-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createQuote(input: CreateQuoteInput) {
  const owner = await getDemoUser();

  await validateCustomer(input.customerId, owner.id);

  await validateProject(input.projectId, owner.id);

  const quoteNumber = await generateQuoteNumber();

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
      ownerId: owner.id,

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

export async function listQuotes(status?: QuoteStatus) {
  const owner = await getDemoUser();

  return prisma.quote.findMany({
    where: {
      ownerId: owner.id,
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

export async function getQuoteById(quoteId: string) {
  const owner = await getDemoUser();

  return prisma.quote.findFirst({
    where: {
      id: quoteId,
      ownerId: owner.id,
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

export async function updateQuote(quoteId: string, input: UpdateQuoteInput) {
  const owner = await getDemoUser();

  const existingQuote = await getQuoteById(quoteId);

  if (!existingQuote) {
    return null;
  }

  if (input.customerId) {
    await validateCustomer(input.customerId, owner.id);
  }

  if (input.projectId !== undefined) {
    await validateProject(input.projectId, owner.id);
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
        expiryDate:
          input.expiryDate === undefined
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

export async function updateQuoteStatus(quoteId: string, status: QuoteStatus) {
  const quote = await getQuoteById(quoteId);

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

export async function deleteQuote(quoteId: string) {
  const quote = await getQuoteById(quoteId);

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
