"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift } from "lucide-react";
import type { Locale } from "@/content";
import { registrationContent } from "@/content/customer-registration";
import { CustomerImage } from "@/features/customer-page/customer-image";
import { readPageDraft } from "@/features/customer-page/service";
import { publicProjection } from "@/features/customer-page/public-model";
import { customerSessionService } from "@/features/customer-page/session-service";
import type { CustomerPagePublic } from "@/features/customer-page/types";
import { readLocalRecords } from "@/features/workspace/repository";
import { prototypeEnabled } from "@/features/prototype/repository";
import {
  registrationFields,
  missingFields,
  type PreviewCustomerAccount,
} from "./model";
import {
  readCustomerPreview,
  readRegistrationPolicy,
  beginCustomerPreview,
  currentParticipation,
  joinCustomerPreview,
} from "./repository";
export function CustomerRegistration({
  slug,
  previewId,
  locale,
  initialPage,
}: {
  slug: string;
  previewId?: string;
  locale: Locale;
  initialPage: CustomerPagePublic | null;
}) {
  const c = registrationContent[locale],
    router = useRouter(),
    local = !!previewId && prototypeEnabled();
  const [page, setPage] = useState(initialPage),
    [loaded, setLoaded] = useState(false),
    [stage, setStage] = useState<"identify" | "code" | "profile">("identify"),
    [account, setAccount] = useState<PreviewCustomerAccount | null>(null);
  const [method, setMethod] = useState<"email" | "phone">(
      local ? "email" : "phone",
    ),
    [identity, setIdentity] = useState(""),
    [code, setCode] = useState(""),
    [challenge, setChallenge] = useState<string | null>(null),
    [remaining, setRemaining] = useState(0);
  const [values, setValues] = useState({ name: "", email: "", phone: "" }),
    [programmeId, setProgramme] = useState(""),
    [share, setShare] = useState(false),
    [marketing, setMarketing] = useState({ email: false, sms: false });
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [existingId, setExisting] = useState<string | null>(null);
  const lock = useRef(false),
    alive = useRef(true);
  const query = new URLSearchParams({
    lang: locale,
    ...(local && previewId ? { preview: previewId } : {}),
  });
  const returnUrl = `/b/${encodeURIComponent(slug)}?${query}`;
  useEffect(() => {
    alive.current = true;
    document.documentElement.lang = locale;
    return () => {
      alive.current = false;
    };
  }, [locale]);
  useEffect(() => {
    let disposed = false;
    void Promise.resolve().then(() => {
      if (disposed) return;
      if (local && previewId) {
        const config = readPageDraft(previewId);
        setPage(config?.slug === slug ? publicProjection(config) : null);
        const s = readCustomerPreview();
        if (s) {
          setAccount(s.account);
          setValues(s.account);
          setStage("profile");
          setExisting(currentParticipation(previewId)?.customerId ?? null);
        }
      }
      setLoaded(true);
    });
    return () => {
      disposed = true;
    };
  }, [local, previewId, slug]);
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);
  const policy = previewId && local ? readRegistrationPolicy(previewId) : null;
  const programmes =
    previewId && local
      ? readLocalRecords(previewId, "loyalty").filter((p) => !p.archived)
      : [];
  function card(id?: string) {
    router.replace(
      id
        ? `${returnUrl}&prototypeCustomer=${encodeURIComponent(id)}`
        : returnUrl,
    );
  }
  async function send() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      setStage("code");
      if (local) throw new Error("unavailable");
      if (method !== "phone") throw new Error("contract");
      const result = await customerSessionService(slug).startJoin(identity);
      if (alive.current) {
        setChallenge(result.challengeId);
        setRemaining(30);
      }
    } catch (err) {
      if (alive.current)
        setError(
          err instanceof Error && err.message === "contract"
            ? c.productionFields
            : c.unavailable,
        );
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function verify() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (local || !challenge) throw new Error("unavailable");
      await customerSessionService(slug).verifyOtp(challenge, code);
      if (alive.current) card();
    } catch {
      if (alive.current) setError(local ? c.unavailable : c.error);
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  function fictional() {
    try {
      if (method === "phone" && !/^\+?[\d ()-]{7,32}$/.test(identity))
        throw new Error("invalid");
      const s = beginCustomerPreview(
        method === "email" ? identity : "customer@example.test",
      );
      const profile =
        method === "phone" ? { ...s.account, phone: identity } : s.account;
      setAccount(profile);
      setValues(profile);
      setStage("profile");
      if (previewId) setExisting(currentParticipation(previewId)?.customerId ?? null);
      setError("");
    } catch {
      setError(c.fictionalError);
    }
  }
  async function join(event: React.FormEvent) {
    event.preventDefault();
    if (lock.current || !local || !previewId) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const link = await joinCustomerPreview(
        previewId,
        values,
        programmeId || null,
        share,
        marketing,
      );
      if (alive.current) card(link.customerId);
    } catch {
      if (alive.current) setError(c.error);
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  if (!loaded)
    return (
      <main className="cr-shell" aria-busy="true">
        <p role="status">{c.working}</p>
      </main>
    );
  if (!page || page.status !== "ACTIVE")
    return (
      <main className="cr-shell">
        <h1>{c.notReady}</h1>
        {local && previewId && <><p>{c.draftHelp}</p><Link href={`/dashboard/customer-page?lang=${locale}&business=${encodeURIComponent(previewId)}`}>{c.builder}</Link></>}
        <Link href={returnUrl}>{c.cancel}</Link>
      </main>
    );
  const missing = account && policy ? missingFields(account, policy) : [];
  return (
    <main id="main" className="cr-shell">
      <Link className="cr-back" href={returnUrl}>
        <ArrowLeft size={15} />
        {c.cancel}
      </Link>
      <section className="cr-card">
        <header className="cr-business">
          <CustomerImage
            src={page.branding.logoUrl}
            alt=""
            className="cp-logo"
            fallback={
              <span className="cp-logo cp-logo-fallback">
                {page.business.name.slice(0, 2)}
              </span>
            }
          />
          <h1>{c.title.replace("{business}", page.business.name)}</h1>
          <p>{c.intro}</p>
          {page.loyalty && (
            <div className="cr-benefit">
              <Gift size={17} />
              <span>{page.loyalty.reward}</span>
            </div>
          )}
        </header>
        {local && <p className="cr-notice">{c.previewNotice}</p>}
        {existingId ? (
          <div className="cr-step">
            <p>{c.ready}</p>
            <button className="cp-button" onClick={() => card(existingId)}>
              {c.openCard}
            </button>
          </div>
        ) : stage === "identify" ? (
          <form
            className="cr-step"
            onSubmit={(e) => {
              e.preventDefault();
              if(local) fictional(); else void send();
            }}
          >
            <h2>{c.identify}</h2>
            <p>{c.identifyText}</p>
            <label>
              <span>{c.method}</span>
              <select
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value as "email" | "phone");
                  setIdentity("");
                }}
              >
                <option value="email">{c.email}</option>
                <option value="phone">{c.phone}</option>
              </select>
            </label>
            <label>
              <span>{method === "email" ? c.email : c.phone}</span>
              <input
                type={method === "email" ? "email" : "tel"}
                autoComplete={method === "email" ? "email" : "tel"}
                placeholder={local ? (method === "email" ? "alex@example.test" : "+00000000000") : undefined}
                required
                maxLength={254}
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
              />
            </label>
            <button className="cp-button" disabled={busy}>
              {busy ? c.working : local ? c.fictional : c.continue}
            </button>
            {local && <button type="button" className="cp-text-action" onClick={() => void send()}>{c.otpPreview}</button>}
          </form>
        ) : stage === "code" ? (
          <form
            className="cr-step"
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
          >
            <h2>{c.otpTitle}</h2>
            <p>{c.otpText}</p>
            <label>
              <span>{c.code}</span>
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </label>
            <button className="cp-button" disabled={busy}>
              {busy ? c.working : c.verify}
            </button>
            <button
              type="button"
              className="cp-text-action"
              disabled={busy || remaining > 0}
              onClick={() => void send()}
            >
              {c.resend}
              {remaining > 0 ? ` · ${remaining}s` : ""}
            </button>
            {local && (
              <button
                type="button"
                className="button cr-preview-button"
                disabled={busy}
                onClick={fictional}
              >
                {c.fictional}
              </button>
            )}
            <button
              type="button"
              className="cp-text-action"
              onClick={() => {
                setStage("identify");
                setCode("");
                setChallenge(null);
                setError("");
              }}
            >
              {c.identify}
            </button>
          </form>
        ) : (
          <form className="cr-step" onSubmit={(e) => void join(e)}>
            <h2>{c.profile}</h2>
            <p>{account?.name ? c.existing : c.profileText}</p>
            {missing.map((field) => (
              <label key={field}>
                <span>{c.fields[field]}</span>
                <input
                  name={field}
                  type={
                    field === "email"
                      ? "email"
                      : field === "phone"
                        ? "tel"
                        : "text"
                  }
                  required
                  pattern={
                    field === "phone" ? "\\+?[0-9 ()-]{7,32}" : undefined
                  }
                  maxLength={
                    field === "name" ? 120 : field === "email" ? 254 : 32
                  }
                  value={values[field]}
                  onChange={(e) =>
                    setValues({ ...values, [field]: e.target.value })
                  }
                />
              </label>
            ))}
            {policy && registrationFields.some((f) => policy.fields[f]) && (
              <div className="cr-share">
                <dl>
                  {registrationFields
                    .filter((f) => policy.fields[f])
                    .map((f) => (
                      <div key={f}>
                        <dt>{c.fields[f]}</dt>
                        <dd>{values[f] || "—"}</dd>
                      </div>
                    ))}
                </dl>
                <label className="cr-check">
                  <input
                    type="checkbox"
                    required
                    checked={share}
                    onChange={(e) => setShare(e.target.checked)}
                  />
                  <span>
                    {c.share.replace("{business}", page.business.name)}
                  </span>
                </label>
              </div>
            )}
            {programmes.length > 0 && (
              <label>
                <span>{c.programme}</span>
                <select
                  value={programmeId}
                  required
                  onChange={(e) => setProgramme(e.target.value)}
                >
                  <option value="">{c.choose}</option>
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {policy?.marketingEmail && (
              <label className="cr-check">
                <input
                  type="checkbox"
                  checked={marketing.email}
                  onChange={(e) =>
                    setMarketing({ ...marketing, email: e.target.checked })
                  }
                />
                <span>{c.marketingEmailConsent}</span>
              </label>
            )}
            {policy?.marketingSms && (
              <label className="cr-check">
                <input
                  type="checkbox"
                  checked={marketing.sms}
                  onChange={(e) =>
                    setMarketing({ ...marketing, sms: e.target.checked })
                  }
                />
                <span>{c.marketingSmsConsent}</span>
              </label>
            )}
            <button className="cp-button" disabled={busy}>
              {busy ? c.working : c.join}
            </button>
          </form>
        )}
        {error && (
          <p className="cr-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
