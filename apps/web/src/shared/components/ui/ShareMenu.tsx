import { Check, Copy, Mail, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "./Modal";
import {
  buildShareDocument,
  type ShareDocumentInput,
} from "../../utils/sharing";

export function ShareMenu({
  open,
  onClose,
  document,
}: {
  open: boolean;
  onClose: () => void;
  document: ShareDocumentInput;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const share = buildShareDocument(document);
  async function copy() {
    try {
      await navigator.clipboard.writeText(share.message);
      setNotice("Message copied to clipboard.");
    } catch {
      setNotice("Copy is unavailable in this browser.");
    }
  }
  async function nativeShare() {
    if (!navigator.share) {
      setNotice(
        "The share menu is unavailable here. Use Email, WhatsApp or Copy instead.",
      );
      return;
    }
    try {
      await navigator.share({ title: share.subject, text: share.message });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError")
        setNotice("The message could not be shared.");
    }
  }
  return (
    <Modal
      open={open}
      title={`Send ${document.kind}`}
      description="Share a professional summary. PDF attachments are coming soon."
      onClose={onClose}
    >
      <div className="grid gap-3 p-6 sm:grid-cols-2">
        {share.emailUrl && (
          <a
            href={share.emailUrl}
            className="inline-flex h-12 items-center gap-3 rounded-xl border p-4 font-bold hover:bg-slate-50"
          >
            <Mail className="text-slate-500" />
            Email
          </a>
        )}
        {share.whatsappUrl && (
          <a
            href={share.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-3 rounded-xl border p-4 font-bold hover:bg-slate-50"
          >
            <MessageCircle className="text-emerald-600" />
            WhatsApp
          </a>
        )}
        <button
          onClick={nativeShare}
          className="inline-flex h-12 items-center gap-3 rounded-xl border p-4 font-bold hover:bg-slate-50"
        >
          <Share2 className="text-amber-700" />
          Share
        </button>
        <button
          onClick={copy}
          className="inline-flex h-12 items-center gap-3 rounded-xl border p-4 font-bold hover:bg-slate-50"
        >
          <Copy className="text-slate-600" />
          Copy message
        </button>
      </div>
      {notice && (
        <p className="mx-6 mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
          <Check size={17} />
          {notice}
        </p>
      )}
      <p className="border-t bg-slate-50 px-6 py-4 text-xs text-slate-500">
        This shares summary text only. No invoice or quote PDF has been
        generated.
      </p>
    </Modal>
  );
}
