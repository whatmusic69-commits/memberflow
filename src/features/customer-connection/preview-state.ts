const key = (id: string) => `memberflow:qr-preview:v1:${id}`;
export function readQrPreview(id: string, slug: string) {
  if (process.env.NODE_ENV !== "development") return false;
  try {
    return sessionStorage.getItem(key(id)) === slug;
  } catch {
    return false;
  }
}
export function rememberQrPreview(id: string, slug: string) {
  if (process.env.NODE_ENV !== "development" || readQrPreview(id, slug)) return;
  try {
    sessionStorage.setItem(key(id), slug);
    window.dispatchEvent(new Event("memberflow:workspace-drafts-changed"));
  } catch {
    /* The QR can still be displayed if storage is disabled. */
  }
}
