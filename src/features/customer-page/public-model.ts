import type { CustomerPageConfig, CustomerPagePublic } from "./types";
/** Public configuration projection. Personal customer data is deliberately absent. */
export function publicProjection(
  config: CustomerPageConfig,
): CustomerPagePublic {
  return {
    slug: config.slug,
    status: config.status,
    branding: config.branding,
    business: config.business,
    modules: config.modules,
    social: config.social,
    offers: config.content.offers,
    loyalty: config.content.loyalty,
    availableMemberships: config.content.memberships,
    connection: { joinEnabled: config.status === "ACTIVE" },
  };
}
export function safeLink(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function accentStyle(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#c84a27";
}
