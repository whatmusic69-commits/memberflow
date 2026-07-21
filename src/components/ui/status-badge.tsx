import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  trial: "bg-amber-50 text-amber-700 ring-amber-200",
  paused: "bg-amber-50 text-amber-700 ring-amber-200",
  invited: "bg-violet-50 text-violet-700 ring-violet-200",
  disabled: "bg-slate-100 text-slate-600 ring-slate-200",
  archived: "bg-slate-100 text-slate-600 ring-slate-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  failed_payment: "bg-red-50 text-red-700 ring-red-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  connected: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1", map[status] ?? "bg-slate-100 text-slate-600 ring-slate-200")}>{label ?? status}</span>;
}
