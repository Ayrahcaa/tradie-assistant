import { prisma } from "../../lib/prisma.js";
const number = (value) => Number(value ?? 0);
const sum = (items, select) => items.reduce((total, item) => total + select(item), 0);
function projectFinancials(project) {
    const invoices = project.invoices.filter((invoice) => invoice.status !== "CANCELLED");
    const issuedInvoices = invoices.filter((invoice) => invoice.status !== "DRAFT");
    const directExpenses = project.expenses.filter((expense) => expense.category !== "SUBCONTRACTOR");
    const legacySubcontractorExpenses = project.expenses.filter((expense) => expense.category === "SUBCONTRACTOR");
    const subcontractorCosts = project.subcontractorProjectCosts.filter((cost) => cost.status !== "CANCELLED");
    const quotedValue = number(project.quotedValue);
    const invoiceTotal = sum(issuedInvoices, (invoice) => number(invoice.totalAmount));
    const customerPayments = sum(invoices, (invoice) => number(invoice.amountPaid));
    const customerOutstanding = sum(issuedInvoices, (invoice) => number(invoice.balanceDue));
    const expenses = sum(directExpenses, (expense) => number(expense.amount));
    const expensesPaid = sum(directExpenses.filter((expense) => expense.status === "PAID" || expense.paidAt), (expense) => number(expense.amount));
    const subcontractorAgreed = sum(subcontractorCosts, (cost) => number(cost.agreedAmount));
    const subcontractorPaid = sum(subcontractorCosts, (cost) => number(cost.amountPaid));
    const subcontractorOutstanding = sum(subcontractorCosts, (cost) => number(cost.amountPending));
    const excludedLegacySubcontractorExpenses = sum(legacySubcontractorExpenses, (expense) => number(expense.amount));
    const revenueBasis = quotedValue > 0 ? quotedValue : invoiceTotal;
    const estimatedTotalCost = expenses + subcontractorAgreed;
    const estimatedProfit = revenueBasis - estimatedTotalCost;
    const cashPaid = expensesPaid + subcontractorPaid;
    const cashPosition = customerPayments - cashPaid;
    return { quotedValue, revenueBasis, revenueBasisLabel: quotedValue > 0 ? "Quoted value" : "Invoices issued", invoiceTotal, customerPayments, customerOutstanding, expenses, expensesPaid, subcontractorAgreed, subcontractorPaid, subcontractorOutstanding, estimatedTotalCost, estimatedProfit, cashReceived: customerPayments, cashPaid, cashPosition, excludedLegacySubcontractorExpenses };
}
const projectInclude = {
    customer: true,
    quotes: { include: { customer: true }, orderBy: { createdAt: "desc" } },
    invoices: { include: { customer: true, payments: { orderBy: { paidAt: "desc" } } }, orderBy: { issueDate: "desc" } },
    expenses: { include: { receipts: true }, orderBy: { expenseDate: "desc" } },
    subcontractorProjectCosts: { include: { subcontractor: true, payments: { orderBy: { paidAt: "desc" } } }, orderBy: { createdAt: "desc" } },
};
export async function getProjectOverview(ownerId, projectId) {
    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId }, include: projectInclude });
    if (!project)
        return null;
    return { project, financials: projectFinancials(project) };
}
export async function getCustomerOverview(ownerId, customerId) {
    const customer = await prisma.customer.findFirst({
        where: { id: customerId, ownerId },
        include: {
            projects: { orderBy: { createdAt: "desc" } },
            quotes: { include: { project: true }, orderBy: { issueDate: "desc" } },
            invoices: { include: { project: true, payments: { orderBy: { paidAt: "desc" } } }, orderBy: { issueDate: "desc" } },
        },
    });
    if (!customer)
        return null;
    const invoices = customer.invoices.filter((invoice) => invoice.status !== "CANCELLED");
    const issued = invoices.filter((invoice) => invoice.status !== "DRAFT");
    return { customer, financials: { totalInvoiced: sum(issued, (invoice) => number(invoice.totalAmount)), totalPaid: sum(invoices, (invoice) => number(invoice.amountPaid)), outstanding: sum(issued, (invoice) => number(invoice.balanceDue)) } };
}
export async function getBusinessOverview(ownerId) {
    const owner = await prisma.user.findUniqueOrThrow({ where: { id: ownerId } });
    const [projects, invoices, expenses, subcontractorCosts, recentQuotes, recentSubcontractorPayments] = await Promise.all([
        prisma.project.findMany({ where: { ownerId }, include: projectInclude, orderBy: { updatedAt: "desc" } }),
        prisma.invoice.findMany({ where: { ownerId }, include: { customer: true, project: true, payments: true }, orderBy: { createdAt: "desc" } }),
        prisma.expense.findMany({ where: { ownerId }, include: { project: true }, orderBy: { createdAt: "desc" } }),
        prisma.subcontractorProjectCost.findMany({ where: { ownerId }, include: { subcontractor: true, project: true, payments: true }, orderBy: { createdAt: "desc" } }),
        prisma.quote.findMany({ where: { ownerId }, include: { customer: true, project: true }, orderBy: { createdAt: "desc" }, take: 8 }),
        prisma.subcontractorPayment.findMany({ where: { ownerId }, include: { cost: { include: { subcontractor: true, project: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
    ]);
    const liveInvoices = invoices.filter((invoice) => invoice.status !== "CANCELLED");
    const issuedInvoices = liveInvoices.filter((invoice) => invoice.status !== "DRAFT");
    const directExpenses = expenses.filter((expense) => expense.category !== "SUBCONTRACTOR");
    const liveCosts = subcontractorCosts.filter((cost) => cost.status !== "CANCELLED");
    const totalInvoiced = sum(issuedInvoices, (invoice) => number(invoice.totalAmount));
    const paymentsReceived = sum(liveInvoices, (invoice) => number(invoice.amountPaid));
    const customerOutstanding = sum(issuedInvoices, (invoice) => number(invoice.balanceDue));
    const expenseTotal = sum(directExpenses, (expense) => number(expense.amount));
    const expensesPaid = sum(directExpenses.filter((expense) => expense.status === "PAID" || expense.paidAt), (expense) => number(expense.amount));
    const subcontractorCostsTotal = sum(liveCosts, (cost) => number(cost.agreedAmount));
    const subcontractorPaid = sum(liveCosts, (cost) => number(cost.amountPaid));
    const subcontractorOutstanding = sum(liveCosts, (cost) => number(cost.amountPending));
    const estimatedProfit = totalInvoiced - expenseTotal - subcontractorCostsTotal;
    const cashPosition = paymentsReceived - expensesPaid - subcontractorPaid;
    const receivables = issuedInvoices.filter((invoice) => number(invoice.balanceDue) > 0).map((invoice) => ({ id: invoice.id, invoiceNumber: invoice.invoiceNumber, customer: invoice.customer, project: invoice.project, dueDate: invoice.dueDate, status: invoice.status, totalAmount: invoice.totalAmount, amountPaid: invoice.amountPaid, outstanding: invoice.balanceDue })).sort((a, b) => number(b.outstanding) - number(a.outstanding));
    const payables = liveCosts.filter((cost) => number(cost.amountPending) > 0).map((cost) => ({ id: cost.id, subcontractor: cost.subcontractor, project: cost.project, description: cost.description, status: cost.status, agreedAmount: cost.agreedAmount, amountPaid: cost.amountPaid, outstanding: cost.amountPending })).sort((a, b) => number(b.outstanding) - number(a.outstanding));
    const activity = [
        ...projects.map((item) => ({ id: `project-${item.id}`, type: "PROJECT", title: item.name, description: "Project updated", occurredAt: item.updatedAt, path: `/projects/${item.id}` })),
        ...invoices.map((item) => ({ id: `invoice-${item.id}`, type: "INVOICE", title: item.invoiceNumber, description: `${item.customer.firstName} ${item.customer.lastName} · ${number(item.totalAmount)}`, occurredAt: item.createdAt, path: `/invoices/${item.id}` })),
        ...liveInvoices.flatMap((invoice) => invoice.payments.map((payment) => ({ id: `payment-${payment.id}`, type: "PAYMENT", title: `Payment received · ${number(payment.amount)}`, description: invoice.invoiceNumber, occurredAt: payment.createdAt, path: `/invoices/${invoice.id}` }))),
        ...expenses.map((item) => ({ id: `expense-${item.id}`, type: "EXPENSE", title: item.description, description: `${item.supplier ?? "Expense"} · ${number(item.amount)}`, occurredAt: item.createdAt, path: `/expenses/${item.id}` })),
        ...recentSubcontractorPayments.map((item) => ({ id: `subpayment-${item.id}`, type: "SUBCONTRACTOR_PAYMENT", title: `Paid ${item.cost.subcontractor.firstName} · ${number(item.amount)}`, description: item.cost.project.name, occurredAt: item.createdAt, path: `/subcontractors/${item.cost.subcontractorId}` })),
        ...recentQuotes.map((item) => ({ id: `quote-${item.id}`, type: "QUOTE", title: item.quoteNumber, description: item.title, occurredAt: item.createdAt, path: `/quotes/${item.id}` })),
    ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()).slice(0, 10);
    const activeProjects = projects.filter((project) => project.status === "ACTIVE").slice(0, 6).map((project) => ({ id: project.id, name: project.name, clientName: project.clientName, status: project.status, financials: projectFinancials(project) }));
    return { business: { firstName: owner.firstName, businessName: owner.businessName, abn: owner.abn }, kpis: { activeProjects: projects.filter((project) => project.status === "ACTIVE").length, totalInvoiced, paymentsReceived, customerOutstanding, expenses: expenseTotal, expensesPaid, subcontractorCosts: subcontractorCostsTotal, subcontractorPaid, subcontractorOutstanding, estimatedProfit, cashPosition }, receivables, payables, activeProjects, recentActivity: activity, excludedLegacySubcontractorExpenses: sum(expenses.filter((expense) => expense.category === "SUBCONTRACTOR"), (expense) => number(expense.amount)) };
}
//# sourceMappingURL=analytics.service.js.map