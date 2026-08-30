import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-950",
  destructive: "btn-destructive",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`${variants[variant]} ${className}`}
      {...props}
    />
  );
}
