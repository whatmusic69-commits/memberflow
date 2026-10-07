"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { usageContent } from "@/content/usage";
/** Render a backend quota rejection, never pre-authorize a mutation from usage counts. */
export function LimitNotice({
  resourceKey,
  limit,
}: {
  resourceKey: string;
  limit: number;
}) {
  const { locale, href, can } = useWorkspace();
  const c = usageContent[locale];
  const names: Record<string, string> = c.resources;
  return (
    <div className="mf-usage-notice" role="alert">
      <p>
        {c.reached.replace("{resource}", names[resourceKey] ?? resourceKey)} (
        {limit})
      </p>
      {can("billing.read") && (
        <Link className="mf-text-link" href={href("billing")}>
          {c.upgrade}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
