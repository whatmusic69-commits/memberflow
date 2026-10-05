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
import type { CampaignDraft } from "./types";
import { CampaignEditor } from "./editor";
export function CampaignsPage() {
  const { data, locale, loading, href, error: workspaceError } = useWorkspace();
  const c = workspaceContent[locale];
  const d = dashboardContent[locale];
  const [drafts, setDrafts] = useState<CampaignDraft[]>([]);
  const [pending, setPending] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [editor, setEditor] = useState<CampaignDraft | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
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
          status: item.status,
        }))
      : [];
  const all = [
    ...drafts,
    ...fixtureCampaigns.filter(
      (item) => !drafts.some((draft) => draft.id === item.id),
    ),
  ];
  const list = all.filter(
    (item) =>
      (filter === "all" || item.status === "DRAFT") &&
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
          <p>{c.campaignIntro}</p>
        </div>
        {data.permissions.canCreate && (
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
      <div className="mf-campaign-toolbar">
        <div className="mf-filter-tabs">
          <button
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            {c.all}
          </button>
          <button
            aria-pressed={filter === "drafts"}
            onClick={() => setFilter("drafts")}
          >
            {c.drafts}
          </button>
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
      <div role="status" className="mf-save-status">
        {saved && c.saved}
      </div>
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
          {data.permissions.canCreate && (
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
                  {c.kinds[item.kind]} · {c.updated}{" "}
                  {new Intl.DateTimeFormat(locale, {
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  }).format(new Date(item.updatedAt))}
                </p>
                <div className="mf-preview-channels">
                  {item.channels.map((channel) => (
                    <span key={channel}>{channel}</span>
                  ))}
                </div>
              </div>
              {item.status === "DRAFT" && data.permissions.canCreate ? (
                <button
                  className="mf-text-link"
                  onClick={() => setEditor(item)}
                >
                  {c.edit}
                  <ArrowRight size={15} />
                </button>
              ) : (
                <Link className="mf-text-link" href={href("integrations")}>
                  {c.publishing}
                  <ArrowRight size={15} />
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
      <section className="mf-module-next">
        <Waypoints size={23} />
        <div>
          <span className="mf-kicker">{c.next}</span>
          <p>{c.campaignNext}</p>
        </div>
        <Link className="mf-text-link" href={href("integrations")}>
          {c.manageChannels}
          <ArrowRight size={15} />
        </Link>
      </section>
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
