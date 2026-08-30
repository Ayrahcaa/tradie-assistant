import { z } from "zod";
import { getCashflow, getMoneyHub, getSubcontractorStatement, getTaxSummary, getWeeklyCheck, periodRange } from "./financial.service.js";
import { prisma } from "../../lib/prisma.js";
const query = z.object({ preset: z.string().optional(), from: z.string().optional(), to: z.string().optional() });
export async function money(req, res, next) { try {
    res.json({ data: await getMoneyHub(req.authUser.id) });
}
catch (e) {
    next(e);
} }
export async function tax(req, res, next) { try {
    const q = query.parse(req.query);
    res.json({ data: await getTaxSummary(req.authUser.id, q.preset, q.from, q.to) });
}
catch (e) {
    next(e);
} }
export async function weekly(req, res, next) { try {
    res.json({ data: await getWeeklyCheck(req.authUser.id) });
}
catch (e) {
    next(e);
} }
export async function cashflow(req, res, next) { try {
    const days = z.coerce.number().int().min(1).max(90).catch(14).parse(req.query.days);
    res.json({ data: await getCashflow(req.authUser.id, days) });
}
catch (e) {
    next(e);
} }
export async function statement(req, res, next) { try {
    const id = z.string().uuid().parse(req.params.subcontractorId);
    const q = query.parse(req.query);
    const range = periodRange(q.preset, q.from, q.to);
    const data = await getSubcontractorStatement(req.authUser.id, id, range.from, range.to);
    if (!data) {
        res.status(404).json({ message: "Subcontractor not found." });
        return;
    }
    res.json({ data });
}
catch (e) {
    next(e);
} }
export async function createPayg(req, res, next) { try {
    const body = z.object({ amount: z.number().positive(), paidAt: z.string().datetime({ offset: true }), period: z.string().max(40).optional(), reference: z.string().max(100).optional(), notes: z.string().max(500).optional() }).parse(req.body);
    res.status(201).json({ data: await prisma.paygInstalment.create({ data: { ...body, paidAt: new Date(body.paidAt), ownerId: req.authUser.id } }) });
}
catch (e) {
    next(e);
} }
export async function accountantExport(req, res, next) { try {
    const q = query.parse(req.query);
    const range = periodRange(q.preset ?? "financial-year", q.from, q.to);
    const [invoices, payments, expenses, costs, subPayments, payg] = await Promise.all([prisma.invoice.findMany({ where: { ownerId: req.authUser.id, issueDate: { gte: range.from, lt: range.to } }, include: { customer: true } }), prisma.payment.findMany({ where: { ownerId: req.authUser.id, paidAt: { gte: range.from, lt: range.to } }, include: { invoice: true } }), prisma.expense.findMany({ where: { ownerId: req.authUser.id, expenseDate: { gte: range.from, lt: range.to } }, include: { receipts: true } }), prisma.subcontractorProjectCost.findMany({ where: { ownerId: req.authUser.id, createdAt: { gte: range.from, lt: range.to } }, include: { subcontractor: true, project: true } }), prisma.subcontractorPayment.findMany({ where: { ownerId: req.authUser.id, paidAt: { gte: range.from, lt: range.to } }, include: { cost: true } }), prisma.paygInstalment.findMany({ where: { ownerId: req.authUser.id, paidAt: { gte: range.from, lt: range.to } } })]);
    const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const rows = [["Type", "Date", "Reference", "Party / description", "Category", "Gross amount", "GST amount", "GST treatment", "Receipt status", "Project"]];
    invoices.forEach(x => rows.push(["Invoice", x.issueDate.toISOString(), x.invoiceNumber, `${x.customer.firstName} ${x.customer.lastName}`, "Sales", x.totalAmount, x.gstAmount, "Sales GST", "", x.projectId ?? ""]));
    payments.forEach(x => rows.push(["Customer payment", x.paidAt.toISOString(), x.reference ?? x.invoice.invoiceNumber, x.invoice.title, "Income payment", x.amount, "", "", "", x.invoice.projectId ?? ""]));
    expenses.forEach(x => rows.push(["Expense", x.expenseDate.toISOString(), x.id, x.description, x.category, x.amount, x.gstAmount, x.gstTreatment, x.receipts.length ? "Receipt attached" : "Missing receipt", x.projectId ?? ""]));
    costs.forEach(x => rows.push(["Subcontractor cost", x.createdAt.toISOString(), x.id, x.subcontractor.businessName ?? x.subcontractor.firstName, x.rateType, x.agreedAmount, "", "Not applicable", "", x.project.name]));
    subPayments.forEach(x => rows.push(["Subcontractor payment", x.paidAt.toISOString(), x.reference ?? x.id, x.cost.description ?? "Project work", "Payment", -Number(x.amount), "", "Not applicable", "", x.cost.projectId]));
    payg.forEach(x => rows.push(["PAYG instalment", x.paidAt.toISOString(), x.reference ?? x.id, x.period ?? "PAYG instalment", "Tax payment", -Number(x.amount), "", "Not applicable", "", ""]));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="tradie-accountant-export.csv"`);
    res.send(rows.map(row => row.map(esc).join(",")).join("\n"));
}
catch (e) {
    next(e);
} }
//# sourceMappingURL=financial.controller.js.map