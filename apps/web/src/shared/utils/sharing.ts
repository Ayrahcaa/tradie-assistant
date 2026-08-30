export interface ShareDocumentInput {
  kind: "Invoice" | "Quote";
  number: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  projectName?: string | null;
  total: string | number;
  outstanding?: string | number;
  dueDate?: string | null;
  businessName: string;
}

const aud = (value: string | number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
    Number(value),
  );
const auDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Not specified";

export function normalizeAustralianPhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("61") && digits.length >= 10) return digits;
  if (digits.startsWith("0") && digits.length === 10)
    return `61${digits.slice(1)}`;
  return digits.length >= 8 ? digits : null;
}

export function buildShareDocument(input: ShareDocumentInput) {
  const project = input.projectName || "your project";
  const lines =
    input.kind === "Invoice"
      ? [
          `Hi ${input.customerName},`,
          "",
          `Please find invoice ${input.number} for ${project}.`,
          "",
          `Total: ${aud(input.total)}`,
          `Outstanding: ${aud(input.outstanding ?? input.total)}`,
          `Due date: ${auDate(input.dueDate)}`,
          "",
          `Regards,`,
          input.businessName,
        ]
      : [
          `Hi ${input.customerName},`,
          "",
          `Please find quote ${input.number} for ${project}.`,
          "",
          `Quote total: ${aud(input.total)}`,
          "",
          "Please contact us if you have any questions.",
          "",
          "Regards,",
          input.businessName,
        ];
  const message = lines.join("\n");
  return {
    message,
    subject: `${input.kind} ${input.number} from ${input.businessName}`,
    emailUrl: input.customerEmail
      ? `mailto:${encodeURIComponent(input.customerEmail)}?subject=${encodeURIComponent(`${input.kind} ${input.number} from ${input.businessName}`)}&body=${encodeURIComponent(message)}`
      : null,
    whatsappUrl: normalizeAustralianPhone(input.customerPhone)
      ? `https://wa.me/${normalizeAustralianPhone(input.customerPhone)}?text=${encodeURIComponent(message)}`
      : null,
  };
}

export async function shareOrFallback(
  input: ShareDocumentInput,
  showFallback: () => void,
) {
  const share = buildShareDocument(input);
  if (!navigator.share) {
    showFallback();
    return;
  }
  try {
    await navigator.share({ title: share.subject, text: share.message });
  } catch (error) {
    if (!(error instanceof Error) || error.name !== "AbortError")
      showFallback();
  }
}

export const contactUrls = (phone?: string | null, email?: string | null) => ({
  call: phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : null,
  email: email ? `mailto:${email}` : null,
  whatsapp: normalizeAustralianPhone(phone)
    ? `https://wa.me/${normalizeAustralianPhone(phone)}`
    : null,
});
