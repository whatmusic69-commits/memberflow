import { schemas } from "./schema";
import { apiRequest } from "@/lib/api/client";
import type {
  BusinessSettingsDraft,
  ModuleId,
  ModuleRecords,
  RecordInput,
} from "./types";
export const workspaceDraftEvent = "memberflow:workspace-drafts-changed";
const key = (businessId: string, section: string) =>
  `memberflow:workspace:v1:${businessId}:${section}`;
export const isDemoAdapter = (demo: boolean) =>
  demo && process.env.NODE_ENV === "development";
export function readLocalRecords<K extends ModuleId>(
  businessId: string,
  section: K,
): ModuleRecords[K][] {
  if (process.env.NODE_ENV !== "development") return [];
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(key(businessId, section)) || "[]",
    );
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.updatedAt === "string" &&
        typeof item.archived === "boolean" &&
        !Number.isNaN(Date.parse(item.updatedAt)) &&
        Object.keys(schemas[section].defaults).every(
          (field) => typeof item[field] === "string",
        ),
    );
  } catch {
    return [];
  }
}
export function readLocalSettings(
  businessId: string,
): BusinessSettingsDraft | null {
  if (process.env.NODE_ENV !== "development") return null;
  try {
    const value = JSON.parse(
      sessionStorage.getItem(key(businessId, "settings")) || "null",
    );
    if (
      !value ||
      typeof value.name !== "string" ||
      typeof value.city !== "string" ||
      typeof value.category !== "string" ||
      typeof value.firstName !== "string" ||
      !/^#[0-9a-f]{6}$/i.test(value.accent) ||
      ["country", "description", "website", "instagram"].some(
        (field) => typeof value[field] !== "string",
      ) ||
      (value.logoUrl !== null &&
        (typeof value.logoUrl !== "string" ||
          !/^data:image\/(png|jpeg|webp);base64,/.test(value.logoUrl)))
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
/** Screen drafts only: no loyalty, billing, authorization, or automation execution. */
export function moduleRepository<K extends ModuleId>(
  section: K,
  demo: boolean,
) {
  return {
    async list(
      businessId: string,
      signal?: AbortSignal,
    ): Promise<ModuleRecords[K][]> {
      if (isDemoAdapter(demo)) return readLocalRecords(businessId, section);
      return apiRequest<ModuleRecords[K][]>(
        `/api/v1/businesses/${encodeURIComponent(businessId)}/${section}`,
        { credentials: "include", cache: "no-store", signal },
      );
    },
    async save(
      businessId: string,
      input: RecordInput<K>,
      id?: string,
    ): Promise<ModuleRecords[K]> {
      if (!isDemoAdapter(demo)) throw new Error("unavailable");
      const previous = readLocalRecords(businessId, section);
      const item = {
        ...input,
        id: id || crypto.randomUUID(),
        archived: previous.find((row) => row.id === id)?.archived || false,
        updatedAt: new Date().toISOString(),
      } as ModuleRecords[K];
      sessionStorage.setItem(
        key(businessId, section),
        JSON.stringify([item, ...previous.filter((row) => row.id !== item.id)]),
      );
      window.dispatchEvent(new Event(workspaceDraftEvent));
      return item;
    },
    async archive(
      businessId: string,
      id: string,
      archived: boolean,
    ): Promise<void> {
      if (!isDemoAdapter(demo)) throw new Error("unavailable");
      const rows = readLocalRecords(businessId, section).map((row) =>
        row.id === id ? { ...row, archived } : row,
      );
      sessionStorage.setItem(key(businessId, section), JSON.stringify(rows));
      window.dispatchEvent(new Event(workspaceDraftEvent));
    },
  };
}
export async function saveLocalSettings(
  businessId: string,
  value: BusinessSettingsDraft,
  demo: boolean,
) {
  if (!isDemoAdapter(demo)) throw new Error("unavailable");
  sessionStorage.setItem(key(businessId, "settings"), JSON.stringify(value));
  window.dispatchEvent(new Event(workspaceDraftEvent));
}
