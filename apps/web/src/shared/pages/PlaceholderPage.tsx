import { Construction } from "lucide-react";

import { PageHeader } from "../components/ui/PageHeader";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
      />

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <Construction
          size={38}
          className="mx-auto text-amber-500"
        />

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          This module is coming next
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
          The navigation is ready. We will connect this
          section when its database and API module are built.
        </p>
      </div>
    </>
  );
}