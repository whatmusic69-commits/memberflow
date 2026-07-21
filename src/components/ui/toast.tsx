"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { useDemoStore } from "@/store/demo-store";

export function Toast() {
  const toast = useDemoStore((state) => state.toast);
  const clearToast = useDemoStore((state) => state.clearToast);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(clearToast, 2800);
    return () => window.clearTimeout(timeout);
  }, [toast, clearToast]);
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg bg-[#151625] px-4 py-3 text-sm font-medium text-white shadow-xl">
      <CheckCircle2 className="h-5 w-5 text-[#20B486]" />
      {toast}
    </div>
  );
}
