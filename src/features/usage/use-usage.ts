"use client";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { getUsage } from "./service";
import type { BusinessUsage } from "./types";
export function useUsage() {
  const { data, can } = useWorkspace();
  const business = data?.business;
  const allowed = can("billing.read");
  const demo =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DASHBOARD_MODE !== "api";
  const [result, setResult] = useState<{
    id: string;
    data: BusinessUsage | null;
    error: boolean;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!business || !allowed) return;
    const controller = new AbortController();
    getUsage(business, demo, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted)
          setResult({ id: business.id, data: value, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({ id: business.id, data: null, error: true });
      });
    return () => controller.abort();
  }, [business, allowed, demo, attempt]);
  const current = result?.id === business?.id ? result : null;
  return {
    usage: current?.data ?? null,
    error: current?.error ?? false,
    loading: allowed && !current,
    demo,
    reload: () => {
      setResult(null);
      setAttempt((n) => n + 1);
    },
  };
}
