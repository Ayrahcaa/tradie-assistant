import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

import { uploadReceipt } from "../api/receipts";

interface ReceiptUploadProps {
  expenseId: string;
  projectId?: string;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export function ReceiptUpload({ expenseId, projectId, onSuccess }: ReceiptUploadProps) {
  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadReceipt(expenseId, file),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["expense-receipts", expenseId] }),
        queryClient.invalidateQueries({ queryKey: ["expense", expenseId] }),
        ...(projectId ? [queryClient.invalidateQueries({ queryKey: ["project-overview", projectId] })] : []),
      ]);

      setError(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
      onSuccess?.();
    },
  });

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError(null);
    mutation.reset();

    if (!file) {
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, WEBP and PDF files are supported.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Receipt file must be 10 MB or smaller.");
      return;
    }

    mutation.mutate(file);
  }

  return (
    <div>
      {(error || mutation.isError) && (
        <div className="mb-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <CircleAlert size={20} />

          <p className="text-sm font-medium">
            {error ?? mutation.error?.message}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={mutation.isPending}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
      >
        {mutation.isPending ? (
          <LoaderCircle size={18} className="animate-spin" />
        ) : (
          <Upload size={18} />
        )}

        {mutation.isPending ? "Uploading..." : "Upload receipt"}
      </button>

      <p className="mt-2 text-xs text-slate-500">
        JPG, PNG, WEBP or PDF. Maximum 10 MB.
      </p>
    </div>
  );
}
