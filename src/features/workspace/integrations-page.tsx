"use client";
import { useDialogDismiss } from "@/lib/motion/dialog";
import Image from "next/image";
import Link from "next/link";
import { SocialPlatformLogo } from "@/components/ui/platform-icon";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Waypoints, X } from "lucide-react";
import { moduleContent } from "@/content/modules";
import { dashboardContent } from "@/content/dashboard";
import { useWorkspace } from "@/features/dashboard/workspace";
import { OverviewSkeleton } from "@/features/dashboard/overview";
import type { ConnectionStatus } from "@/features/dashboard/types";
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
function ChannelDialog({
  name,
  status,
  wallet,
  onClose: closeImmediately,
}: {
  name: string;
  status: ConnectionStatus;
  wallet: boolean;
  onClose: () => void;
}) {
  const { locale } = useWorkspace();
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
      <p>{wallet ? c.walletPurpose : c.socialPurpose}</p>
      <span className="mf-status">{d.connectionStatuses[status]}</span>
      <p>
        {status === "connected" || status === "ready"
          ? c.connected
          : c.connectionUnavailable}
      </p>
      <small>{c.noCredentials}</small>
      <button className="button" onClick={onClose}>
        {c.close}
      </button>
    </dialog>
  );
}
export function IntegrationsPage() {
  const { data, locale, loading, error, reload, href } = useWorkspace();
  const c = moduleContent[locale];
  const d = dashboardContent[locale];
  const [selected, setSelected] = useState<{
    name: string;
    status: ConnectionStatus;
    wallet: boolean;
  } | null>(null);
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
            <article key={channel.name}>
              <ChannelIcon name={channel.name} />
              <h3>{channel.name}</h3>
              <p className="mf-status">
                {channel.status === "connected" && <Check size={13} />}{" "}
                {d.connectionStatuses[channel.status]}
              </p>
              <button
                className="mf-text-link"
                onClick={() => setSelected({ ...channel, wallet: false })}
              >
                {c.details}
                <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="mf-integration-section">
        <h2>{c.connection}</h2>
        <div className="mf-integration-cards">
          {data.connection.map((item) => {
            const name = d.connections[item.name];
            return (
              <article key={item.name}>
                <ChannelIcon name={name} />
                <h3>{name}</h3>
                <p className="mf-status">
                  {item.status === "ready" && <Check size={13} />}{" "}
                  {d.connectionStatuses[item.status]}
                </p>
                {item.name === "qr" ? (
                  <Link
                    className="mf-text-link"
                    href={href("customers").replace("?", "/connection?")}
                  >
                    {c.setupQr}
                    <ArrowRight size={15} />
                  </Link>
                ) : (
                  <button
                    className="mf-text-link"
                    onClick={() =>
                      setSelected({ name, status: item.status, wallet: true })
                    }
                  >
                    {c.details}
                    <ArrowRight size={15} />
                  </button>
                )}
              </article>
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
