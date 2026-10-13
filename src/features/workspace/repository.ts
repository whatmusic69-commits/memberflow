import { readBusinessProfile, saveBusinessProfile } from "./business-profile";
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
  demo &&
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DASHBOARD_MODE !== "api";
export function readLocalRecords<K extends ModuleId>(
  businessId: string,
  section: K,
): ModuleRecords[K][] {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DASHBOARD_MODE === "api"
  )
    return [];
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(key(businessId, section)) || "[]",
    );
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (item) =>
          item &&
          (item.businessId === undefined || item.businessId === businessId) &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.updatedAt === "string" &&
          typeof item.archived === "boolean" &&
          !Number.isNaN(Date.parse(item.updatedAt)) &&
          Object.keys(schemas[section].defaults).every(
            (field) => typeof item[field] === "string",
          ),
      )
      .map((item) => ({ ...item, businessId }));
  } catch {
    return [];
  }
}
export function readLocalSettings(
  businessId: string,
): BusinessSettingsDraft | null {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DASHBOARD_MODE === "api"
  )
    return null;
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
    const profile = readBusinessProfile(businessId);
    return profile
      ? {
          ...value,
          ...profile.business,
          ...profile.branding,
          ...profile.social,
          country: profile.country,
        }
      : value;
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
        businessId,
        id: id || crypto.randomUUID(),
        archived: previous.find((row) => row.id === id)?.archived || false,
        updatedAt: new Date().toISOString(),
      } as ModuleRecords[K];
      validateRecord(section, input, businessId);
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
      if (section === "automations" && !archived) {
        const automation = readLocalRecords(businessId, "automations").find(
          (a) => a.id === id,
        );
        if (
          !automation ||
          !readLocalRecords(businessId, "offers").some(
            (o) => o.id === automation.offerId && !o.archived,
          )
        )
          throw new Error("referenced");
      }
      if (section === "offers" && archived) {
        const { readDemoDrafts } = await import("@/features/campaigns/service");
        if (
          readLocalRecords(businessId, "automations").some(
            (a) => !a.archived && a.offerId === id,
          ) ||
          readDemoDrafts(businessId).some(
            (c) =>
              !c.archived && c.source?.kind === "offer" && c.source.id === id,
          )
        )
          throw new Error("referenced");
      }
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
  const previous = readBusinessProfile(businessId);
  saveBusinessProfile({
    businessId,
    country: value.country,
    business: {
      name: value.name,
      category: value.category,
      city: value.city,
      description: value.description,
      address: value.address ?? previous?.business.address ?? "",
      openingHours: value.openingHours ?? previous?.business.openingHours ?? "",
      phone: value.phone ?? previous?.business.phone ?? "",
      email: value.email ?? previous?.business.email ?? "",
    },
    branding: {
      accent: value.accent,
      logoUrl: value.logoUrl,
      coverUrl: value.coverUrl ?? previous?.branding.coverUrl ?? null,
    },
    social: {
      website: value.website,
      instagram: value.instagram,
      tiktok: value.tiktok ?? previous?.social.tiktok ?? "",
      facebook: value.facebook ?? previous?.social.facebook ?? "",
    },
  });
  window.dispatchEvent(new Event(workspaceDraftEvent));
}

function validateRecord<K extends ModuleId>(
  section: K,
  input: RecordInput<K>,
  businessId: string,
) {
  const values = input as unknown as Record<string, string>;
  for (const field of schemas[section].fields) {
    const value = values[field.key];
    if (
      typeof value !== "string" ||
      (field.required && !value.trim()) ||
      (field.options && !field.options.includes(value)) ||
      (field.type === "number" &&
        value !== "" &&
        (!Number.isFinite(Number(value)) ||
          Number(value) < (field.min ?? 0) ||
          (field.step !== "0.01" && !Number.isSafeInteger(Number(value)))))
    )
      throw new Error("invalid");
  }
  if (
    section === "memberships" &&
    values.kind === "package" &&
    (!Number.isSafeInteger(Number(values.visits)) || Number(values.visits) < 1)
  )
    throw new Error("invalid");
  if (
    section === "automations" &&
    !readLocalRecords(businessId, "offers").some(
      (o) => o.id === values.offerId && !o.archived,
    )
  )
    throw new Error("reference");
}
