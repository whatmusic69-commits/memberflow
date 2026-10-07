"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { UploadProgress } from "@/lib/api/upload";
import { ArrowUpRight, Check, Copy, QrCode, Save, Upload } from "lucide-react";
import { customerPageContent } from "@/content/customer-page";
import { useWorkspace } from "@/features/dashboard/workspace";
import { OverviewSkeleton } from "@/features/dashboard/overview";
import { CustomerPageView } from "./page-view";
import { CustomerImage } from "./customer-image";
import { publicProjection, safeLink } from "./public-model";
import { customerPageService, previewUrl } from "./service";
import type {
  CustomerPageConfig,
  CustomerPagePersonal,
  CustomerPageBusinessInfo,
  CustomerPageSocial,
} from "./types";
function TextField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  multiline = false,
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="mf-form-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength ?? 600}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength ?? (type === "url" ? 2048 : 180)}
          required={required}
        />
      )}
    </label>
  );
}
export function CustomerPageEditor() {
  const { data, locale, loading, error, reload, href, can } = useWorkspace();
  const c = customerPageContent[locale];
  const [config, setConfig] = useState<CustomerPageConfig | null>(null),
    [pending, setPending] = useState(true),
    [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState<"logo" | "cover" | null>(null);
  const [message, setMessage] = useState(""),
    [formError, setFormError] = useState("");
  const [view, setView] = useState<"guest" | "customer">("guest"),
    [person, setPerson] = useState<CustomerPagePersonal | null>(null);
  const [basePublicUrl, setPublicUrl] = useState<string | null>(null),
    [copied, setCopied] = useState(false);
  const publicUrl = (() => {
    if (!basePublicUrl) return null;
    const url = new URL(basePublicUrl);
    url.searchParams.set("lang", locale);
    return url.href;
  })();
  const [uploadProgress, setUploadProgress] = useState<
    Partial<Record<"logo" | "cover", UploadProgress>>
  >({});
  const uploadController = useRef<AbortController | null>(null);
  const lock = useRef(false),
    alive = useRef(true);
  const uploadInputs = useRef<
    Record<"logo" | "cover", HTMLInputElement | null>
  >({ logo: null, cover: null });
  const business = data?.business;
  const demo =
    data?.source === "demo" && process.env.NODE_ENV === "development";
  const writable = can("customer-page.manage");
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      uploadController.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!business) return;
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setPending(true);
        setFailed(false);
      }
    });
    customerPageService(business, demo)
      .get(controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        if (value.businessId !== business.id)
          throw new Error("Business mismatch");
        setConfig(value);
        setPublicUrl(
          demo ? previewUrl(value, "en") : safeLink(value.publicUrl),
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setPending(false);
      });
    return () => controller.abort();
  }, [business, demo, retry]);
  useEffect(() => {
    let disposed = false;
    if (view === "customer")
      import("@/mocks/customer-page/fixtures").then(
        ({ connectedCustomerPage }) => {
          if (!disposed) setPerson(connectedCustomerPage);
        },
      );
    return () => {
      disposed = true;
    };
  }, [view]);
  if (loading || pending) return <OverviewSkeleton />;
  if (!data || error || failed || !config || !business)
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
  const state = config;
  const adapter = customerPageService(business, demo);
  const info = (key: keyof CustomerPageBusinessInfo, value: string) =>
    setConfig((previous) =>
      previous
        ? { ...previous, business: { ...previous.business, [key]: value } }
        : previous,
    );
  const social = (key: keyof CustomerPageSocial, value: string) =>
    setConfig((previous) =>
      previous
        ? { ...previous, social: { ...previous.social, [key]: value } }
        : previous,
    );
  async function upload(file: File | undefined, kind: "logo" | "cover") {
    if (!file || !writable || lock.current) return;
    lock.current = true;
    setUploading(kind);
    const controller = new AbortController();
    uploadController.current = controller;
    setUploadProgress((previous) => ({
      ...previous,
      [kind]: { stage: demo ? "reading" : "uploading", percent: 0 },
    }));
    setFormError("");
    try {
      const url = await adapter.upload(
        file,
        kind,
        (progress) => {
          if (alive.current && !controller.signal.aborted)
            setUploadProgress((previous) => ({
              ...previous,
              [kind]: progress,
            }));
        },
        controller.signal,
      );
      if (alive.current)
        setConfig((previous) =>
          previous
            ? {
                ...previous,
                branding: {
                  ...previous.branding,
                  [kind === "logo" ? "logoUrl" : "coverUrl"]: url,
                },
              }
            : previous,
        );
    } catch (error) {
      if (alive.current && !controller.signal.aborted) {
        setFormError(
          error instanceof Error && error.message === "image"
            ? c.uploadError
            : c.uploadFailed,
        );
        setUploadProgress((previous) => ({ ...previous, [kind]: undefined }));
      }
    } finally {
      lock.current = false;
      if (alive.current) setUploading(null);
    }
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !writable) return;
    lock.current = true;
    setBusy(true);
    setFormError("");
    setMessage("");
    try {
      const value = await adapter.save({
        branding: state.branding,
        business: state.business,
        modules: state.modules,
        social: state.social,
        invitation: state.invitation,
      });
      if (alive.current) {
        setConfig(value);
        setPublicUrl(
          demo ? previewUrl(value, locale) : safeLink(value.publicUrl),
        );
        setMessage(demo ? c.previewSaved : c.saved);
      }
    } catch {
      if (alive.current) setFormError(c.error);
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function changeStatus() {
    if (lock.current || !writable) return;
    lock.current = true;
    setBusy(true);
    setFormError("");
    try {
      const value = await adapter.setStatus(
        state.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
      );
      if (alive.current) {
        setConfig(value);
        setPublicUrl(
          demo ? previewUrl(value, locale) : safeLink(value.publicUrl),
        );
      }
    } catch {
      if (alive.current) setFormError(demo ? c.activationUnavailable : c.error);
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function copyLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
    } catch {
      setFormError(c.copyError);
    }
  }
  const previewPage = publicProjection(state);
  return (
    <section className="mf-feature-page cp-editor">
      <header className="mf-feature-heading">
        <div>
          <p className="mf-kicker">{business.name}</p>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
        </div>
        {publicUrl && (
          <a
            className="button"
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.open}
            <ArrowUpRight size={16} />
          </a>
        )}
      </header>
      <div className="cp-editor-layout">
        <div>
          <section className="cp-editor-status">
            <div>
              <span className="mf-kicker">{c.status}</span>
              <strong className="mf-status">{c[state.status]}</strong>
            </div>
            {publicUrl && (
              <div className="cp-editor-url">
                <label htmlFor="cp-public-url">{c.url}</label>
                <div>
                  <input
                    id="cp-public-url"
                    value={publicUrl}
                    readOnly
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    className="mf-icon-button"
                    aria-label={copied ? c.copied : c.copy}
                    onClick={() => void copyLink()}
                  >
                    {copied ? <Check size={17} /> : <Copy size={17} />}
                  </button>
                </div>
              </div>
            )}
            {writable && (
              <button
                className="mf-text-link"
                disabled={busy || !!uploading}
                onClick={() => void changeStatus()}
              >
                {state.status === "ACTIVE" ? c.disable : c.activate}
                <ArrowUpRight size={15} />
              </button>
            )}
            <Link
              className="mf-text-link"
              href={href("customers").replace("?", "/connection?")}
            >
              <QrCode size={16} />
              {c.qr}
            </Link>
          </section>
          <form
            onSubmit={(e) => void save(e)}
            onInvalid={() => setFormError(c.invalid)}
          >
            <fieldset
              disabled={!writable || busy || !!uploading}
              className="cp-editor-fields"
            >
              <section className="cp-editor-section">
                <h2>{c.brand}</h2>
                <div className="cp-upload-grid">
                  {(["logo", "cover"] as const).map((kind) => {
                    const src =
                      kind === "logo"
                        ? state.branding.logoUrl
                        : state.branding.coverUrl;
                    return (
                      <div className={`cp-upload cp-upload-${kind}`} key={kind}>
                        <span>{c[kind]}</span>
                        <button
                          type="button"
                          className="cp-upload-preview"
                          aria-label={`${c.upload}: ${c[kind]}`}
                          onClick={() => uploadInputs.current[kind]?.click()}
                        >
                          <CustomerImage
                            src={src}
                            alt=""
                            className="cp-upload-image"
                            fallback={
                              <div className="cp-upload-empty">
                                <Upload size={23} />
                              </div>
                            }
                          />
                        </button>
                        <button
                          type="button"
                          className="button"
                          onClick={() => uploadInputs.current[kind]?.click()}
                        >
                          <Upload size={14} />
                          {uploading === kind ? c.uploading : c.upload}
                        </button>
                        <input
                          ref={(node) => {
                            uploadInputs.current[kind] = node;
                          }}
                          hidden
                          className="cp-upload-input"
                          aria-label={c[kind]}
                          aria-describedby={`cp-${kind}-hint`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            void upload(e.target.files?.[0], kind);
                            e.target.value = "";
                          }}
                        />
                        {uploadProgress[kind] && (
                          <div className="cp-upload-progress">
                            <div role="status">
                              <span>
                                {
                                  c[
                                    (
                                      {
                                        reading: "readingFile",
                                        uploading: "sendingFile",
                                        processing: "processingFile",
                                        complete: "imageReady",
                                      } as const
                                    )[uploadProgress[kind]!.stage]
                                  ]
                                }
                              </span>
                              {uploadProgress[kind]!.percent !== null && (
                                <span>{uploadProgress[kind]!.percent}%</span>
                              )}
                            </div>
                            <progress
                              max={100}
                              value={uploadProgress[kind]!.percent ?? undefined}
                              aria-label={c[kind]}
                            />
                          </div>
                        )}
                        <small
                          className="cp-upload-hint"
                          id={`cp-${kind}-hint`}
                        >
                          {kind === "logo" ? c.logoHint : c.coverHint}
                        </small>
                        {src && (
                          <button
                            className="mf-text-link"
                            type="button"
                            onClick={() => {
                              setUploadProgress((previous) => ({
                                ...previous,
                                [kind]: undefined,
                              }));
                              setConfig({
                                ...state,
                                branding: {
                                  ...state.branding,
                                  [kind === "logo" ? "logoUrl" : "coverUrl"]:
                                    null,
                                },
                              });
                            }}
                          >
                            {c.remove}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <label className="cp-accent">
                  <span>{c.accent}</span>
                  <input
                    type="color"
                    value={
                      /^#[0-9a-f]{6}$/i.test(state.branding.accent)
                        ? state.branding.accent
                        : "#c84a27"
                    }
                    onChange={(e) =>
                      setConfig({
                        ...state,
                        branding: { ...state.branding, accent: e.target.value },
                      })
                    }
                  />
                  <span>{state.branding.accent}</span>
                </label>
                {demo && <small>{c.temporaryImage}</small>}
              </section>
              <section className="cp-editor-section">
                <h2>{c.business}</h2>
                <TextField
                  label={c.name}
                  value={state.business.name}
                  required
                  onChange={(v) => info("name", v)}
                />
                <TextField
                  label={c.description}
                  value={state.business.description}
                  multiline
                  placeholder={c.descriptionPlaceholder}
                  onChange={(v) => info("description", v)}
                />
                <div className="cp-editor-pair">
                  <TextField
                    label={c.category}
                    value={state.business.category}
                    onChange={(v) => info("category", v)}
                  />
                  <TextField
                    label={c.city}
                    value={state.business.city}
                    placeholder="Riga"
                    onChange={(v) => info("city", v)}
                  />
                </div>
                <TextField
                  label={c.address}
                  value={state.business.address}
                  placeholder={c.addressPlaceholder}
                  onChange={(v) => info("address", v)}
                />
                <TextField
                  label={c.hours}
                  value={state.business.openingHours}
                  multiline
                  placeholder={c.hoursPlaceholder}
                  onChange={(v) => info("openingHours", v)}
                />
                <div className="cp-editor-pair">
                  <TextField
                    label={c.phone}
                    value={state.business.phone}
                    type="tel"
                    placeholder={c.phonePlaceholder}
                    onChange={(v) => info("phone", v)}
                  />
                  <TextField
                    label={c.email}
                    value={state.business.email}
                    type="email"
                    placeholder={c.emailPlaceholder}
                    onChange={(v) => info("email", v)}
                  />
                </div>
              </section>
              <section className="cp-editor-section">
                <h2>{c.content}</h2>
                <p>{c.automatic}</p>
                {(["offers", "loyalty", "memberships", "social"] as const).map(
                  (module) => (
                    <label className="cp-module-toggle" key={module}>
                      <span>
                        {
                          c[
                            {
                              offers: "showOffers",
                              loyalty: "showLoyalty",
                              memberships: "showMemberships",
                              social: "showSocial",
                            }[module] as "showOffers"
                          ]
                        }
                      </span>
                      <input
                        type="checkbox"
                        checked={state.modules[module]}
                        onChange={(e) =>
                          setConfig({
                            ...state,
                            modules: {
                              ...state.modules,
                              [module]: e.target.checked,
                            },
                          })
                        }
                      />
                    </label>
                  ),
                )}
              </section>
              <section className="cp-editor-section">
                <h2>{c.social}</h2>
                {(["instagram", "tiktok", "facebook", "website"] as const).map(
                  (network) => (
                    <TextField
                      key={network}
                      label={
                        network === "website"
                          ? c.website
                          : {
                              instagram: "Instagram",
                              tiktok: "TikTok",
                              facebook: "Facebook",
                            }[network]
                      }
                      value={state.social[network]}
                      type="url"
                      placeholder={
                        network === "website"
                          ? "https://example.com"
                          : `https://${network}.com/your-business`
                      }
                      onChange={(v) => social(network, v)}
                    />
                  ),
                )}
              </section>
              <section className="cp-editor-section">
                <h2>{c.invitation}</h2>
                <p>{c.invitationHint}</p>
                <TextField
                  label={c.headline}
                  maxLength={90}
                  value={state.invitation.headline}
                  onChange={(v) =>
                    setConfig({
                      ...state,
                      invitation: { ...state.invitation, headline: v },
                    })
                  }
                />
                <TextField
                  label={c.message}
                  maxLength={180}
                  value={state.invitation.message}
                  multiline
                  onChange={(v) =>
                    setConfig({
                      ...state,
                      invitation: { ...state.invitation, message: v },
                    })
                  }
                />
              </section>
            </fieldset>
            <section className="cp-editor-section">
              <h2>{c.wallet}</h2>
              {(["apple", "google"] as const).map((provider) => (
                <div className="cp-module-toggle" key={provider}>
                  <span>
                    {provider === "apple" ? "Apple Wallet" : "Google Wallet"}
                  </span>
                  <span className="mf-status">
                    {state.wallet[provider] === "READY" ? "✓" : "—"}{" "}
                    {state.wallet[provider] === "READY"
                      ? c.walletReady
                      : c.walletNotConfigured}
                  </span>
                </div>
              ))}
            </section>
            {formError && (
              <p className="mf-form-error" role="alert">
                {formError}
              </p>
            )}
            {message && (
              <p className="cp-editor-message" role="status">
                {message}
              </p>
            )}
            {writable && (
              <div className="cp-save-bar">
                <button
                  className="button button-primary"
                  disabled={busy || !!uploading}
                >
                  <Save size={16} />
                  {busy ? c.saving : c.save}
                </button>
              </div>
            )}
          </form>
        </div>
        <aside className="cp-live-preview">
          <div className="cp-preview-toolbar">
            <span>{c.preview}</span>
            <div>
              {(["guest", "customer"] as const).map((mode) => (
                <button
                  key={mode}
                  aria-pressed={view === mode}
                  onClick={() => setView(mode)}
                >
                  {c[mode]}
                </button>
              ))}
            </div>
          </div>
          <div className="cp-device">
            <CustomerPageView
              page={previewPage}
              personal={view === "customer" ? person : null}
              locale={locale}
              preview
            />
          </div>
          {view === "customer" && (
            <p className="cp-preview-note">{c.previewHint}</p>
          )}
        </aside>
      </div>
    </section>
  );
}
