export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API request failed (${status})`);
    this.name = "ApiError";
  }
}
/** Transport only. No business rules, authentication implementation, or demo fallback. */
export async function apiRequest<T>(
  path: `/api/${string}`,
  options: RequestInit = {},
): Promise<T> {
  const origin = process.env.NEXT_PUBLIC_API_URL;
  if (!origin) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  )
    headers.set("Content-Type", "application/json");
  const response = await fetch(`${origin.replace(/\/$/, "")}${path}`, {
    ...options,
    headers,
  });
  const body: unknown =
    response.status === 204
      ? undefined
      : response.headers.get("content-type")?.includes("application/json")
        ? await response.json()
        : await response.text();
  if (!response.ok) throw new ApiError(response.status, body);
  return body as T;
}
