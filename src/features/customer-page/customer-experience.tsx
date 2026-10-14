"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content";
import { customerPageContent } from "@/content/customer-page";
import { LocalMembershipCards } from "@/features/prototype/membership-cards";
import { useRouter } from "next/navigation";
import {
  currentParticipation,
  endCustomerPreview,
} from "@/features/customer-registration/repository";
import { PersonalPreviewCard } from "@/features/customer-registration/personal-card";
import { registrationContent } from "@/content/customer-registration";
import {
  prototypePersonal,
  prototypeCode,
} from "@/features/prototype/customer-model";
import { prototypeContent } from "@/content/prototype";
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
  const router = useRouter();
  const [page, setPage] = useState(initialPage),
    [personal, setPersonal] = useState<CustomerPagePersonal | null>(null);
  const [failed, setFailed] = useState(false),
    [personalError, setPersonalError] = useState(false),
    [retry, setRetry] = useState(0);
  const lock = useRef(false),
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
      const query = new URLSearchParams(window.location.search);
      const selected =
        query.get("guest") === "1"
          ? null
          : (query.get("prototypeCustomer") ??
            currentParticipation(previewId)?.customerId ??
            null);
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
  async function logout() {
    if (lock.current || !page) return;
    if (demo && previewId) {
      endCustomerPreview();
      setPersonal(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("prototypeCustomer");
      window.history.replaceState(window.history.state, "", url);
      return;
    }
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
  return (
    <>
      {demo && previewId && (
        <aside className="cp-session-error">
          <p>{prototypeContent[locale].notice}</p>
          {page.status !== "ACTIVE" && (
            <>
              <p>{registrationContent[locale].draftHelp}</p>
              <Link href={`/dashboard/customer-page?lang=${locale}&business=${encodeURIComponent(previewId)}`}>
                {registrationContent[locale].builder} →
              </Link>
            </>
          )}
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
          const query = new URLSearchParams({
            lang: locale,
            ...(demo && previewId ? { preview: previewId } : {}),
          });
          router.push(`/b/${encodeURIComponent(page.slug)}/join?${query}`);
        }}
        onLogout={personal ? () => void logout() : undefined}
        personalCard={
          demo && previewId && personal ? (
            <PersonalPreviewCard
              businessId={previewId}
              customerId={personal.customer.id}
              locale={locale}
            />
          ) : undefined
        }
      />
      {demo && personal && (
        <p className="cr-session-note">
          {registrationContent[locale].previewNotice}
        </p>
      )}
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
    </>
  );
}
