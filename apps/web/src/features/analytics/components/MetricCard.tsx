import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function MetricCard({ label, value, detail, change, icon: Icon, tone = "blue" }: { label:string; value:string; detail:string; change?:number | null; icon:LucideIcon; tone?:"blue"|"green"|"orange"|"purple"|"coral" }) {
  const tones = { blue:"bg-amber-100 text-amber-800", green:"bg-emerald-50 text-emerald-700", orange:"bg-slate-100 text-slate-600", purple:"bg-amber-100 text-amber-800", coral:"bg-red-50 text-red-700" };
  const ChangeIcon = change == null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
  return <article className="surface-card interactive-card min-w-0 p-5">
    <div className="flex items-start justify-between gap-3"><p className="text-sm font-bold text-slate-500">{label}</p><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={20}/></span></div>
    <p className="mt-4 truncate text-[clamp(1.55rem,2.4vw,2.15rem)] font-black tracking-[-0.04em] text-[#152238]">{value}</p>
    <div className="mt-3 flex min-h-5 items-center gap-1.5 text-xs font-semibold text-slate-500">{change != null && <span className={`inline-flex items-center gap-0.5 ${change > 0 ? "text-emerald-700" : change < 0 ? "text-red-700" : "text-slate-500"}`}><ChangeIcon size={14}/>{Math.abs(change).toFixed(0)}%</span>}<span>{detail}</span></div>
  </article>;
}
