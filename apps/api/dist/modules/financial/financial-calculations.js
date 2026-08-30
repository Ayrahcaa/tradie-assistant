export const taxConfig = {
    "2026-27": { residentIndividual: [
            { threshold: 0, rate: 0 },
            { threshold: 18_200, rate: 0.15 },
            { threshold: 45_000, rate: 0.30 },
            { threshold: 135_000, rate: 0.37 },
            { threshold: 190_000, rate: 0.45 },
        ] },
};
const cents = (value) => Math.round(Number(value) * 100);
const dollars = (value) => Math.round(value) / 100;
export const gstInclusive = (gross) => dollars(Math.round(cents(gross) / 11));
export const gstExclusive = (net) => dollars(Math.round(cents(net) / 10));
export const gstForTreatment = (gross, treatment, manual = 0) => treatment === "GST_INCLUDED" ? gstInclusive(gross) : treatment === "MANUAL" ? Math.min(Number(gross), Math.max(0, manual)) : 0;
export const invoiceGstTotal = (lines, registered) => registered ? dollars(lines.filter(x => x.gstApplicable).reduce((s, x) => s + Math.round(cents(x.net) / 10), 0)) : 0;
export const expenseGstCreditTotal = (expenses) => dollars(expenses.filter(x => x.claimable && x.hasReceipt).reduce((s, x) => s + cents(x.gst), 0));
export const cashAttributedGst = (payment, invoiceTotal, invoiceGst) => Number(invoiceTotal) <= 0 ? 0 : dollars(Math.round(cents(invoiceGst) * cents(payment) / cents(invoiceTotal)));
export const moneyPosition = (receivables, payables) => { const owedToYou = receivables.reduce((s, v) => s + cents(v), 0); const youOwe = payables.reduce((s, v) => s + cents(v), 0); return { owedToYou: dollars(owedToYou), youOwe: dollars(youOwe), netPosition: dollars(owedToYou - youOwe) }; };
export const projectPosition = (revenue, expenses, subcontractors, cashReceived, cashExpenses, cashSubcontractors) => { const estimatedProfit = cents(revenue) - cents(expenses) - cents(subcontractors); const cashPosition = cents(cashReceived) - cents(cashExpenses) - cents(cashSubcontractors); return { estimatedProfit: dollars(estimatedProfit), cashPosition: dollars(cashPosition) }; };
export const variance = (estimated, actual) => dollars(cents(actual) - cents(estimated));
export function residentIncomeTax(income, year) { const config = taxConfig[year]; if (!config)
    return null; const taxable = Math.max(0, cents(income)); let tax = 0; const brackets = config.residentIndividual; for (let i = 1; i < brackets.length; i++) {
    const bracket = brackets[i];
    const lower = cents(bracket.threshold);
    const next = brackets[i + 1];
    const upper = next ? cents(next.threshold) : taxable;
    if (taxable > lower)
        tax += Math.max(0, Math.min(taxable, upper) - lower) * bracket.rate;
} return dollars(Math.round(tax)); }
export const suggestedReserve = (netGst, incomeTax, paygPaid) => Math.max(0, dollars(cents(netGst) + cents(incomeTax) - cents(paygPaid)));
//# sourceMappingURL=financial-calculations.js.map