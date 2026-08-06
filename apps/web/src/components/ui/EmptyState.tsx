import { FolderPlus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <FolderPlus size={25} />
      </span>

      <h2 className="mt-5 text-lg font-bold text-slate-900">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}