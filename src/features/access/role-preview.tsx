"use client";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/content";
import { dashboardContent } from "@/content/dashboard";
import { accessContent } from "@/content/access";
import type { BusinessRole } from "./types";
export const previewRoles: BusinessRole[] = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "STAFF",
];
export function readPreviewRole(
  value: string | null,
): BusinessRole | undefined {
  return process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DASHBOARD_MODE !== "api" &&
    previewRoles.includes(value as BusinessRole)
    ? (value as BusinessRole)
    : undefined;
}
export function RolePreview({
  locale,
  role,
  staff = false,
}: {
  locale: Locale;
  role: BusinessRole;
  staff?: boolean;
}) {
  const router = useRouter();
  const query = useSearchParams();
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DASHBOARD_MODE === "api"
  )
    return null;
  const label = accessContent[locale].previewRole;
  return (
    <label className="mf-role-preview">
      <span>{label}</span>
      <select
        aria-label={label}
        value={role}
        onChange={(event) => {
          const selected = event.target.value as BusinessRole;
          const params = new URLSearchParams(query.toString());
          params.set("lang", locale);
          params.set("previewRole", selected);
          if (selected === "STAFF") {
            params.set("workspaceDemo", params.get("demo") ?? "new");
            params.delete("demo");
            router.push(`/staff?${params}`);
          } else {
            if (staff) {
              const fixture = params.get("workspaceDemo");
              params.delete("demo");
              if (fixture && fixture !== "new") params.set("demo", fixture);
              params.delete("workspaceDemo");
            }
            params.delete("customer");
            params.delete("campaign");
            params.delete("tab");
            router.push(`/dashboard?${params}`);
          }
        }}
      >
        {previewRoles.map((value) => (
          <option key={value} value={value}>
            {dashboardContent[locale].roles[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
