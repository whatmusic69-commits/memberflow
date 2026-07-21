import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  primary: "bg-[var(--primary)] text-white shadow-[0_14px_32px_rgba(109,93,251,0.28)] hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-[0_18px_44px_rgba(109,93,251,0.36)]",
  secondary: "bg-white/90 text-[var(--foreground)] ring-1 ring-[var(--border)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[var(--shadow-sm)]",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100/80",
  danger: "bg-[var(--danger)] text-white hover:-translate-y-0.5 hover:bg-red-700",
};

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof styles }) {
  return <button className={cn("inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2", styles[variant], className)} {...props} />;
}

export function LinkButton({ className, variant = "primary", children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: keyof typeof styles; children: ReactNode }) {
  return <Link className={cn("group inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2", styles[variant], className)} {...props}>{children}</Link>;
}
