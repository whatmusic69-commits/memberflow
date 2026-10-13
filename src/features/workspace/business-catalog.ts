import type { BusinessSummary } from "@/features/dashboard/types";
const key = "memberflow:business-catalog:v1";
export function readBusinessCatalog(): BusinessSummary[] {
  if (process.env.NODE_ENV !== "development") return [];
  try {
    const rows = JSON.parse(sessionStorage.getItem(key) || "[]");
    return Array.isArray(rows)
      ? rows.filter(
          (b) =>
            b &&
            typeof b.id === "string" &&
            typeof b.name === "string" &&
            typeof b.category === "string" &&
            typeof b.city === "string" &&
            Array.isArray(b.goals) &&
            typeof b.accent === "string",
        )
      : [];
  } catch {
    return [];
  }
}
export function rememberBusiness(business: BusinessSummary) {
  if (process.env.NODE_ENV !== "development") return;
  const rows = readBusinessCatalog();
  sessionStorage.setItem(
    key,
    JSON.stringify([
      ...rows.filter((b) => b.id !== business.id),
      { ...business, logoUrl: null, coverUrl: null },
    ]),
  );
}

const selectedKey = "memberflow:selected-business:v1";
export function readSelectedBusiness(): string | undefined {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DASHBOARD_MODE === "api"
  )
    return undefined;
  try {
    const id = sessionStorage.getItem(selectedKey);
    return readBusinessCatalog().some((b) => b.id === id) ? id! : undefined;
  } catch {
    return undefined;
  }
}
export function selectLocalBusiness(id: string) {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DASHBOARD_MODE === "api"
  )
    return;
  if (!readBusinessCatalog().some((b) => b.id === id)) return;
  sessionStorage.setItem(selectedKey, id);
}
