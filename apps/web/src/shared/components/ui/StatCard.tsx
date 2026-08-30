import type { ComponentType, SVGProps } from "react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Icon width={21} height={21} />
        </span>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500">{description}</p>
    </article>
  );
}
