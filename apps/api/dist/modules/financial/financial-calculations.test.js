import assert from "node:assert/strict";
import test from "node:test";
import { cashAttributedGst, expenseGstCreditTotal, gstExclusive, gstForTreatment, gstInclusive, invoiceGstTotal, moneyPosition, projectPosition, residentIncomeTax, suggestedReserve, variance } from "./financial-calculations.js";
test("GST inclusive amount is one eleventh", () => assert.equal(gstInclusive(1100), 100));
test("GST exclusive amount is ten percent", () => assert.equal(gstExclusive(1000), 100));
test("no GST and unknown GST do not create credits", () => { assert.equal(gstForTreatment(110, "GST_FREE"), 0); assert.equal(gstForTreatment(110, "UNKNOWN"), 0); });
test("invoice GST respects registration and taxable lines", () => { const lines = [{ net: 1000, gstApplicable: true }, { net: 500, gstApplicable: false }]; assert.equal(invoiceGstTotal(lines, true), 100); assert.equal(invoiceGstTotal(lines, false), 0); });
test("expense GST totals require claimable treatment and receipt", () => assert.equal(expenseGstCreditTotal([{ gst: 100, claimable: true, hasReceipt: true }, { gst: 50, claimable: true, hasReceipt: false }, { gst: 10, claimable: false, hasReceipt: true }]), 100));
test("cash GST is proportional to payment while accrual uses full invoice GST", () => { assert.equal(cashAttributedGst(550, 1100, 100), 50); assert.equal(cashAttributedGst(1100, 1100, 100), 100); });
test("money hub net position", () => assert.deepEqual(moneyPosition([6200, 4100], [3400, 2100]), { owedToYou: 10300, youOwe: 5500, netPosition: 4800 }));
test("profit and cash position remain distinct", () => assert.deepEqual(projectPosition(20000, 4000, 3500, 8000, 2000, 1000), { estimatedProfit: 12500, cashPosition: 5000 }));
test("quote versus actual variance", () => assert.equal(variance(4000, 5120), 1120));
test("2026-27 resident rates are versioned", () => { assert.equal(residentIncomeTax(18200, "2026-27"), 0); assert.equal(residentIncomeTax(57000, "2026-27"), 7620); assert.equal(residentIncomeTax(57000, "2025-26"), null); });
test("PAYG reduces suggested reserve", () => assert.equal(suggestedReserve(2580, 6250, 2000), 6830));
//# sourceMappingURL=financial-calculations.test.js.map