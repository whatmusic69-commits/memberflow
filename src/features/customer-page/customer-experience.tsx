"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content";
import { customerPageContent } from "@/content/customer-page";
import { LocalMembershipCards } from "@/features/prototype/membership-cards";
import { PrototypeJoin } from "@/features/prototype/public-join";
import {
  prototypePersonal,
  prototypeCode,
} from "@/features/prototype/customer-model";
import { prototypeContent } from "@/content/prototype";
import { Modal } from "@/components/ui/modal";
import { animateDialogClose } from "@/lib/motion/dialog";
import { CustomerPageView } from "./page-view";
import { publicProjection } from "./public-model";
import { customerSessionService } from "./session-service";
import type { CustomerPagePublic, CustomerPagePersonal } from "./types";
export function CustomerExperience({
  initialPage,
  locale,
  demo = false,
  previewId,
  connectedFixture = false,
}: {
  initialPage: CustomerPagePublic | null;
  locale: Locale;
  demo?: boolean;
  previewId?: string;
  connectedFixture?: boolean;
}) {
  const c = customerPageContent[locale];
  const [page, setPage] = useState(initialPage),
    [personal, setPersonal] = useState<CustomerPagePersonal | null>(null);
  const [failed, setFailed] = useState(false),
    [personalError, setPersonalError] = useState(false),
    [retry, setRetry] = useState(0);
  const [join, setJoin] = useState(false),
    [phone, setPhone] = useState(""),
    [code, setCode] = useState(""),
    [challenge, setChallenge] = useState<string | null>(null);
  const [authError, setAuthError] = useState(""),
    [busy, setBusy] = useState(false);
  const lock = useRef(false),
    modal = useRef<HTMLDialogElement>(null),
    alive = useRef(true);
  const slug = page?.slug;
  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `memberflow_locale=${locale}; Path=/; SameSite=Lax; Max-Age=31536000`;
  }, [locale]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (!demo || !previewId) return;
    let disposed = false;
    const load = () =>
      import("./service").then(({ readPageDraft }) => {
        if (disposed) return;
        const config = readPageDraft(previewId);
        if (config) {
          setPage(publicProjection(config));
          setFailed(false);
        } else setFailed(true);
      });
    void load();
    window.addEventListener("storage", load);
    window.addEventListener("memberflow:workspace-drafts-changed", load);
    window.addEventListener("memberflow:customer-page-draft-changed", load);
    window.addEventListener("memberflow:business-profile-changed", load);
    return () => {
      disposed = true;
      window.removeEventListener("storage", load);
      window.removeEventListener("memberflow:workspace-drafts-changed", load);
      window.removeEventListener(
        "memberflow:customer-page-draft-changed",
        load,
      );
      window.removeEventListener("memberflow:business-profile-changed", load);
    };
  }, [demo, previewId, retry]);
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    if (demo && previewId) {
      const selected = new URLSearchParams(window.location.search).get(
        "prototypeCustomer",
      );
      void import("@/features/prototype/customer-model").then(
        ({ prototypePersonal }) => {
          if (controller.signal.aborted) return;
          try {
            setPersonal(
              selected ? prototypePersonal(previewId, selected) : null,
            );
          } catch {
            setPersonal(null);
          }
        },
      );
      return () => controller.abort();
    }
    if (demo && connectedFixture) {
      import("@/mocks/customer-page/fixtures").then(
        ({ connectedCustomerPage }) => {
          if (!controller.signal.aborted) setPersonal(connectedCustomerPage);
        },
      );
    } else
      customerSessionService(slug, demo)
        .getSession(controller.signal)
        .then((value) => {
          if (!controller.signal.aborted) {
            setPersonal(value);
            setPersonalError(false);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setPersonalError(true);
        });
    return () => controller.abort();
  }, [slug, demo, retry, connectedFixture, previewId]);
  const localCustomerId = demo && previewId ? personal?.customer.id : undefined;
  useEffect(() => {
    if (!previewId || !localCustomerId) return;
    const refresh = () => {
      try {
        setPersonal(prototypePersonal(previewId, localCustomerId));
      } catch {
        setPersonal(null);
      }
    };
    window.addEventListener("memberflow:workspace-drafts-changed", refresh);
    return () =>
      window.removeEventListener(
        "memberflow:workspace-drafts-changed",
        refresh,
      );
  }, [previewId, localCustomerId]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !page) return;
    lock.current = true;
    setBusy(true);
    setAuthError("");
    const service = customerSessionService(page.slug, demo);
    try {
      if (!challenge) {
        const result = await service.startJoin(phone);
        if (alive.current) setChallenge(result.challengeId);
      } else {
        const result = await service.verifyOtp(challenge, code);
        if (alive.current) {
          setPersonal(result);
          animateDialogClose(modal.current, () => {
            if (alive.current) {
              setJoin(false);
              setPhone("");
              setCode("");
              setChallenge(null);
            }
          });
        }
      }
    } catch (error) {
      if (alive.current)
        setAuthError(
          error instanceof Error && error.message === "unavailable"
            ? c.authUnavailable
            : c.authError,
        );
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function logout() {
    if (lock.current || !page) return;
    lock.current = true;
    try {
      await customerSessionService(page.slug, demo).logout();
      if (alive.current) setPersonal(null);
    } catch {
      if (alive.current) setPersonalError(true);
    } finally {
      lock.current = false;
    }
  }
  if (failed)
    return (
      <div className="cp-public-state">
        <h1>{c.unavailable}</h1>
        <button className="button" onClick={() => setRetry((n) => n + 1)}>
          {c.retry}
        </button>
      </div>
    );
  if (!page)
    return (
      <div className="cp-public-state cp-loading" aria-busy="true">
        <div className="cp-loading-cover" />
        <p role="status">{c.loading}</p>
      </div>
    );
  if (!demo && page.status !== "ACTIVE")
    return (
      <div className="cp-public-state">
        <h1>{c.unavailable}</h1>
      </div>
    );
  const closeJoin = () => {
    setJoin(false);
    setAuthError("");
    setCode("");
    setPhone("");
    setChallenge(null);
  };
  return (
    <>
      {demo && previewId && (
        <aside className="cp-session-error">
          <p>{prototypeContent[locale].notice}</p>
          <Link
            className="mf-text-link"
            href={`/dashboard/customers?lang=${locale}&business=${encodeURIComponent(previewId)}`}
          >
            {prototypeContent[locale].crm} →
          </Link>
          {personal && (
            <label className="mf-form-field">
              <span>{prototypeContent[locale].code}</span>
              <input
                readOnly
                value={prototypeCode(previewId, personal.customer.id)}
                onFocus={(e) => e.target.select()}
              />
            </label>
          )}
        </aside>
      )}
      <CustomerPageView
        page={page}
        personal={personal}
        localMemberships={
          demo && previewId && personal ? (
            <LocalMembershipCards
              businessId={previewId}
              customerId={personal.customer.id}
              locale={locale}
              history
            />
          ) : undefined
        }
        locale={locale}
        onJoin={() => {
          setAuthError("");
          setJoin(true);
        }}
        onLogout={personal && !demo ? () => void logout() : undefined}
      />
      {personalError && (
        <div className="cp-session-error" role="status">
          <p>{c.personalError}</p>
          <button
            className="cp-text-action"
            onClick={() => setRetry((n) => n + 1)}
          >
            {c.retry}
          </button>
        </div>
      )}
      {join && (
        <Modal
          dialogRef={modal}
          title={c.authTitle}
          closeLabel={c.cancel}
          onClose={closeJoin}
          closeDisabled={busy}
          className="cp-auth-dialog"
        >
          {demo && previewId && page.status === "ACTIVE" ? (
            <PrototypeJoin
              businessId={previewId}
              locale={locale}
              onJoined={(value) => {
                setPersonal(value);
                const url = new URL(window.location.href);
                url.searchParams.set("prototypeCustomer", value.customer.id);
                window.history.replaceState(window.history.state, "", url);
                animateDialogClose(modal.current, closeJoin);
              }}
            />
          ) : demo || !page.connection.joinEnabled ? (
            <>
              <p>{c.authUnavailable}</p>
              <button
                className="button"
                onClick={() => animateDialogClose(modal.current, closeJoin)}
              >
                {c.cancel}
              </button>
            </>
          ) : (
            <form onSubmit={(event) => void submit(event)}>
              <p>{challenge ? c.codeSent : c.authText}</p>
              <label className="mf-form-field">
                <span>{challenge ? c.code : c.phone}</span>
                {challenge ? (
                  <input
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    maxLength={12}
                  />
                ) : (
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={c.phonePlaceholder}
                    required
                    maxLength={32}
                  />
                )}
              </label>
              {authError && (
                <p role="alert" className="mf-form-error">
                  {authError}
                </p>
              )}
              <button className="cp-button" disabled={busy}>
                {busy ? c.working : challenge ? c.verify : c.sendCode}
              </button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
