import { ApiError, apiRequest } from "@/lib/api/client";
import type { SessionContext } from "@/features/access/types";
export type AuthErrorCode =
  | "invalidCredentials"
  | "tooMany"
  | "network"
  | "expired"
  | "unavailable"
  | "fieldInvalid";
export class AuthServiceError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    public readonly fields: ("email" | "password")[] = [],
  ) {
    super(code);
    this.name = "AuthServiceError";
  }
}
export interface AuthService {
  login(data: { email: string; password: string }): Promise<SessionContext>;
  requestPasswordReset(email: string): Promise<void>;
  logout(): Promise<void>;
}
function translateError(error: unknown): AuthServiceError {
  if (error instanceof AuthServiceError) return error;
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 404)
      return new AuthServiceError("invalidCredentials");
    if (error.status === 429) return new AuthServiceError("tooMany");
    if (error.status === 403) return new AuthServiceError("expired");
    if (error.status === 400 || error.status === 422) {
      const body = error.body as { errors?: Record<string, unknown> } | null;
      const fields = (["email", "password"] as const).filter(
        (field) => body?.errors?.[field],
      );
      return new AuthServiceError("fieldInvalid", fields);
    }
  }
  return new AuthServiceError("network");
}
/** Contract proposal only. Secure cookie sessions and DTOs require Symfony agreement. */
const symfonyAuthService: AuthService = {
  async logout() {
    try {
      await apiRequest("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      throw translateError(error);
    }
  },
  async login(data) {
    try {
      await apiRequest("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include",
      });
      const session = await apiRequest<SessionContext>("/api/v1/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (!session.user?.id || !Array.isArray(session.businesses))
        throw new AuthServiceError("expired");
      return session;
    } catch (error) {
      throw translateError(error);
    }
  },
  async requestPasswordReset(email) {
    try {
      await apiRequest("/api/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        credentials: "include",
      });
    } catch (error) {
      throw translateError(error);
    }
  },
};
/** Isolated unavailable adapter; never pretends an account exists or an email was sent. */
const unavailableAuthService: AuthService = {
  async logout() {
    throw new AuthServiceError("unavailable");
  },
  async login() {
    await new Promise((resolve) => setTimeout(resolve, 250));
    throw new AuthServiceError("unavailable");
  },
  async requestPasswordReset() {
    await new Promise((resolve) => setTimeout(resolve, 250));
    throw new AuthServiceError("unavailable");
  },
};
export const authService: AuthService =
  process.env.NEXT_PUBLIC_AUTH_MODE === "symfony" &&
  process.env.NEXT_PUBLIC_API_URL
    ? symfonyAuthService
    : unavailableAuthService;
