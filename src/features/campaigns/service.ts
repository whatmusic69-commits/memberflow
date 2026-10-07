import { apiRequest } from "@/lib/api/client";
import { campaignKinds, type CampaignDraft, type CampaignInput } from "./types";
const storageKey = (businessId: string) =>
  `memberflow:campaign-drafts:v1:${businessId}`;
export const campaignDraftEvent = "memberflow:campaign-drafts-changed";
/** Browser-tab demo drafts; never publication or a production source of truth. */
export function readDemoDrafts(businessId: string): CampaignDraft[] {
  if (process.env.NODE_ENV !== "development") return [];
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(storageKey(businessId)) || "[]",
    );
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is CampaignDraft =>
        item &&
        typeof item.id === "string" &&
        item.businessId === businessId &&
        typeof item.name === "string" &&
        typeof item.description === "string" &&
        typeof item.price === "string" &&
        typeof item.currency === "string" &&
        typeof item.updatedAt === "string" &&
        !Number.isNaN(Date.parse(item.updatedAt)) &&
        campaignKinds.includes(item.kind) &&
        Array.isArray(item.channels) &&
        item.channels.every(
          (channel: unknown) => typeof channel === "string",
        ) &&
        (item.image === null ||
          (typeof item.image === "string" &&
            /^data:image\/(png|jpeg|webp);base64,/.test(item.image))) &&
        item.status === "DRAFT",
    );
  } catch {
    return [];
  }
}
export interface CampaignService {
  list(businessId: string, signal?: AbortSignal): Promise<CampaignDraft[]>;
  save(
    businessId: string,
    input: CampaignInput,
    id?: string,
  ): Promise<CampaignDraft>;
}
export function getCampaignService(demo: boolean): CampaignService {
  if (demo && process.env.NODE_ENV === "development")
    return {
      async list(businessId) {
        return readDemoDrafts(businessId);
      },
      async save(businessId, input, id) {
        const drafts = readDemoDrafts(businessId);
        const draft: CampaignDraft = {
          ...input,
          id: id || crypto.randomUUID(),
          businessId,
          status: "DRAFT",
          updatedAt: new Date().toISOString(),
          createdAt:
            drafts.find((item) => item.id === id)?.createdAt ??
            new Date().toISOString(),
        };
        sessionStorage.setItem(
          storageKey(businessId),
          JSON.stringify([
            draft,
            ...drafts.filter((item) => item.id !== draft.id),
          ]),
        );
        window.dispatchEvent(new Event(campaignDraftEvent));
        return draft;
      },
    };
  return {
    async list(businessId, signal) {
      return apiRequest<CampaignDraft[]>(
        `/api/v1/businesses/${encodeURIComponent(businessId)}/campaigns`,
        { credentials: "include", cache: "no-store", signal },
      );
    },
    async save() {
      throw new Error("unavailable");
    },
  };
}
