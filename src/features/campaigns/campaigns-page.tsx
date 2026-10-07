"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Megaphone, Plus, Search, Waypoints } from "lucide-react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { OverviewSkeleton } from "@/features/dashboard/overview";
import { dashboardContent } from "@/content/dashboard";
import { workspaceContent } from "@/content/workspace";
import { getCampaignService } from "./service";
import { campaignChannels } from "./types";
import type { CampaignDraft } from "./types";
import { CampaignDetails } from "./details";
import { CampaignEditor } from "./editor";
export function CampaignsPage() {
  const {
    data,
    locale,
    loading,
    href,
    can,
    error: workspaceError,
  } = useWorkspace();
  const c = workspaceContent[locale];
  const d = dashboardContent[locale];
  const [drafts, setDrafts] = useState<CampaignDraft[]>([]);
  const [pending, setPending] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [details, setDetails] = useState<CampaignDraft | null>(null);
  const [editor, setEditor] = useState<CampaignDraft | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "drafts" | "completed"
  >("all");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!data) return;
    const controller = new AbortController();
    let disposed = false;
    Promise.resolve().then(() => {
      if (!disposed) {
        setPending(true);
        setFailed(false);
      }
    });
    getCampaignService(data.source === "demo")
      .list(data.business.id, controller.signal)
      .then((result) => {
        if (!disposed) setDrafts(result);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      })
      .finally(() => {
        if (!disposed) setPending(false);
      });
    return () => {
      disposed = true;
      controller.abort();
    };
  }, [data, retry]);
  if (loading) return <OverviewSkeleton />;
  if (workspaceError || !data)
    return (
      <section className="mf-load-error">
        <h1>{c.loadError}</h1>
        <Link className="mf-text-link" href={href()}>
          {c.overview}
          <ArrowRight size={16} />
        </Link>
      </section>
    );
  const fixtureCampaigns: CampaignDraft[] =
    data.source === "demo"
      ? data.campaigns.map((item) => ({
          id: item.id,
          businessId: data.business.id,
          name: item.name,
          kind: "offer",
          description: "",
          price: "",
          currency: "EUR",
          channels: item.channels.map((channel) => channel.name),
          image: null,
          updatedAt: item.startedAt || "2026-10-01",
          createdAt: item.startedAt,
          channelStatuses: item.channels.map((channel) => ({
            name: channel.name,
            status:
              channel.status === "ready" || channel.status === "connected"
                ? "PUBLISHED"
                : channel.status === "processing"
                  ? "PROCESSING"
                  : channel.status === "failed"
                    ? "FAILED"
                    : "DRAFT",
          })),
          status: item.status,
        }))
      : [];
  const all = [
    ...drafts,
    ...fixtureCampaigns.filter(
      (item) => !drafts.some((draft) => draft.id === item.id),
    ),
  ];
  const connectedChannels =
    data.integrations.filter(
      (channel) =>
        (campaignChannels as readonly string[]).includes(channel.name) &&
        ["connected", "ready"].includes(channel.status),
    ).length +
    data.connection.filter(
      (channel) =>
        (channel.name === "apple" || channel.name === "google") &&
        ["ready", "connected"].includes(channel.status),
    ).length;
  const list = all.filter(
    (item) =>
      (filter === "all" ||
        (filter === "drafts" && item.status === "DRAFT") ||
        (filter === "completed" && item.status === "COMPLETED") ||
        (filter === "active" &&
          ["PROCESSING", "PUBLISHED", "PARTIALLY_PUBLISHED"].includes(
            item.status,
          ))) &&
      item.name
        .toLocaleLowerCase(locale)
        .includes(search.toLocaleLowerCase(locale)),
  );
  return (
    <section className="mf-feature-page">
      <header className="mf-feature-heading">
        <div>
          <p className="mf-kicker">
            {data.business.name} / {d.nav.campaigns}
          </p>
          <h1>{d.nav.campaigns}</h1>
          {!all.length && <p>{c.campaignIntro}</p>}
        </div>
        {all.length > 0 && !pending && can("campaign.create") && (
          <button
            className="button button-primary"
            onClick={() => {
              setSaved(false);
              setEditor("new");
            }}
          >
            <Plus size={16} />
            {c.newCampaign}
          </button>
        )}
      </header>
      {all.length > 0 && !pending && (
        <div className="mf-campaign-toolbar">
          <div className="mf-filter-tabs">
            {(["all", "active", "drafts", "completed"] as const).map(
              (value) => (
                <button
                  key={value}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value === "active"
                    ? c.activeFilter
                    : value === "completed"
                      ? c.completedFilter
                      : c[value]}
                </button>
              ),
            )}
          </div>
          <label className="mf-search-field">
            <Search size={16} />
            <input
              type="search"
              aria-label={c.search}
              placeholder={c.search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
      )}
      {saved && (
        <div role="status" className="mf-save-status">
          {c.saved}
        </div>
      )}
      {pending ? (
        <OverviewSkeleton />
      ) : failed ? (
        <div className="mf-module-empty">
          <h2>{c.loadError}</h2>
          <button
            className="button"
            onClick={() => setRetry((value) => value + 1)}
          >
            {c.retry}
          </button>
        </div>
      ) : !all.length ? (
        <div className="mf-campaign-empty">
          <Megaphone size={38} strokeWidth={1.2} />
          <h2>{c.emptyTitle}</h2>
          <p>{c.emptyText}</p>
          {can("campaign.create") && (
            <button
              className="button button-primary"
              onClick={() => setEditor("new")}
            >
              {c.newCampaign}
              <ArrowRight size={16} />
            </button>
          )}
          <ol className="mf-mini-journey">
            {[
              [c.source, c.sourceText],
              [c.adapt, c.adaptText],
              [c.distribute, c.distributeText],
            ].map(([title, text], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <strong>{title}</strong>
                <small>{text}</small>
              </li>
            ))}
          </ol>
        </div>
      ) : !list.length ? (
        <div className="mf-module-empty">
          <h2>{c.noResults}</h2>
        </div>
      ) : (
        <div className="mf-campaign-list">
          {list.map((item) => (
            <article key={item.id} className="mf-campaign-list-row">
              {item.image ? (
                <Image
                  src={item.image}
                  width={70}
                  height={75}
                  alt=""
                  unoptimized
                />
              ) : (
                <span className="mf-campaign-list-icon">
                  <Megaphone size={25} />
                </span>
              )}
              <div>
                <div className="mf-campaign-title">
                  <h2>{item.name}</h2>
                  <span className="mf-status">{d.statuses[item.status]}</span>
                </div>
                <p>
                  {c.kinds[item.kind]} ·{" "}
                  {item.createdAt ? c.created : c.updated}{" "}
                  {new Intl.DateTimeFormat(locale, {
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  }).format(new Date(item.createdAt || item.updatedAt))}
                </p>
                <div className="mf-preview-channels">
                  {item.channels.map((channel) => (
                    <span key={channel}>
                      {channel}
                      {item.channelStatuses?.find(
                        (status) => status.name === channel,
                      ) && (
                        <small>
                          {
                            d.statuses[
                              item.channelStatuses.find(
                                (status) => status.name === channel,
                              )!.status
                            ]
                          }
                        </small>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              {item.status === "DRAFT" && can("campaign.create") ? (
                <button
                  className="mf-text-link"
                  onClick={() => setEditor(item)}
                >
                  {c.edit}
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  className="mf-text-link"
                  onClick={() => setDetails(item)}
                >
                  {c.openCampaign}
                  <ArrowRight size={15} />
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      {!pending && !failed && connectedChannels === 0 && (
        <section className="mf-module-next">
          <Waypoints size={23} />
          <div>
            <span className="mf-kicker">{c.next}</span>
            <p>{c.campaignNext}</p>
          </div>
          {can("integration.read") && (
            <Link className="mf-text-link" href={href("integrations")}>
              {c.manageChannels}
              <ArrowRight size={15} />
            </Link>
          )}
        </section>
      )}
      {details && (
        <CampaignDetails campaign={details} onClose={() => setDetails(null)} />
      )}
      {editor && (
        <CampaignEditor
          key={editor === "new" ? "new" : editor.id}
          draft={editor === "new" ? undefined : editor}
          onClose={() => setEditor(null)}
          onSaved={(draft) => {
            setDrafts((previous) => [
              draft,
              ...previous.filter((item) => item.id !== draft.id),
            ]);
            setEditor(null);
            setSaved(true);
          }}
        />
      )}
    </section>
  );
}
