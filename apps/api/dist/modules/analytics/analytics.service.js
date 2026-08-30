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
    const estimatedMargin = revenueBasis > 0 ? (estimatedProfit / revenueBasis) * 100 : 0;
    const quoteEstimate = sum((project.quotes ?? []).filter((quote) => quote.status === "ACCEPTED"), (quote) => number(quote.totalAmount));
    const estimateVsActual = { estimatedRevenue: quoteEstimate || quotedValue, committedRevenue: invoiceTotal, revenueVariance: invoiceTotal - (quoteEstimate || quotedValue), estimatedCostAllowance: Math.max((quoteEstimate || quotedValue) - estimatedProfit, 0), actualCommittedCost: estimatedTotalCost };
    const messages = [
        estimatedProfit >= 0 ? `You're currently on track to make $${estimatedProfit.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from this project.` : `This project is currently tracking $${Math.abs(estimatedProfit).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} below break-even.`,
        customerOutstanding > 0 ? `$${customerOutstanding.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} is still outstanding from the customer.` : "Customer invoices issued are fully paid.",
        subcontractorOutstanding > 0 ? `You still owe subcontractors $${subcontractorOutstanding.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.` : "No subcontractor balance is outstanding.",
    ];
    const missingReceipts = project.expenses.filter((expense) => !(expense.receipts?.length)).length;
    const completionChecklist = [
        { key: "invoiced", ok: invoiceTotal >= revenueBasis && revenueBasis > 0, label: invoiceTotal >= revenueBasis && revenueBasis > 0 ? "Customer fully invoiced" : "Project value may not be fully invoiced" },
        { key: "customerOutstanding", ok: customerOutstanding === 0, label: customerOutstanding === 0 ? "Customer invoices are paid" : `Customer still owes $${customerOutstanding.toFixed(2)}` },
        { key: "expenses", ok: directExpenses.length > 0, label: directExpenses.length > 0 ? "Expenses recorded" : "No project expenses recorded" },
        { key: "receipts", ok: missingReceipts === 0, label: missingReceipts === 0 ? "Expense documentation attached" : `${missingReceipts} expenses are missing receipts` },
        { key: "subcontractors", ok: subcontractorOutstanding === 0, label: subcontractorOutstanding === 0 ? "Subcontractors fully paid" : `$${subcontractorOutstanding.toFixed(2)} still owed to subcontractors` },
        { key: "quote", ok: (project.quotes?.length ?? 0) > 0, label: (project.quotes?.length ?? 0) > 0 ? "Quote exists" : "No quote linked" },
    ];
    return { quotedValue, revenueBasis, revenueBasisLabel: quotedValue > 0 ? "Quoted value" : "Invoices issued", invoiceTotal, customerPayments, customerOutstanding, expenses, expensesPaid, subcontractorAgreed, subcontractorPaid, subcontractorOutstanding, estimatedTotalCost, estimatedProfit, estimatedMargin, cashReceived: customerPayments, cashPaid, cashPosition, excludedLegacySubcontractorExpenses, estimateVsActual, messages, completionChecklist };
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
        prisma.expense.findMany({ where: { ownerId }, include: { project: true, receipts: true }, orderBy: { createdAt: "desc" } }),
        prisma.subcontractorProjectCost.findMany({ where: { ownerId }, include: { subcontractor: true, project: true, payments: true }, orderBy: { createdAt: "desc" } }),
        prisma.quote.findMany({ where: { ownerId }, include: { customer: true, project: true }, orderBy: { createdAt: "desc" }, take: 8 }),
        prisma.subcontractorPayment.findMany({ where: { ownerId }, include: { cost: { include: { subcontractor: true, project: true } } }, orderBy: { createdAt: "desc" } }),
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
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;
    const currentMonthKey = `${year}-${month}`;
    const previousMonthDate = new Date(year, month - 1, 1);
    const previousMonthKey = monthKey(previousMonthDate);
    const paymentRevenue = liveInvoices.flatMap((invoice) => invoice.payments);
    const directExpenseFor = (key) => sum(directExpenses.filter((expense) => monthKey(expense.expenseDate) === key), (expense) => number(expense.amount));
    const subcontractorOutFor = (key) => sum(recentSubcontractorPayments.filter((payment) => monthKey(payment.paidAt) === key), (payment) => number(payment.amount));
    const revenueFor = (key) => sum(paymentRevenue.filter((payment) => monthKey(payment.paidAt) === key), (payment) => number(payment.amount));
    const monthlyTrend = Array.from({ length: 12 }, (_, index) => {
        const date = new Date(year, index, 1);
        const key = monthKey(date);
        const revenue = revenueFor(key);
        const expensesForMonth = directExpenseFor(key) + subcontractorOutFor(key);
        return { month: date.toLocaleString("en-AU", { month: "short" }), monthIndex: index, revenue, expenses: expensesForMonth, profit: revenue - expensesForMonth, kind: index <= month ? "ACTUAL" : "PROJECTED" };
    });
    const reportTrend = Array.from({ length: 24 }, (_, index) => {
        const date = new Date(year - 1, index, 1);
        const key = monthKey(date);
        const revenue = revenueFor(key);
        const expensesForMonth = directExpenseFor(key) + subcontractorOutFor(key);
        return { month: date.toLocaleString("en-AU", { month: "short" }), monthIndex: date.getMonth(), year: date.getFullYear(), revenue, expenses: expensesForMonth, profit: revenue - expensesForMonth, kind: date <= now ? "ACTUAL" : "PROJECTED" };
    });
    const actualMonths = monthlyTrend.slice(0, month + 1);
    const ytdRevenue = sum(actualMonths, (item) => item.revenue);
    const ytdExpenses = sum(actualMonths, (item) => item.expenses);
    const previousYearRevenue = sum(paymentRevenue.filter((payment) => payment.paidAt.getFullYear() === year - 1), (payment) => number(payment.amount));
    const recentMonths = actualMonths.slice(-Math.min(6, actualMonths.length)).filter((item) => item.revenue > 0);
    const recentAverage = recentMonths.length ? sum(recentMonths, (item) => item.revenue) / recentMonths.length : ytdRevenue / Math.max(month + 1, 1);
    const projectedMonths = monthlyTrend.map((item) => item.monthIndex > month ? { ...item, revenue: recentAverage, profit: recentAverage - item.expenses } : item);
    const projectedRevenue = ytdRevenue + recentAverage * (11 - month);
    const revenueThisMonth = revenueFor(currentMonthKey);
    const revenueLastMonth = revenueFor(previousMonthKey);
    const expensesThisMonth = directExpenseFor(currentMonthKey) + subcontractorOutFor(currentMonthKey);
    const expensesLastMonth = directExpenseFor(previousMonthKey) + subcontractorOutFor(previousMonthKey);
    const dueSoonCutoff = new Date(now);
    dueSoonCutoff.setDate(now.getDate() + 7);
    const invoiceBuckets = issuedInvoices.reduce((result, invoice) => {
        const amount = number(invoice.balanceDue);
        const bucket = invoice.status === "PAID" || amount <= 0 ? "paid" : invoice.status === "OVERDUE" || (invoice.dueDate && invoice.dueDate < now) ? "overdue" : invoice.dueDate && invoice.dueDate <= dueSoonCutoff ? "dueSoon" : "sent";
        result[bucket].count += 1;
        result[bucket].amount += bucket === "paid" ? number(invoice.amountPaid) : amount;
        return result;
    }, { paid: { count: 0, amount: 0 }, sent: { count: 0, amount: 0 }, dueSoon: { count: 0, amount: 0 }, overdue: { count: 0, amount: 0 } });
    const expenseBreakdown = Object.entries(directExpenses.filter((expense) => expense.expenseDate.getFullYear() === year).reduce((result, expense) => { result[expense.category] = (result[expense.category] ?? 0) + number(expense.amount); return result; }, {})).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
    const gstCollected = !owner.gstRegistered ? 0 : owner.gstAccountingMethod === "ACCRUAL"
        ? sum(issuedInvoices.filter((invoice) => invoice.issueDate.getFullYear() === year), (invoice) => number(invoice.gstAmount))
        : sum(issuedInvoices, (invoice) => {
            const total = number(invoice.totalAmount);
            if (!total)
                return 0;
            const yearPayments = sum(invoice.payments.filter((payment) => payment.paidAt.getFullYear() === year), (payment) => number(payment.amount));
            return number(invoice.gstAmount) * Math.min(yearPayments / total, 1);
        });
    const gstCredits = !owner.gstRegistered ? 0 : sum(directExpenses.filter((expense) => expense.gstClaimable && (owner.gstAccountingMethod === "ACCRUAL" ? expense.expenseDate.getFullYear() === year : expense.paidAt?.getFullYear() === year)), (expense) => number(expense.gstAmount));
    const topProjects = projects.map((project) => ({ id: project.id, name: project.name, customer: project.customer ? `${project.customer.firstName} ${project.customer.lastName}` : project.clientName, status: project.status, ...projectFinancials(project) })).filter((project) => project.invoiceTotal || project.revenueBasis).sort((a, b) => b.estimatedProfit - a.estimatedProfit).slice(0, 5);
    return { business: { firstName: owner.firstName, businessName: owner.businessName, abn: owner.abn, gstRegistered: owner.gstRegistered }, kpis: { activeProjects: projects.filter((project) => project.status === "ACTIVE").length, totalInvoiced, paymentsReceived, customerOutstanding, expenses: expenseTotal, expensesPaid, subcontractorCosts: subcontractorCostsTotal, subcontractorPaid, subcontractorOutstanding, estimatedProfit, cashPosition }, dashboard: { year, monthIndex: month, yearProgress: (month + (now.getDate() - 1) / new Date(year, month + 1, 0).getDate()) / 12, revenueThisMonth, revenueLastMonth, expensesThisMonth, expensesLastMonth, profitThisMonth: revenueThisMonth - expensesThisMonth, profitLastMonth: revenueLastMonth - expensesLastMonth, ytdRevenue, ytdExpenses, ytdProfit: ytdRevenue - ytdExpenses, previousYearRevenue, projectedRevenue, projectedMonthlyRevenue: recentAverage, monthlyTrend, reportTrend, forecastTrend: projectedMonths, invoiceBuckets, expenseBreakdown, gst: { registered: owner.gstRegistered, collected: gstCollected, credits: gstCredits, estimate: gstCollected - gstCredits }, topProjects }, receivables, payables, activeProjects, recentActivity: activity, excludedLegacySubcontractorExpenses: sum(expenses.filter((expense) => expense.category === "SUBCONTRACTOR"), (expense) => number(expense.amount)) };
}
//# sourceMappingURL=analytics.service.js.map