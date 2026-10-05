"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Archive,
  Gift,
  Plus,
  QrCode,
  Search,
  Ticket,
  Users,
  Waypoints,
  X,
} from "lucide-react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { OverviewSkeleton } from "@/features/dashboard/overview";
import { dashboardContent } from "@/content/dashboard";
import { moduleContent } from "@/content/modules";
import { isDemoAdapter, moduleRepository } from "./repository";
import { ModuleEditor } from "./module-editor";
import { RecordPreview } from "./record-preview";
import type { ModuleId, ModuleRecords, OfferDraft } from "./types";
const icons = {
  customers: Users,
  loyalty: Gift,
  memberships: Ticket,
  offers: Gift,
  automations: Waypoints,
};
function valuesOf(record: ModuleRecords[ModuleId]): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => typeof value === "string"),
  );
}
function ConnectionDialog({ onClose }: { onClose: () => void }) {
  const { locale } = useWorkspace();
  const c = moduleContent[locale];
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    const overflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      node?.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      className="mf-notification mf-connection-dialog"
      ref={ref}
      aria-labelledby="connection-heading"
      onCancel={onClose}
    >
      <button className="mf-icon-button" aria-label={c.close} onClick={onClose}>
        <X size={20} />
      </button>
      <QrCode size={30} />
      <h2 id="connection-heading">{c.connection}</h2>
      <p>{c.connectionIntro}</p>
      <ol className="mf-mini-journey">
        <li>
          <strong>QR</strong>
        </li>
        <li>
          <strong>{c.profile}</strong>
        </li>
        <li>
          <strong>Apple Wallet / Google Wallet</strong>
        </li>
      </ol>
      <p>{c.noQr}</p>
      <button className="button" onClick={onClose}>
        {c.close}
      </button>
    </dialog>
  );
}
export function ModulePage({ feature }: { feature: ModuleId }) {
  const { data, locale, loading, error, reload } = useWorkspace();
  const c = moduleContent[locale];
  const d = dashboardContent[locale];
  const [rows, setRows] = useState<ModuleRecords[ModuleId][]>([]);
  const [offers, setOffers] = useState<OfferDraft[]>([]);
  const [pending, setPending] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [editor, setEditor] = useState<ModuleRecords[ModuleId] | "new" | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [connection, setConnection] = useState(false);
  const id = data?.business.id;
  const demo = data?.source === "demo";
  const Icon = icons[feature];
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    let disposed = false;
    Promise.resolve().then(() => {
      if (!disposed) {
        setPending(true);
        setFailed(false);
      }
    });
    Promise.all([
      moduleRepository(feature, demo).list(id, controller.signal),
      feature === "automations"
        ? moduleRepository("offers", demo).list(id, controller.signal)
        : Promise.resolve([]),
    ])
      .then(([records, offerRecords]) => {
        if (!disposed) {
          setRows(records);
          setOffers(offerRecords);
        }
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
  }, [id, demo, feature, attempt]);
  async function archive(record: ModuleRecords[ModuleId]) {
    if (busy || !id) return;
    setBusy(record.id);
    setNotice("");
    try {
      await moduleRepository(feature, demo).archive(
        id,
        record.id,
        !record.archived,
      );
      setRows((previous) =>
        previous.map((row) =>
          row.id === record.id ? { ...row, archived: !row.archived } : row,
        ),
      );
      setNotice(c.saved);
    } catch {
      setNotice(c.saveError);
    } finally {
      setBusy(null);
    }
  }
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
  const list = rows.filter(
    (row) =>
      row.archived === archived &&
      row.name
        .toLocaleLowerCase(locale)
        .includes(search.toLocaleLowerCase(locale)),
  );
  const writable = isDemoAdapter(demo) && data.permissions.canCreate;
  return (
    <section className={`mf-feature-page mf-module-${feature}`}>
      <header className="mf-feature-heading">
        <div>
          <p className="mf-kicker">
            {data.business.name} / {d.nav[feature]}
          </p>
          <h1>{d.nav[feature]}</h1>
          <p>{c.intro[feature]}</p>
        </div>
        {data.permissions.canCreate && (
          <button
            className="button button-primary"
            onClick={() => setEditor("new")}
          >
            <Plus size={16} />
            {c.create[feature]}
          </button>
        )}
      </header>
      {feature === "customers" && (
        <section className="mf-customer-connection-banner">
          <QrCode size={25} />
          <div>
            <h2>{c.connection}</h2>
            <p>{c.connectionIntro}</p>
          </div>
          <button className="mf-text-link" onClick={() => setConnection(true)}>
            {c.setupQr}
            <ArrowRight size={15} />
          </button>
        </section>
      )}
      <div className="mf-campaign-toolbar">
        <div className="mf-filter-tabs">
          <button aria-pressed={!archived} onClick={() => setArchived(false)}>
            {c.all}
          </button>
          <button aria-pressed={archived} onClick={() => setArchived(true)}>
            {c.archived}
          </button>
        </div>
        <label className="mf-search-field">
          <Search size={16} />
          <input
            type="search"
            value={search}
            aria-label={c.search}
            placeholder={c.search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <p role="status" className="mf-save-status">
        {notice}
      </p>
      {pending ? (
        <OverviewSkeleton />
      ) : failed ? (
        <section className="mf-module-empty">
          <h2>{c.error}</h2>
          <button
            className="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {c.retry}
          </button>
        </section>
      ) : !list.length ? (
        <section className="mf-module-empty">
          <Icon size={36} strokeWidth={1.3} />
          <h2>{search || archived ? c.noResults : c.create[feature]}</h2>
          <p>{c.empty[feature]}</p>
          {!search && !archived && data.permissions.canCreate && (
            <button
              className="button button-primary"
              onClick={() => setEditor("new")}
            >
              {c.create[feature]}
              <ArrowRight size={15} />
            </button>
          )}
        </section>
      ) : feature === "customers" ? (
        <div className="mf-customer-directory">
          {list.map((record) => {
            const values = valuesOf(record);
            return (
              <article key={record.id}>
                <span className="mf-user-avatar">
                  {record.name.slice(0, 1)}
                </span>
                <div>
                  <h2>{record.name}</h2>
                  <p>{values.email || values.phone || c.noContact}</p>
                  {values.notes && <small>{values.notes}</small>}
                </div>
                <button
                  className="mf-text-link"
                  onClick={() => setEditor(record)}
                >
                  {writable ? c.edit : c.details}
                  <ArrowRight size={15} />
                </button>
                {writable && (
                  <button
                    className="mf-icon-button"
                    aria-label={`${record.archived ? c.restore : c.archive}: ${record.name}`}
                    disabled={busy === record.id}
                    onClick={() => archive(record)}
                  >
                    <Archive size={16} />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div
          className={`mf-program-grid ${feature === "automations" ? "mf-automation-grid" : ""}`}
        >
          {list.map((record) => (
            <article key={record.id}>
              <div className="mf-program-status">
                <span className="mf-status">
                  {record.archived
                    ? c.archived
                    : feature === "automations"
                      ? c.notRunning
                      : c.draft}
                </span>
                <small>
                  {new Intl.DateTimeFormat(locale, {
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  }).format(new Date(record.updatedAt))}
                </small>
              </div>
              <RecordPreview
                feature={feature}
                values={valuesOf(record)}
                c={c}
                businessName={data.business.name}
                offerName={
                  offers.find((offer) => offer.id === valuesOf(record).offerId)
                    ?.name
                }
              />
              <footer>
                <button
                  className="mf-text-link"
                  onClick={() => setEditor(record)}
                >
                  {writable ? c.edit : c.details}
                  <ArrowRight size={15} />
                </button>
                {writable && (
                  <button
                    className="mf-icon-button"
                    aria-label={`${record.archived ? c.restore : c.archive}: ${record.name}`}
                    disabled={busy === record.id}
                    onClick={() => archive(record)}
                  >
                    <Archive size={16} />
                  </button>
                )}
              </footer>
            </article>
          ))}
        </div>
      )}
      {feature === "customers" && data.customerActivity.length > 0 && (
        <section className="mf-panel mf-module-activity">
          <h2>{c.viewActivity}</h2>
          <ol className="mf-activity-feed">
            {data.customerActivity.map((item) => (
              <li key={item.id}>
                <Users size={17} />
                <div>
                  <p>
                    <strong>{item.name}</strong> {d.events[item.kind]}
                  </p>
                  {item.detail && <small>{item.detail}</small>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
      <p className="mf-draft-notice">{demo ? c.demoNotice : c.apiNotice}</p>
      {editor && (
        <ModuleEditor
          key={editor === "new" ? "new" : editor.id}
          feature={feature}
          record={editor === "new" ? undefined : editor}
          offers={offers}
          onClose={() => setEditor(null)}
          onSaved={(record) => {
            setRows((previous) => [
              record,
              ...previous.filter((row) => row.id !== record.id),
            ]);
            setNotice(c.saved);
            setEditor(null);
          }}
        />
      )}
      {connection && <ConnectionDialog onClose={() => setConnection(false)} />}
    </section>
  );
}
