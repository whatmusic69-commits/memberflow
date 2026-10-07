"use client";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { customerService } from "./service";
import type { CustomerDirectory, CustomerDetail, CustomerQuery } from "./types";
export function useCustomers(query: CustomerQuery, customerId?: string) {
  const { data, can } = useWorkspace();
  const businessId = data?.business.id;
  const demo = data?.source === "demo";
  const allowed = can("customer.read");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    directory?: CustomerDirectory;
    detail?: CustomerDetail;
    error: boolean;
  } | null>(null);
  const { period, segment, search, page, archived = false } = query;
  const key = `${businessId}:${demo}:${customerId ?? ""}:${period}:${segment}:${search}:${page}:${archived}:${attempt}`;
  useEffect(() => {
    if (!businessId || !allowed) return;
    const controller = new AbortController();
    const service = customerService(demo);
    const request = customerId
      ? service.detail(businessId, customerId, controller.signal)
      : service.directory(
          businessId,
          { period, segment, search, page, archived },
          controller.signal,
        );
    request
      .then((value) => {
        if (
          !controller.signal.aborted &&
          value.businessId === businessId &&
          (!customerId || (value as CustomerDetail).customer.id === customerId)
        )
          setResult({
            key,
            error: false,
            ...(customerId
              ? { detail: value as CustomerDetail }
              : { directory: value as CustomerDirectory }),
          });
        else if (!controller.signal.aborted) setResult({ key, error: true });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, error: true });
      });
    return () => controller.abort();
  }, [
    businessId,
    demo,
    allowed,
    customerId,
    period,
    segment,
    search,
    page,
    archived,
    key,
  ]);
  const current = allowed && result?.key === key ? result : null;
  return {
    directory:
      current?.directory ??
      (allowed && !customerId && result?.directory?.businessId === businessId
        ? result?.directory
        : undefined),
    detail: current?.detail,
    error: current?.error ?? false,
    pending: allowed && !current,
    reload: () => setAttempt((n) => n + 1),
  };
}
