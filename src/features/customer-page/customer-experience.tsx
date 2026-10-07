"use client";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content";
import { customerPageContent } from "@/content/customer-page";
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
    return () => {
      disposed = true;
      window.removeEventListener("storage", load);
    };
  }, [demo, previewId, retry]);
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
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
  }, [slug, demo, retry, connectedFixture]);
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
      <CustomerPageView
        page={page}
        personal={personal}
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
          {demo || !page.connection.joinEnabled ? (
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
