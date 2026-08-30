import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

type ExpenseCategory =
  | "MATERIALS"
  | "TOOLS"
  | "FUEL"
  | "VEHICLE"
  | "SUBCONTRACTOR"
  | "EQUIPMENT_HIRE"
  | "INSURANCE"
  | "PHONE_INTERNET"
  | "OFFICE"
  | "TRAVEL"
  | "OTHER";

type ExpenseStatus = "PAID" | "PENDING" | "OVERDUE";

export interface CreateExpenseInput {
  description: string;
  supplier?: string | null;
  category: ExpenseCategory;
  status?: ExpenseStatus;
  amount: number;
  gstAmount?: number;
  gstTreatment?: "GST_INCLUDED" | "GST_FREE" | "MANUAL" | "NOT_CLAIMABLE" | "UNKNOWN";
  gstClaimable?: boolean;
  expenseDate: string;
  dueDate?: string | null;
  paidAt?: string | null;
  projectId?: string | null;
  notes?: string | null;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export function calculateExpenseGst(amount: number, treatment: CreateExpenseInput["gstTreatment"], manualAmount = 0) {
  const gross = new Prisma.Decimal(amount);
  if (treatment === "GST_INCLUDED") return gross.dividedBy(11).toDecimalPlaces(2);
  if (treatment === "MANUAL") return Prisma.Decimal.min(new Prisma.Decimal(manualAmount), gross).toDecimalPlaces(2);
  return new Prisma.Decimal(0);
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

function deriveExpenseStatus(input: {
  requestedStatus?: ExpenseStatus;
  dueDate?: Date | null;
  paidAt?: Date | null;
}): ExpenseStatus {
  if (input.paidAt) {
    return "PAID";
  }

  if (input.dueDate && input.dueDate.getTime() < Date.now()) {
    return "OVERDUE";
  }

  return input.requestedStatus ?? "PENDING";
}

export async function createExpense(ownerId: string, input: CreateExpenseInput) {
  await validateProject(input.projectId, ownerId);

  const dueDate = input.dueDate ? new Date(input.dueDate) : null;

  const paidAt = input.paidAt ? new Date(input.paidAt) : null;

  const status = deriveExpenseStatus({
    requestedStatus: input.status,
    dueDate,
    paidAt,
  });
  const owner = await prisma.user.findUniqueOrThrow({ where: { id: ownerId }, select: { gstRegistered: true } });
  const treatment = input.gstTreatment ?? "UNKNOWN";
  const gstClaimable = owner.gstRegistered && input.gstClaimable === true && !["UNKNOWN", "GST_FREE", "NOT_CLAIMABLE"].includes(treatment);
  const gstAmount = gstClaimable ? calculateExpenseGst(input.amount, treatment, input.gstAmount) : new Prisma.Decimal(0);

  return prisma.expense.create({
    data: {
      description: input.description,
      supplier: input.supplier,
      category: input.category,
      status,
      amount: input.amount,
      gstAmount,
      gstTreatment: treatment,
      gstClaimable,
      expenseDate: new Date(input.expenseDate),
      dueDate,
      paidAt,
      projectId: input.projectId ?? null,
      notes: input.notes,
      ownerId,
    },

    include: {
      project: true,
      receipts: true,
    },
  });
}

export async function listExpenses(ownerId: string, status?: ExpenseStatus) {
  const expenses = await prisma.expense.findMany({
    where: {
      ownerId,
    },

    include: {
      project: true,
      receipts: true,
    },

    orderBy: {
      expenseDate: "desc",
    },
  });

  const updated = await Promise.all(
    expenses.map(async (expense) => {
      const derivedStatus = deriveExpenseStatus({
        requestedStatus: expense.status,
        dueDate: expense.dueDate,
        paidAt: expense.paidAt,
      });

      if (derivedStatus === expense.status) {
        return expense;
      }

      return prisma.expense.update({
        where: {
          id: expense.id,
        },

        data: {
          status: derivedStatus,
        },

        include: {
          project: true,
          receipts: true,
        },
      });
    }),
  );

  return status
    ? updated.filter((expense) => expense.status === status)
    : updated;
}

export async function getExpenseById(ownerId: string, expenseId: string) {
  return prisma.expense.findFirst({
    where: {
      id: expenseId,
      ownerId,
    },

    include: {
      project: true,
      receipts: true,
    },
  });
}

export async function updateExpense(
  ownerId: string,
  expenseId: string,
  input: UpdateExpenseInput,
) {
  const existing = await getExpenseById(ownerId, expenseId);

  if (!existing) {
    return null;
  }

  if (input.projectId !== undefined) {
    await validateProject(input.projectId, ownerId);
  }

  const dueDate =
    input.dueDate === undefined
      ? undefined
      : input.dueDate
        ? new Date(input.dueDate)
        : null;

  const paidAt =
    input.paidAt === undefined
      ? undefined
      : input.paidAt
        ? new Date(input.paidAt)
        : null;

  const status = deriveExpenseStatus({
    requestedStatus: input.status ?? existing.status,

    dueDate: dueDate === undefined ? existing.dueDate : dueDate,

    paidAt: paidAt === undefined ? existing.paidAt : paidAt,
  });
  const owner = await prisma.user.findUniqueOrThrow({ where: { id: ownerId }, select: { gstRegistered: true } });
  const treatment = input.gstTreatment ?? existing.gstTreatment;
  const requestedClaimable = input.gstClaimable ?? existing.gstClaimable;
  const gstClaimable = owner.gstRegistered && requestedClaimable && !["UNKNOWN", "GST_FREE", "NOT_CLAIMABLE"].includes(treatment);
  const amount = input.amount ?? Number(existing.amount);
  const gstAmount = gstClaimable ? calculateExpenseGst(amount, treatment, input.gstAmount ?? Number(existing.gstAmount)) : new Prisma.Decimal(0);

  return prisma.expense.update({
    where: {
      id: expenseId,
    },

    data: {
      description: input.description,
      supplier: input.supplier,
      category: input.category,
      status,
      amount: input.amount,
      gstAmount,
      gstTreatment: treatment,
      gstClaimable,

      expenseDate:
        input.expenseDate === undefined
          ? undefined
          : new Date(input.expenseDate),

      dueDate,
      paidAt,
      projectId: input.projectId,
      notes: input.notes,
    },

    include: {
      project: true,
      receipts: true,
    },
  });
}

export async function deleteExpense(ownerId: string, expenseId: string) {
  const expense = await getExpenseById(ownerId, expenseId);

  if (!expense) {
    return false;
  }

  await prisma.expense.delete({
    where: {
      id: expenseId,
    },
  });

  return true;
}
