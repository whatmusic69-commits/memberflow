"use client";
import { sessionDestination } from "@/features/access/permissions";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HomeLink } from "@/components/ui/home-link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Wordmark, FlowMark } from "@/components/ui/brand";
import { OnboardingLanguageSwitcher } from "@/features/onboarding/language-switcher";
import { authContent } from "@/content/auth";
import type { Locale } from "@/content";
import { authService, AuthServiceError, type AuthErrorCode } from "./service";
import { AuthFlow } from "./auth-flow";
import { safeAuthRedirect } from "./redirect";
export function AuthPage({
  initialLocale,
  mode = "login",
  redirectTo,
  sessionExpired = false,
}: {
  initialLocale: Locale;
  mode?: "login" | "reset";
  redirectTo?: string;
  sessionExpired?: boolean;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const c = authContent[locale];
  const reset = mode === "reset";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(
    sessionExpired ? "expired" : null,
  );
  const [fieldErrors, setFields] = useState<{
    email?: "requiredEmail" | "invalidEmail" | "fieldInvalid";
    password?: "requiredPassword" | "fieldInvalid";
  }>({});
  const [sent, setSent] = useState(false);
  const lock = useRef(false);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `memberflow_locale=${locale}; Path=/; SameSite=Lax; Max-Age=31536000`;
  }, [locale]);
  function changeLanguage(next: Locale) {
    setLocale(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}`,
    );
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const fields: typeof fieldErrors = {};
    if (!email.trim()) fields.email = "requiredEmail";
    else if (!emailInput.current?.validity.valid) fields.email = "invalidEmail";
    if (!reset && !password) fields.password = "requiredPassword";
    setFields(fields);
    setError(null);
    if (fields.email) {
      emailInput.current?.focus();
      return;
    }
    if (fields.password) {
      passwordInput.current?.focus();
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      if (reset) {
        await authService.requestPasswordReset(email.trim());
        setSent(true);
      } else {
        const session = await authService.login({
          email: email.trim(),
          password,
        });
        const experience = sessionDestination(session);
        if (!experience) throw new AuthServiceError("unavailable");
        setPassword("");
        const destination = new URL(
          experience === "/staff" ? "/staff" : safeAuthRedirect(redirectTo),
          window.location.origin,
        );
        if (!destination.searchParams.has("lang"))
          destination.searchParams.set("lang", locale);
        router.replace(
          `${destination.pathname}${destination.search}${destination.hash}`,
        );
      }
    } catch (caught) {
      const failure =
        caught instanceof AuthServiceError
          ? caught
          : new AuthServiceError("network");
      setError(failure.code);
      setFields(
        Object.fromEntries(
          failure.fields.map((field) => [field, "fieldInvalid"]),
        ),
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const loginUrl = `/login?lang=${locale}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ""}`;
  return (
    <div className="auth-shell">
      <header className="auth-header container">
        <HomeLink locale={locale} aria-label="MemberFlow">
          <Wordmark />
        </HomeLink>
        <OnboardingLanguageSwitcher locale={locale} onChange={changeLanguage} />
      </header>
      <main id="main" className="auth-main container">
        <div className="auth-content">
          <HomeLink className="auth-back" locale={locale}>
            <ArrowLeft size={14} />
            {c.backHome}
          </HomeLink>
          <p className="eyebrow">
            <span className="status-dot" />
            {reset ? c.resetAccess : c.access}
          </p>
          <h1>{reset ? c.resetTitle : c.welcome}</h1>
          <p className="auth-support">{reset ? c.resetIntro : c.intro}</p>
          <form noValidate onSubmit={submit} aria-busy={busy}>
            <label className="auth-field" htmlFor="auth-email">
              {c.email}
            </label>
            <input
              ref={emailInput}
              id="auth-email"
              className="auth-input"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={
                fieldErrors.email ? "auth-email-error" : undefined
              }
            />
            {fieldErrors.email && (
              <p id="auth-email-error" className="auth-field-error">
                {c[fieldErrors.email]}
              </p>
            )}
            {!reset && (
              <>
                <div className="auth-password-heading">
                  <label className="auth-field" htmlFor="auth-password">
                    {c.password}
                  </label>
                  <Link href={`/forgot-password?lang=${locale}`}>
                    {c.forgot}
                  </Link>
                </div>
                <div className="auth-password">
                  <input
                    ref={passwordInput}
                    id="auth-password"
                    className="auth-input"
                    type={visible ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={
                      fieldErrors.password ? "auth-password-error" : undefined
                    }
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    aria-label={visible ? c.hide : c.show}
                    aria-controls="auth-password"
                    aria-pressed={visible}
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="auth-password-error" className="auth-field-error">
                    {c[fieldErrors.password]}
                  </p>
                )}
              </>
            )}
            <div className="auth-status" aria-live="polite" aria-atomic="true">
              {error && <p className="auth-error">{c[error]}</p>}
              {sent && <p className="auth-reset-sent">{c.resetSent}</p>}
            </div>
            <button
              type="submit"
              className="button button-primary auth-submit"
              disabled={busy || sent}
            >
              {busy
                ? reset
                  ? c.sending
                  : c.loading
                : reset
                  ? c.sendReset
                  : c.login}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
          {reset ? (
            <Link className="auth-other-link" href={loginUrl}>
              <ArrowLeft size={14} />
              {c.backLogin}
            </Link>
          ) : (
            <p className="auth-new-user">
              {c.newUser}
              <Link href={`/${locale}/onboarding`}>
                {c.start}
                <ArrowRight size={14} />
              </Link>
            </p>
          )}
        </div>
        <aside className="auth-visual" aria-hidden="true">
          <AuthFlow />
          <div className="auth-visual-copy">
            <FlowMark />
            <p>MemberFlow</p>
            <span>{c.visual}</span>
          </div>
        </aside>
      </main>
    </div>
  );
}
