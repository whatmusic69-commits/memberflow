import { apiRequest } from "@/lib/api/client";
import { uploadMultipart, type UploadProgress } from "@/lib/api/upload";
import type { BusinessSummary } from "@/features/dashboard/types";
import type {
  CustomerPageConfig,
  CustomerPageDraft,
  CustomerPagePublic,
  CustomerPageStatus,
} from "./types";
export const customerPageDraftEvent = "memberflow:customer-page-draft-changed";
const draftKey = (id: string) => `memberflow:customer-page-preview:v1:${id}`;
export interface CustomerPageService {
  get(signal?: AbortSignal): Promise<CustomerPageConfig>;
  save(draft: CustomerPageDraft): Promise<CustomerPageConfig>;
  upload(
    file: File,
    kind: "logo" | "cover",
    onProgress?: (progress: UploadProgress) => void,
    signal?: AbortSignal,
  ): Promise<string>;
  setStatus(status: CustomerPageStatus): Promise<CustomerPageConfig>;
}
/** Local presentation drafts only. No customer session, balance or entitlement is persisted. */
export function readPageDraft(id: string): CustomerPageConfig | null {
  if (process.env.NODE_ENV !== "development") return null;
  try {
    const value = JSON.parse(
      localStorage.getItem(draftKey(id)) || "null",
    ) as CustomerPageConfig | null;
    return value?.businessId === id &&
      value.branding &&
      value.business &&
      value.modules &&
      value.social &&
      value.invitation &&
      value.content
      ? value
      : null;
  } catch {
    return null;
  }
}
export function previewUrl(config: CustomerPageConfig, locale: string) {
  return `${window.location.origin}/b/${encodeURIComponent(config.slug)}?preview=${encodeURIComponent(config.businessId)}&lang=${locale}`;
}
export function customerPageService(
  business: BusinessSummary,
  demo: boolean,
): CustomerPageService {
  const path =
    `/api/v1/businesses/${encodeURIComponent(business.id)}/customer-page` as const;
  const isDemo = demo && process.env.NODE_ENV === "development";
  const get = async (signal?: AbortSignal) => {
    if (!isDemo)
      return apiRequest<CustomerPageConfig>(path, {
        credentials: "include",
        cache: "no-store",
        signal,
      });
    const { emptyPageConfig } = await import("@/mocks/customer-page/fixtures");
    const saved = readPageDraft(business.id);
    if (saved) return saved;
    const initial = emptyPageConfig(business);
    localStorage.setItem(
      draftKey(business.id),
      JSON.stringify({
        ...initial,
        branding: {
          ...initial.branding,
          logoUrl: initial.branding.logoUrl?.startsWith("data:")
            ? null
            : initial.branding.logoUrl,
        },
      }),
    );
    return initial;
  };
  return {
    get,
    async save(draft) {
      if (!isDemo)
        return apiRequest<CustomerPageConfig>(path, {
          method: "PATCH",
          credentials: "include",
          body: JSON.stringify(draft),
        });
      const config = { ...(await get()), ...draft };
      // Never serialize base64 image contents. Blob URLs are temporary upload previews.
      const stored = {
        ...config,
        branding: {
          ...config.branding,
          logoUrl: config.branding.logoUrl?.startsWith("data:")
            ? null
            : config.branding.logoUrl,
          coverUrl: config.branding.coverUrl?.startsWith("data:")
            ? null
            : config.branding.coverUrl,
        },
      };
      localStorage.setItem(draftKey(business.id), JSON.stringify(stored));
      window.dispatchEvent(new Event(customerPageDraftEvent));
      return config;
    },
    async upload(file, kind, onProgress, signal) {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 6 * 1024 * 1024
      )
        throw new Error("image");
      if (isDemo) {
        const { prepareImage } = await import("@/mocks/customer-page/upload");
        return prepareImage(file, onProgress, signal);
      }
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      const result = await uploadMultipart<{ url: string }>(
        `${path}/media`,
        form,
        onProgress,
        signal,
      );
      return result.url;
    },
    async setStatus(status) {
      if (isDemo) throw new Error("activation-unavailable");
      return apiRequest<CustomerPageConfig>(`${path}/status`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ status }),
      });
    },
  };
}
/** Only the public business projection. No user cookies or personal response is cached here. */
export async function getPublicCustomerPage(slug: string) {
  const page = await apiRequest<CustomerPagePublic>(
    `/api/v1/public/business-pages/${encodeURIComponent(slug)}`,
    { cache: "no-store", credentials: "omit" },
  );
  // Whitelist the public projection: extra backend fields must never be serialized
  // into a shared business page/metadata response.
  const b = page.business,
    brand = page.branding;
  return {
    slug: page.slug,
    status: page.status,
    business: {
      name: b.name,
      category: b.category,
      description: b.description,
      city: b.city,
      address: b.address,
      openingHours: b.openingHours,
      phone: b.phone,
      email: b.email,
    },
    branding: {
      logoUrl: brand.logoUrl,
      coverUrl: brand.coverUrl,
      accent: brand.accent,
    },
    modules: {
      offers: page.modules.offers,
      loyalty: page.modules.loyalty,
      memberships: page.modules.memberships,
      social: page.modules.social,
    },
    social: {
      instagram: page.social.instagram,
      tiktok: page.social.tiktok,
      facebook: page.social.facebook,
      website: page.social.website,
    },
    offers: page.offers.map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      priceLabel: o.priceLabel,
      bonusLabel: o.bonusLabel,
      validUntil: o.validUntil,
      imageUrl: o.imageUrl,
    })),
    loyalty: page.loyalty ? { reward: page.loyalty.reward } : null,
    availableMemberships: page.availableMemberships.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
    })),
    connection: { joinEnabled: page.connection.joinEnabled },
  } satisfies CustomerPagePublic;
}
