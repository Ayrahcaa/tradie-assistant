import { Mail, MessageCircle, Phone } from "lucide-react";
import { contactUrls } from "../../utils/sharing";

export function ContactActions({
  phone,
  email,
}: {
  phone?: string | null;
  email?: string | null;
}) {
  const urls = contactUrls(phone, email);
  const actions = [
    { label: "Call", href: urls.call, Icon: Phone },
    { label: "Email", href: urls.email, Icon: Mail },
    { label: "WhatsApp", href: urls.whatsapp, Icon: MessageCircle },
  ].filter((x) => x.href);
  if (!actions.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href!}
          target={label === "WhatsApp" ? "_blank" : undefined}
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50"
        >
          <Icon size={16} className="text-amber-700" />
          {label}
        </a>
      ))}
    </div>
  );
}
