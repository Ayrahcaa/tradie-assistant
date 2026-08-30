import type { BusinessOverview, TrendPoint } from "./types";

export const aud = (value: number | string, compact = false) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: compact ? 0 : 2, notation: compact && Math.abs(Number(value)) >= 100_000 ? "compact" : "standard" }).format(Number(value));
export const percentageChange = (current: number, previous: number) => previous ? ((current - previous) / Math.abs(previous)) * 100 : null;
export const margin = (profit: number, revenue: number) => revenue ? profit / revenue * 100 : 0;
export const categoryLabel = (value: string) => value.toLowerCase().split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");

export function businessInsights(data: BusinessOverview): string[] {
  const { dashboard, kpis } = data;
  const insights: string[] = [];
  const change = percentageChange(dashboard.revenueThisMonth, dashboard.revenueLastMonth);
  if (change !== null) insights.push(`Revenue is ${change >= 0 ? "up" : "down"} ${Math.abs(change).toFixed(0)}% compared with last month.`);
  if (dashboard.expenseBreakdown[0]) insights.push(`${categoryLabel(dashboard.expenseBreakdown[0].category)} is your largest recorded expense category this year.`);
  if (dashboard.invoiceBuckets.dueSoon.amount > 0) insights.push(`${aud(dashboard.invoiceBuckets.dueSoon.amount, true)} is due from customers within 7 days.`);
  if (dashboard.ytdRevenue > 0) insights.push(`At your current recorded pace, revenue is projected to reach ${aud(dashboard.projectedRevenue, true)} this year.`);
  if (dashboard.previousYearRevenue > 0) insights.push(`You've recorded ${Math.round(dashboard.ytdRevenue / dashboard.previousYearRevenue * 100)}% of last year's revenue so far.`);
  if (!insights.length && kpis.activeProjects) insights.push(`${kpis.activeProjects} active project${kpis.activeProjects === 1 ? " is" : "s are"} currently underway.`);
  return insights.slice(0, 4);
}

export function chartPath(points: TrendPoint[], key: "revenue" | "expenses" | "profit", width: number, height: number, max: number) {
  return points.map((point, index) => `${index ? "L" : "M"} ${(index / Math.max(points.length - 1, 1)) * width} ${height - Math.max(0, point[key]) / max * height}`).join(" ");
}
