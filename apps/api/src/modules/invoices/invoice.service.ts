import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

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
  gstApplicable?: boolean;
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

export function calculateInvoiceTotals(items: InvoiceItemInput[], gstRegistered: boolean) {
  const subtotal = items.reduce((sum, item) => sum.plus(new Prisma.Decimal(item.quantity).times(item.unitPrice)), new Prisma.Decimal(0));
  const taxableSubtotal = gstRegistered ? items.filter((item) => item.gstApplicable !== false).reduce((sum, item) => sum.plus(new Prisma.Decimal(item.quantity).times(item.unitPrice)), new Prisma.Decimal(0)) : new Prisma.Decimal(0);
  const gstAmount = taxableSubtotal.times("0.10").toDecimalPlaces(2);
  const totalAmount = subtotal.plus(gstAmount);

  return {
    subtotal,
    gstAmount,
    totalAmount,
  };
}

async function generateInvoiceNumber(ownerId: string) {
  const year = new Date().getFullYear();

  const count = await prisma.invoice.count({ where: { ownerId } });

  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createInvoice(ownerId: string, input: CreateInvoiceInput) {
  await validateCustomer(input.customerId, ownerId);

  await validateProject(input.projectId, ownerId);

  const owner = await prisma.user.findUniqueOrThrow({ where: { id: ownerId }, select: { gstRegistered: true } });
  const totals = calculateInvoiceTotals(input.items, owner.gstRegistered);

  const invoiceNumber = await generateInvoiceNumber(ownerId);

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

      ownerId,

      items: {
        create: input.items.map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.quantity * item.unitPrice,
          sortOrder: item.sortOrder ?? index,
          gstApplicable: owner.gstRegistered && item.gstApplicable !== false,
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

export async function listInvoices(ownerId: string, status?: InvoiceStatus) {
  const invoices = await prisma.invoice.findMany({
    where: {
      ownerId,
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

export async function getInvoiceById(ownerId: string, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      ownerId,
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
  ownerId: string,
  invoiceId: string,
  input: UpdateInvoiceInput,
) {
  const existing = await getInvoiceById(ownerId, invoiceId);

  if (!existing) {
    return null;
  }

  if (input.customerId) {
    await validateCustomer(input.customerId, ownerId);
  }

  if (input.projectId !== undefined) {
    await validateProject(input.projectId, ownerId);
  }

  const owner = await prisma.user.findUniqueOrThrow({ where: { id: ownerId }, select: { gstRegistered: true } });
  const totals = input.items ? calculateInvoiceTotals(input.items, owner.gstRegistered) : null;

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
            : Prisma.Decimal.max(totalAmount.minus(amountPaid), 0),

        ...(input.items
          ? {
              items: {
                create: input.items.map((item, index) => ({
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  lineTotal: item.quantity * item.unitPrice,
                  sortOrder: item.sortOrder ?? index,
                  gstApplicable: owner.gstRegistered && item.gstApplicable !== false,
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
  ownerId: string,
  invoiceId: string,
  status: InvoiceStatus,
) {
  const invoice = await getInvoiceById(ownerId, invoiceId);

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

export async function deleteInvoice(ownerId: string, invoiceId: string) {
  const invoice = await getInvoiceById(ownerId, invoiceId);

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
