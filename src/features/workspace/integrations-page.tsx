"use client";
import { useDialogDismiss } from "@/lib/motion/dialog";
import Image from "next/image";
import Link from "next/link";
import { SocialPlatformLogo } from "@/components/ui/platform-icon";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Waypoints, X } from "lucide-react";
import { integrationContent } from "@/content/integrations";
import { moduleContent } from "@/content/modules";
import { dashboardContent } from "@/content/dashboard";
import { useWorkspace } from "@/features/dashboard/workspace";
import { OverviewSkeleton } from "@/features/dashboard/overview";
import type { ConnectionStatus } from "@/features/dashboard/types";
function ConnectionBadge({
  status,
  label,
}: {
  status: ConnectionStatus;
  label: string;
}) {
  return (
    <span className={`mf-status mf-status-${status}`}>
      {(status === "connected" || status === "ready") && (
        <Check size={15} strokeWidth={2.5} aria-hidden="true" />
      )}
      {label}
    </span>
  );
}
function ChannelIcon({ name }: { name: string }) {
  const social = {
    Instagram: "instagram",
    TikTok: "tiktok",
    Pinterest: "pinterest",
  } as const;
  if (name in social)
    return (
      <SocialPlatformLogo
        platform={social[name as keyof typeof social]}
        size={26}
      />
    );
  if (name === "Apple Wallet" || name === "Google Wallet")
    return (
      <Image
        src={
          name === "Apple Wallet"
            ? "/icons/apple-wallet.svg"
            : "/icons/google-wallet.svg"
        }
        width={28}
        height={28}
        alt=""
      />
    );
  return <Waypoints size={24} strokeWidth={1.5} />;
}
type ChannelSelection = {
  name: string;
  status: ConnectionStatus;
  kind: "social" | "qr" | "profile" | "wallet";
  authorizationUrl?: string | null;
};

function authorizationLink(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function ChannelDialog({
  name,
  status,
  kind,
  authorizationUrl,
  onClose: closeImmediately,
}: ChannelSelection & { onClose: () => void }) {
  const { locale, href, can } = useWorkspace();
  const copy = integrationContent[locale];
  const connected = status === "connected" || status === "ready";
  const authUrl = authorizationLink(authorizationUrl);
  const canManage = can("integration.manage");
  const c = moduleContent[locale];
  const d = dashboardContent[locale];
  const ref = useRef<HTMLDialogElement>(null);
  const onClose = useDialogDismiss(ref, closeImmediately);
  useEffect(() => {
    const node = ref.current;
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      node?.close();
      document.body.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="mf-notification mf-channel-dialog"
      aria-labelledby="channel-heading"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button className="mf-icon-button" onClick={onClose} aria-label={c.close}>
        <X size={20} />
      </button>
      <ChannelIcon name={name} />
      <p className="mf-kicker">{c.channelDetails}</p>
      <h2 id="channel-heading">{name}</h2>
      <p>{copy[kind]}</p>
      <ConnectionBadge status={status} label={d.connectionStatuses[status]} />
      {kind === "social" && (
        <>
          <p>{connected ? c.connected : copy.authorize}</p>
          <small>
            {!canManage
              ? copy.permission
              : !authUrl && !connected
                ? copy.unavailable
                : c.noCredentials}
          </small>
        </>
      )}
      <div className="mf-channel-actions">
        {kind === "social" ? (
          canManage && authUrl ? (
            <a className="button button-primary" href={authUrl}>
              {connected ? copy.reconnect : copy.connect}
              <ArrowRight size={16} />
            </a>
          ) : !connected ? (
            <button className="button button-primary" disabled>
              {copy.connect}
            </button>
          ) : null
        ) : (
          <Link
            className="button button-primary"
            href={
              kind === "qr"
                ? href("customers").replace("?", "/connection?")
                : href("customer-page")
            }
          >
            {kind === "qr" ? c.setupQr : copy.configure}
            <ArrowRight size={16} />
          </Link>
        )}
        <button className="button" onClick={onClose}>
          {c.close}
        </button>
      </div>
    </dialog>
  );
}
export function IntegrationsPage() {
  const { data, locale, loading, error, reload } = useWorkspace();
  const c = moduleContent[locale];
  const d = dashboardContent[locale];
  const [selected, setSelected] = useState<ChannelSelection | null>(null);
  if (loading) return <OverviewSkeleton />;
  if (error || !data)
    return (
      <section className="mf-load-error">
        <h1>{d.error}</h1>
        <button className="button" onClick={reload}>
          {d.retry}
        </button>
      </section>
    );
  return (
    <section className="mf-feature-page">
      <header className="mf-feature-heading">
        <div>
          <p className="mf-kicker">
            {data.business.name} / {d.nav.integrations}
          </p>
          <h1>{d.nav.integrations}</h1>
          <p>{c.connectionIntro}</p>
        </div>
      </header>
      <section className="mf-integration-section">
        <h2>{c.socialPurpose}</h2>
        <div className="mf-integration-cards">
          {data.integrations.map((channel) => (
            <button
              type="button"
              className="mf-integration-card"
              key={channel.name}
              aria-haspopup="dialog"
              onClick={() => setSelected({ ...channel, kind: "social" })}
            >
              <ChannelIcon name={channel.name} />
              <span className="mf-integration-title">{channel.name}</span>
              <ConnectionBadge
                status={channel.status}
                label={d.connectionStatuses[channel.status]}
              />
              <span className="mf-text-link">
                {c.details}
                <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="mf-integration-section">
        <h2>{c.connection}</h2>
        <div className="mf-integration-cards">
          {data.connection.map((item) => {
            const name = d.connections[item.name];
            return (
              <button
                type="button"
                className="mf-integration-card"
                key={item.name}
                aria-haspopup="dialog"
                onClick={() =>
                  setSelected({
                    name,
                    status: item.status,
                    kind:
                      item.name === "qr"
                        ? "qr"
                        : item.name === "profile"
                          ? "profile"
                          : "wallet",
                  })
                }
              >
                <ChannelIcon name={name} />
                <span className="mf-integration-title">{name}</span>
                <ConnectionBadge
                  status={item.status}
                  label={d.connectionStatuses[item.status]}
                />
                <span className="mf-text-link">
                  {c.details}
                  <ArrowRight size={15} />
                </span>
              </button>
            );
          })}
        </div>
      </section>
      {selected && (
        <ChannelDialog {...selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
