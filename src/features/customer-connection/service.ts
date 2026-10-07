export interface CustomerConnection {
  businessId: string;
  publicId: string;
  publicUrl: string | null;
  status: "READY" | "NOT_CONFIGURED" | "DISABLED";
}
export function validPublicUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ||
      (process.env.NODE_ENV === "development" && url.protocol === "http:")
      ? url.href
      : null;
  } catch {
    return null;
  }
}
