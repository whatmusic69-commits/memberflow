import type { BusinessSummary } from "@/features/dashboard/types";
import type {
  CustomerPageBranding,
  CustomerPageBusinessInfo,
  CustomerPageSocial,
} from "@/features/customer-page/types";
/** Public business presentation only. User identity and customer data never enter this store. */
export interface BusinessProfile {
  businessId: string;
  business: CustomerPageBusinessInfo;
  branding: CustomerPageBranding;
  social: CustomerPageSocial;
  country: string;
}
export const businessProfileEvent = "memberflow:business-profile-changed";
const key = (id: string) => `memberflow:business-profile:v2:${id}`;
const temporaryMedia = new Map<
  string,
  { revision: string; branding: CustomerPageBranding }
>();
const development = () =>
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DASHBOARD_MODE !== "api";
const strings = (value: unknown, fields: string[]) =>
  !!value &&
  typeof value === "object" &&
  fields.every(
    (field) => typeof (value as Record<string, unknown>)[field] === "string",
  );
const media = (value: unknown) =>
  value === null ||
  (typeof value === "string" &&
    ((value.startsWith("/") && !value.startsWith("//")) ||
      /^https?:\/\//.test(value)));
export function readBusinessProfile(id: string): BusinessProfile | null {
  if (!development()) return null;
  try {
    let p = JSON.parse(localStorage.getItem(key(id)) || "null");
    if (!p) {
      // Migrate public fields only; owner/customer data is never copied.
      const oldPage = JSON.parse(
        localStorage.getItem(`memberflow:customer-page-preview:v1:${id}`) ||
          "null",
      );
      const oldSettings = JSON.parse(
        sessionStorage.getItem(`memberflow:workspace:v1:${id}:settings`) ||
          "null",
      );
      if (oldPage?.businessId !== id && !oldSettings) return null;
      const b = oldPage?.business ?? {};
      const brand = oldPage?.branding ?? {};
      const social = oldPage?.social ?? {};
      const pick = (field: string, fallback: string = "") =>
        typeof oldSettings?.[field] === "string"
          ? oldSettings[field]
          : typeof b[field] === "string"
            ? b[field]
            : fallback;
      p = {
        businessId: id,
        country:
          typeof oldSettings?.country === "string" ? oldSettings.country : "",
        business: {
          name: pick("name"),
          category: pick("category"),
          city: pick("city"),
          description: pick("description"),
          address: pick("address"),
          openingHours: pick("openingHours"),
          phone: pick("phone"),
          email: pick("email"),
        },
        branding: {
          accent: pick("accent", brand.accent ?? "#c84720"),
          logoUrl: media(oldSettings?.logoUrl)
            ? oldSettings.logoUrl
            : media(brand.logoUrl)
              ? brand.logoUrl
              : null,
          coverUrl: media(brand.coverUrl) ? brand.coverUrl : null,
        },
        social: {
          website:
            typeof oldSettings?.website === "string"
              ? oldSettings.website
              : (social.website ?? ""),
          instagram:
            typeof oldSettings?.instagram === "string"
              ? oldSettings.instagram
              : (social.instagram ?? ""),
          tiktok: social.tiktok ?? "",
          facebook: social.facebook ?? "",
        },
      };
    }
    if (
      !p ||
      p.businessId !== id ||
      !strings(p.business, [
        "name",
        "category",
        "description",
        "city",
        "address",
        "openingHours",
        "phone",
        "email",
      ]) ||
      !strings(p.social, ["website", "instagram", "tiktok", "facebook"]) ||
      typeof p.country !== "string" ||
      !/^#[0-9a-f]{6}$/i.test(p.branding?.accent) ||
      !media(p.branding.logoUrl) ||
      !media(p.branding.coverUrl)
    )
      return null;
    const temporary = temporaryMedia.get(id);
    return {
      businessId: id,
      country: p.country,
      business: p.business,
      social: p.social,
      branding:
        temporary && temporary.revision === p.revision
          ? temporary.branding
          : p.branding,
    };
  } catch {
    return null;
  }
}
export function saveBusinessProfile(profile: BusinessProfile) {
  if (!development()) throw new Error("unavailable");
  if (
    !profile.business.name.trim() ||
    !/^#[0-9a-f]{6}$/i.test(profile.branding.accent)
  )
    throw new Error("invalid");
  const revision = crypto.randomUUID();
  const safe = {
    ...profile,
    revision,
    branding: {
      ...profile.branding,
      logoUrl: media(profile.branding.logoUrl)
        ? profile.branding.logoUrl
        : null,
      coverUrl: media(profile.branding.coverUrl)
        ? profile.branding.coverUrl
        : null,
    },
  };
  localStorage.setItem(key(profile.businessId), JSON.stringify(safe));
  temporaryMedia.set(profile.businessId, {
    revision,
    branding: profile.branding,
  });
  window.dispatchEvent(new Event(businessProfileEvent));
}
export function profileFromBusiness(b: BusinessSummary): BusinessProfile {
  return {
    businessId: b.id,
    country: b.country ?? "",
    business: {
      name: b.name,
      category: b.category,
      city: b.city,
      description: b.description ?? "",
      address: b.address ?? "",
      openingHours: b.openingHours ?? "",
      phone: b.phone ?? "",
      email: b.email ?? "",
    },
    branding: {
      logoUrl: b.logoUrl,
      coverUrl: b.coverUrl ?? null,
      accent: b.accent,
    },
    social: {
      website: b.website ?? "",
      instagram: b.instagram ?? "",
      tiktok: b.tiktok ?? "",
      facebook: b.facebook ?? "",
    },
  };
}
export function applyBusinessProfile(b: BusinessSummary): BusinessSummary {
  const p = readBusinessProfile(b.id);
  return p
    ? { ...b, ...p.business, ...p.branding, ...p.social, country: p.country }
    : b;
}

export interface BusinessLocation {
  id: string;
  businessId: string;
  name: string;
  city: string;
  address: string;
}
export function mainPrototypeLocation(
  profile: BusinessProfile,
): BusinessLocation {
  return {
    id: `${profile.businessId}:main`,
    businessId: profile.businessId,
    name: profile.business.name,
    city: profile.business.city,
    address: profile.business.address,
  };
}
