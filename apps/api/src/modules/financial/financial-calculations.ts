export type TaxBracket = { threshold: number; rate: number };

export const taxConfig: Record<string, { residentIndividual: TaxBracket[] }> = {
  "2026-27": { residentIndividual: [
    { threshold: 0, rate: 0 },
    { threshold: 18_200, rate: 0.15 },
    { threshold: 45_000, rate: 0.30 },
    { threshold: 135_000, rate: 0.37 },
    { threshold: 190_000, rate: 0.45 },
  ] },
};

const cents = (value: number | string) => Math.round(Number(value) * 100);
const dollars = (value: number) => Math.round(value) / 100;
export const gstInclusive = (gross: number | string) => dollars(Math.round(cents(gross) / 11));
export const gstExclusive = (net: number | string) => dollars(Math.round(cents(net) / 10));
export const gstForTreatment = (gross: number | string, treatment: string, manual = 0) => treatment === "GST_INCLUDED" ? gstInclusive(gross) : treatment === "MANUAL" ? Math.min(Number(gross), Math.max(0, manual)) : 0;
export const invoiceGstTotal = (lines:Array<{net:number|string;gstApplicable:boolean}>,registered:boolean) => registered ? dollars(lines.filter(x=>x.gstApplicable).reduce<number>((s,x)=>s+Math.round(cents(x.net)/10),0)) : 0;
export const expenseGstCreditTotal = (expenses:Array<{gst:number|string;claimable:boolean;hasReceipt:boolean}>) => dollars(expenses.filter(x=>x.claimable&&x.hasReceipt).reduce<number>((s,x)=>s+cents(x.gst),0));
export const cashAttributedGst = (payment:number|string,invoiceTotal:number|string,invoiceGst:number|string) => Number(invoiceTotal)<=0?0:dollars(Math.round(cents(invoiceGst)*cents(payment)/cents(invoiceTotal)));
export const moneyPosition = (receivables: Array<number|string>, payables: Array<number|string>) => { const owedToYou=receivables.reduce<number>((s,v)=>s+cents(v),0);const youOwe=payables.reduce<number>((s,v)=>s+cents(v),0);return { owedToYou:dollars(owedToYou), youOwe:dollars(youOwe), netPosition:dollars(owedToYou-youOwe) }; };
export const projectPosition = (revenue:number|string,expenses:number|string,subcontractors:number|string,cashReceived:number|string,cashExpenses:number|string,cashSubcontractors:number|string) => { const estimatedProfit=cents(revenue)-cents(expenses)-cents(subcontractors);const cashPosition=cents(cashReceived)-cents(cashExpenses)-cents(cashSubcontractors);return { estimatedProfit:dollars(estimatedProfit),cashPosition:dollars(cashPosition) }; };
export const variance = (estimated:number|string,actual:number|string) => dollars(cents(actual)-cents(estimated));
export function residentIncomeTax(income:number|string, year:string){const config=taxConfig[year];if(!config)return null;const taxable=Math.max(0,cents(income));let tax=0;const brackets=config.residentIndividual;for(let i=1;i<brackets.length;i++){const bracket=brackets[i]!;const lower=cents(bracket.threshold);const next=brackets[i+1];const upper=next?cents(next.threshold):taxable;if(taxable>lower)tax+=Math.max(0,Math.min(taxable,upper)-lower)*bracket.rate;}return dollars(Math.round(tax));}
export const suggestedReserve = (netGst:number|string,incomeTax:number|string,paygPaid:number|string) => Math.max(0,dollars(cents(netGst)+cents(incomeTax)-cents(paygPaid)));
