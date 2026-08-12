import { prisma } from "../../lib/prisma.js";

function deriveInvoiceStatus(input: {
  currentStatus: InvoiceStatus;
  totalAmount: number;
  amountPaid: number;
  dueDate: Date | null;
}): InvoiceStatus {
  const { currentStatus, totalAmount, amountPaid, dueDate } = input;

  if (currentStatus === "CANCELLED") {
    return "CANCELLED";
  }

  if (amountPaid >= totalAmount && totalAmount > 0) {
    return "PAID";
  }

  if (amountPaid > 0) {
    return "PARTIALLY_PAID";
  }

  if (currentStatus === "DRAFT") {
    return "DRAFT";
  }

  if (dueDate && dueDate.getTime() < Date.now()) {
    return "OVERDUE";
  }

  return "SENT";
}

type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder?: number;
}

export interface CreateInvoiceInput {
  title: string;
  description?: string | null;
  customerId: string;
  projectId?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  terms?: string | null;
  items: InvoiceItemInput[];
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

async function getDemoUser() {
  const email = process.env.DEMO_USER_EMAIL ?? "demo@tradieassistant.com";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Demo user was not found.");
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

function calculateTotals(items: InvoiceItemInput[]) {
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

async function generateInvoiceNumber() {
  const year = new Date().getFullYear();

  const count = await prisma.invoice.count();

  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createInvoice(input: CreateInvoiceInput) {
  const owner = await getDemoUser();

  await validateCustomer(input.customerId, owner.id);

  await validateProject(input.projectId, owner.id);

  const totals = calculateTotals(input.items);

  const invoiceNumber = await generateInvoiceNumber();

  return prisma.invoice.create({
    data: {
      invoiceNumber,
      title: input.title,
      description: input.description,
      customerId: input.customerId,
      projectId: input.projectId ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      notes: input.notes,
      terms: input.terms,

      subtotal: totals.subtotal,
      gstAmount: totals.gstAmount,
      totalAmount: totals.totalAmount,

      amountPaid: 0,
      balanceDue: totals.totalAmount,

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

export async function listInvoices(status?: InvoiceStatus) {
  const owner = await getDemoUser();

  const invoices = await prisma.invoice.findMany({
    where: {
      ownerId: owner.id,
    },

    include: {
      customer: true,
      project: true,
      items: true,
      payments: {
        orderBy: {
          paidAt: "desc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const updatedInvoices = await Promise.all(
    invoices.map(async (invoice) => {
      const derivedStatus = deriveInvoiceStatus({
        currentStatus: invoice.status,
        totalAmount: Number(invoice.totalAmount),
        amountPaid: Number(invoice.amountPaid),
        dueDate: invoice.dueDate,
      });

      if (derivedStatus === invoice.status) {
        return invoice;
      }

      return prisma.invoice.update({
        where: {
          id: invoice.id,
        },

        data: {
          status: derivedStatus,
        },

        include: {
          customer: true,
          project: true,
          items: true,
          payments: {
            orderBy: {
              paidAt: "desc",
            },
          },
        },
      });
    }),
  );

  return status
    ? updatedInvoices.filter((invoice) => invoice.status === status)
    : updatedInvoices;
}

export async function getInvoiceById(invoiceId: string) {
  const owner = await getDemoUser();

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
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

      payments: {
        orderBy: {
          paidAt: "desc",
        },
      },
    },
  });

  if (!invoice) {
    return null;
  }

  const derivedStatus = deriveInvoiceStatus({
    currentStatus: invoice.status,
    totalAmount: Number(invoice.totalAmount),
    amountPaid: Number(invoice.amountPaid),
    dueDate: invoice.dueDate,
  });

  if (derivedStatus === invoice.status) {
    return invoice;
  }

  return prisma.invoice.update({
    where: {
      id: invoice.id,
    },

    data: {
      status: derivedStatus,
    },

    include: {
      customer: true,
      project: true,

      items: {
        orderBy: {
          sortOrder: "asc",
        },
      },

      payments: {
        orderBy: {
          paidAt: "desc",
        },
      },
    },
  });
}

export async function updateInvoice(
  invoiceId: string,
  input: UpdateInvoiceInput,
) {
  const owner = await getDemoUser();

  const existing = await getInvoiceById(invoiceId);

  if (!existing) {
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
      await tx.invoiceItem.deleteMany({
        where: {
          invoiceId,
        },
      });
    }

    const totalAmount = totals?.totalAmount;

    const amountPaid = Number(existing.amountPaid);

    return tx.invoice.update({
      where: {
        id: invoiceId,
      },

      data: {
        title: input.title,

        description: input.description,

        customerId: input.customerId,

        projectId: input.projectId,

        dueDate:
          input.dueDate === undefined
            ? undefined
            : input.dueDate
              ? new Date(input.dueDate)
              : null,

        notes: input.notes,

        terms: input.terms,

        subtotal: totals?.subtotal,

        gstAmount: totals?.gstAmount,

        totalAmount,

        balanceDue:
          totalAmount === undefined
            ? undefined
            : Math.max(totalAmount - amountPaid, 0),

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

export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
) {
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    return null;
  }

  return prisma.invoice.update({
    where: {
      id: invoiceId,
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

export async function deleteInvoice(invoiceId: string) {
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    return false;
  }

  await prisma.invoice.delete({
    where: {
      id: invoiceId,
    },
  });

  return true;
}
