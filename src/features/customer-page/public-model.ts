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
/** Accept a bare domain in an editor, while retaining explicit safe HTTP(S) links. */
export function normalizeWebAddress(value: string) {
  const raw = value.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return safeLink(raw) ?? raw;
  if (/^[a-z][a-z\d+.-]*:/i.test(raw) || /\s/.test(raw)) return raw;
  try {
    const candidate = raw.startsWith("//") ? `https:${raw}` : `https://${raw}`;
    const url = new URL(candidate);
    return url.hostname.includes(".") ? safeLink(candidate) ?? raw : raw;
  } catch {
    return raw;
  }
}
export function accentStyle(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#c84a27";
}
