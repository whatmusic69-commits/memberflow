"use client";
import { rememberQrPreview } from "./preview-state";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/ui/brand";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Printer,
  Pencil,
  QrCode,
  ScanLine,
  Save,
} from "lucide-react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { OverviewSkeleton } from "@/features/dashboard/overview";
import { customerPageContent } from "@/content/customer-page";
import {
  customerPageService,
  customerPageDraftEvent,
  previewUrl,
} from "@/features/customer-page/service";
import type { CustomerPageConfig } from "@/features/customer-page/types";
import { connectionContent } from "@/content/customer-connection";
import { validPublicUrl, type CustomerConnection } from "./service";

export function ConnectionPage() {
  const { data, locale, loading, error, reload, href, can } = useWorkspace();
  const c = connectionContent[locale];
  const [connection, setConnection] = useState<CustomerConnection | null>(null);
  const [pending, setPending] = useState(true),
    [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [sampleUrl, setSampleUrl] = useState("");
  const [pageConfig, setPageConfig] = useState<CustomerPageConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);
  const saveLock = useRef(false);
  const alive = useRef(true);
  const [qr, setQr] = useState(""),
    [svg, setSvg] = useState("");
  const [qrFailed, setQrFailed] = useState(false);
  const [showLogo, setShowLogo] = useState(true),
    [showCity, setShowCity] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const heading = pageConfig?.invitation.headline || c.headline;
  const description = pageConfig?.invitation.message || c.description;
  const pageCopy = customerPageContent[locale];
  const posterBusiness = pageConfig?.business ?? data?.business;
  const posterLogo = pageConfig?.branding.logoUrl ?? null;
  const demo =
    data?.source === "demo" && process.env.NODE_ENV === "development";
  const businessId = data?.business.id;
  const currentBusiness = useRef(businessId);
  useEffect(() => {
    currentBusiness.current = businessId;
  }, [businessId]);
  const writable = can("customer-page.manage");
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (!businessId || !data) return;
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setPending(true);
        setFailed(false);
        setConnection(null);
        setCopyState("idle");
      }
    });
    customerPageService(data.business, demo)
      .get(controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        if (value.businessId !== businessId)
          throw new Error("Business mismatch");
        setPageConfig(value);
        if (demo) setSampleUrl(previewUrl(value, locale));
        setConnection({
          businessId: value.businessId,
          publicId: value.slug,
          publicUrl: value.publicUrl,
          status:
            value.status === "ACTIVE"
              ? "READY"
              : value.status === "DISABLED"
                ? "DISABLED"
                : "NOT_CONFIGURED",
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setPending(false);
      });
    return () => controller.abort();
  }, [businessId, data, demo, locale, retry]);
  useEffect(() => {
    const refresh = () => setRetry((n) => n + 1);
    window.addEventListener(customerPageDraftEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(customerPageDraftEvent, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const readyUrl =
    connection?.status === "READY"
      ? validPublicUrl(connection.publicUrl)
      : null;
  const url = demo ? sampleUrl : readyUrl;
  useEffect(() => {
    let disposed = false;
    Promise.resolve().then(() => {
      if (!disposed) {
        setQr("");
        setSvg("");
        setQrFailed(false);
      }
    });
    if (url)
      import("qrcode")
        .then(async ({ default: QRCode }) => {
          const result = await QRCode.toString(url, {
            type: "svg",
            errorCorrectionLevel: "M",
            margin: 4,
            width: 1200,
            color: { dark: "#171b18", light: "#ffffff" },
          });
          if (!disposed) {
            setSvg(result);
            if (demo && businessId && pageConfig?.status === "ACTIVE")
              rememberQrPreview(businessId, pageConfig.slug);
            setQr(
              `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result)}`,
            );
          }
        })
        .catch(() => {
          if (!disposed) setQrFailed(true);
        });
    return () => {
      disposed = true;
    };
  }, [url, retry, businessId, demo, pageConfig?.slug, pageConfig?.status]);
  if (loading) return <OverviewSkeleton />;
  if (!data || error || failed)
    return (
      <section className="mf-load-error">
        <h1>{c.error}</h1>
        <button
          className="button"
          onClick={() => {
            reload();
            setRetry((n) => n + 1);
          }}
        >
          {c.retry}
        </button>
      </section>
    );
  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }
  function updateInvitation(field: "headline" | "message", value: string) {
    setPageConfig((previous) =>
      previous
        ? {
            ...previous,
            invitation: { ...previous.invitation, [field]: value },
          }
        : null,
    );
    setSaveMessage("");
    setSaveFailed(false);
  }
  async function saveInvitation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !data ||
      !pageConfig ||
      !writable ||
      pending ||
      saveLock.current ||
      pageConfig.businessId !== businessId
    )
      return;
    const savedBusinessId = data.business.id;
    saveLock.current = true;
    setSaving(true);
    setSaveMessage("");
    setSaveFailed(false);
    try {
      const saved = await customerPageService(data.business, demo).save({
        branding: pageConfig.branding,
        business: pageConfig.business,
        modules: pageConfig.modules,
        social: pageConfig.social,
        invitation: pageConfig.invitation,
      });
      if (saved.businessId !== savedBusinessId)
        throw new Error("Business mismatch");
      if (alive.current && currentBusiness.current === savedBusinessId) {
        setPageConfig(saved);
        setSaveMessage(demo ? pageCopy.previewSaved : pageCopy.saved);
      }
    } catch {
      if (alive.current && currentBusiness.current === savedBusinessId)
        setSaveFailed(true);
    } finally {
      saveLock.current = false;
      if (alive.current) setSaving(false);
    }
  }
  function download() {
    if (!svg) return;
    const blob = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml" }),
    );
    const link = document.createElement("a");
    link.href = blob;
    link.download = `memberflow-${businessId}-qr${demo ? "-sample" : ""}.svg`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(blob), 1000);
  }
  return (
    <section className="mf-feature-page mf-connection-page">
      <Link className="mf-text-link" href={href("customers")}>
        <ArrowLeft size={16} />
        {c.back}
      </Link>
      <header className="mf-feature-heading">
        <div>
          <p className="mf-kicker">{posterBusiness?.name || ""}</p>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
        </div>
      </header>
      <div className="mf-print-layout">
        <aside className="mf-print-controls">
          <div className="mf-print-intro">
            <QrCode size={24} />
            <h2>{c.poster}</h2>
            <p>{c.posterIntro}</p>
          </div>
          <div className="mf-print-status">
            <span className="mf-kicker">{c.status}</span>
            <strong>{readyUrl ? c.ready : c.pending}</strong>
          </div>
          <h3>{c.settings}</h3>
          <form
            className="mf-poster-editor"
            onSubmit={(event) => void saveInvitation(event)}
          >
            <fieldset disabled={!writable || pending || saving || !pageConfig}>
              <label>
                <span>{c.headingLabel}</span>
                <input
                  value={pageConfig?.invitation.headline ?? ""}
                  placeholder={c.headline}
                  maxLength={90}
                  onChange={(event) =>
                    updateInvitation("headline", event.target.value)
                  }
                />
              </label>
              <label>
                <span>{c.descriptionLabel}</span>
                <textarea
                  rows={3}
                  value={pageConfig?.invitation.message ?? ""}
                  placeholder={c.description}
                  maxLength={180}
                  onChange={(event) =>
                    updateInvitation("message", event.target.value)
                  }
                />
              </label>
              <button className="button button-primary" type="submit">
                <Save size={16} aria-hidden="true" />
                {saving ? pageCopy.saving : pageCopy.save}
              </button>
            </fieldset>
            {saveFailed && <p role="alert">{pageCopy.error}</p>}
            <p role="status">{saveMessage}</p>
          </form>
          <div className="mf-poster-page-actions">
            <Link className="button" href={href("customer-page")}>
              <Pencil size={16} aria-hidden="true" />
              {pageCopy.title}
            </Link>
            {url && (
              <a
                className="button"
                href={url}
                target={demo ? undefined : "_blank"}
                rel={demo ? undefined : "noopener noreferrer"}
              >
                {pageCopy.open}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </div>
          {posterLogo && (
            <label className="mf-print-check">
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
              />
              {c.showLogo}
            </label>
          )}
          {posterBusiness?.city && (
            <label className="mf-print-check">
              <input
                type="checkbox"
                checked={showCity}
                onChange={(e) => setShowCity(e.target.checked)}
              />
              {c.showCity}
            </label>
          )}
          <div className="mf-poster-export-actions">
            <button
              className="button mf-poster-print-button"
              disabled={!qr || pending || qrFailed}
              onClick={() => window.print()}
            >
              <Printer size={17} />
              {c.print}
            </button>
            <button
              className="button"
              disabled={!svg || pending}
              onClick={download}
            >
              <Download size={17} />
              {c.download}
            </button>
          </div>
          {url && (
            <div className="mf-print-link">
              <label htmlFor="customer-public-link">{c.link}</label>
              <input
                id="customer-public-link"
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
              />
              <button className="mf-text-link" onClick={() => void copyLink()}>
                {copyState === "copied" ? (
                  <Check size={15} />
                ) : (
                  <Copy size={15} />
                )}
                {copyState === "copied" ? c.copied : c.copy}
              </button>
              <p role="status">{copyState === "error" ? c.copyError : ""}</p>
            </div>
          )}
          {demo && <p className="mf-print-note">{c.note}</p>}
        </aside>
        <div className="mf-print-preview">
          <div className="mf-print-caption">
            <span>{c.format}</span>
            {demo && <span>{c.draft}</span>}
          </div>
          <article className="mf-connection-poster" aria-label={c.poster}>
            <div className="mf-poster-access">
              <span className="mf-poster-signal" />
              <span>{c.customerSpace}</span>
            </div>
            <header>
              {showLogo && posterLogo && (
                <Image
                  className="mf-poster-logo"
                  src={posterLogo}
                  alt=""
                  width={80}
                  height={80}
                  unoptimized
                />
              )}
              <div className="mf-poster-identity">
                <strong className="mf-poster-business">
                  {posterBusiness?.name || ""}
                </strong>
                {showCity && posterBusiness?.city && (
                  <span className="mf-poster-city">{posterBusiness?.city}</span>
                )}
              </div>
            </header>
            <div className="mf-poster-invitation">
              <h2>{heading || c.headline}</h2>
              <p>{description || c.description}</p>
            </div>
            <svg
              className="mf-poster-connector"
              viewBox="0 0 24 36"
              aria-hidden="true"
            >
              <path d="M12 0V30" />
              <circle cx="12" cy="30" r="3" />
            </svg>
            <div className="mf-poster-qr">
              {qr && !pending ? (
                <Image
                  src={qr}
                  alt={`${c.poster}: ${posterBusiness?.name || ""}`}
                  width={1200}
                  height={1200}
                  unoptimized
                />
              ) : (
                <div className="mf-qr-unavailable" role="status">
                  <QrCode size={48} />
                  <span>
                    {qrFailed ? c.qrError : pending ? c.loading : c.pending}
                  </span>
                  {qrFailed && (
                    <button
                      className="mf-text-link"
                      onClick={() => setRetry((n) => n + 1)}
                    >
                      {c.retry}
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="mf-poster-scan">
              <ScanLine aria-hidden="true" size={18} />
              {c.scan}
            </p>
            <footer>
              <span className="mf-poster-wordmark">
                <Wordmark />
              </span>
            </footer>
          </article>
          <div className="mf-print-placement">
            <h3>{c.how}</h3>
            <p>{c.tip}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
