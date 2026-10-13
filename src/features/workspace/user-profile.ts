/** Owner display-name draft only, scoped to the user rather than one business. */
const key = (userId: string) => `memberflow:user-profile:v1:${userId}`;
export function readLocalUserName(userId: string): string | null {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DASHBOARD_MODE === "api"
  )
    return null;
  try {
    const p = JSON.parse(sessionStorage.getItem(key(userId)) || "null");
    return p?.userId === userId &&
      typeof p.firstName === "string" &&
      p.firstName.trim()
      ? p.firstName
      : null;
  } catch {
    return null;
  }
}
export function saveLocalUserName(userId: string, firstName: string) {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DASHBOARD_MODE === "api" ||
    !firstName.trim()
  )
    throw new Error("unavailable");
  sessionStorage.setItem(
    key(userId),
    JSON.stringify({ userId, firstName: firstName.trim() }),
  );
  window.dispatchEvent(new Event("memberflow:workspace-drafts-changed"));
}
