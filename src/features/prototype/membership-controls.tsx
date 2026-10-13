"use client";
import { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { Locale } from "@/content";
import type { Permission } from "@/features/access/types";
import { membershipContent } from "@/content/memberships";
import { dashboardContent } from "@/content/dashboard";
import { readLocalRecords } from "@/features/workspace/repository";
import { executePrototype } from "./repository";
import { MembershipCard, useMembershipJournal } from "./membership-cards";
import { membershipStatus, type MembershipOperation } from "./memberships";
export function MembershipControls({
  businessId,
  customerId,
  locale,
  can,
  memberId,
  actorName,
}: {
  businessId: string;
  customerId: string;
  locale: Locale;
  can: (permission: Permission) => boolean;
  memberId: string;
  actorName: string;
}) {
  const journal = useMembershipJournal(businessId),
    c = membershipContent[locale];
  const definitions = readLocalRecords(businessId, "memberships").filter(
    (m) => !m.archived,
  );
  const [pending, setPending] = useState<{
    action: MembershipOperation["action"];
    id: string;
    key: string;
  } | null>(null);
  const [definitionId, setDefinitionId] = useState("");
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState("");
  const [visits, setVisits] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const definition = definitions.find((m) => m.id === definitionId);
  const selected = journal.memberships?.find((m) => m.id === pending?.id);
  const labels = {
    assign: c.assign,
    use: c.use,
    verify: c.verify,
    freeze: c.freeze,
    resume: c.resume,
    cancel: c.cancelMembership,
  };
  const editable =
    can("membership.create") &&
    readLocalRecords(businessId, "customers").some(
      (m) => m.id === customerId && !m.archived,
    );
  function queue(
    action: MembershipOperation["action"],
    id = crypto.randomUUID(),
  ) {
    setPending({ action, id, key: crypto.randomUUID() });
    setError(false);
    setReason("");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pending || lock.current || !editable) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    try {
      executePrototype({
        type: "membership-manage",
        businessId,
        customerId,
        membershipId: definitionId,
        key: pending.key,
        memberId,
        actorName,
        membershipOperation: {
          action: pending.action,
          assignmentId: pending.id,
          permissions: can("membership.create") ? ["membership.create"] : [],
          ...(pending.action === "assign"
            ? {
                startsOn: start,
                endsOn: end || null,
                visits: definition?.kind === "package" ? Number(visits) : null,
              }
            : { reason }),
        },
      });
      setPending(null);
    } catch {
      setError(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <div className="mf-panel-heading">
        <h2>{c.title}</h2>
        {editable && (
          <button
            className="button"
            onClick={() => queue("assign")}
            disabled={!definitions.length}
          >
            {c.assign}
          </button>
        )}
      </div>
      <p className="mf-draft-notice">{c.notice}</p>
      <div className="mf-membership-list">
        {journal.memberships?.filter((m) => m.customerId === customerId)
          .length ? (
          journal.memberships
            .filter((m) => m.customerId === customerId)
            .map((m) => (
              <MembershipCard key={m.id} membership={m} locale={locale}>
                {editable && !m.cancelledAt && (
                  <div className="mf-membership-actions">
                    {["ACTIVE", "SCHEDULED"].includes(membershipStatus(m)) && (
                      <button
                        className="mf-text-link"
                        onClick={() => queue("freeze", m.id)}
                      >
                        {c.freeze}
                      </button>
                    )}
                    {(m.frozenAt || m.status === "PAUSED") && (
                      <button
                        className="mf-text-link"
                        onClick={() => queue("resume", m.id)}
                      >
                        {c.resume}
                      </button>
                    )}
                    <button
                      className="mf-text-link"
                      onClick={() => queue("cancel", m.id)}
                    >
                      {c.cancelMembership}
                    </button>
                  </div>
                )}
                <details>
                  <summary>{c.history}</summary>
                  <ol>
                    {journal.events
                      .filter(
                        (e) =>
                          e.membershipId === m.id ||
                          (e.membershipId === m.membershipId &&
                            e.customerId === customerId),
                      )
                      .map((e) => (
                        <li key={e.id}>
                          {dashboardContent[locale].eventCopy[e.type]} ·{" "}
                          {e.detail} ·{" "}
                          <time>
                            {new Intl.DateTimeFormat(locale, {
                              dateStyle: "medium",
                            }).format(new Date(e.occurredAt))}
                          </time>
                        </li>
                      ))}
                  </ol>
                </details>
              </MembershipCard>
            ))
        ) : (
          <p>{c.empty}</p>
        )}
      </div>
      {pending && (
        <Modal
          title={labels[pending.action]}
          closeLabel={c.cancel}
          onClose={() => setPending(null)}
          closeDisabled={busy}
        >
          <form className="mf-membership-form" onSubmit={submit}>
            {pending.action === "assign" ? (
              <>
                <label className="mf-form-field">
                  <span>{c.choose}</span>
                  <select
                    required
                    value={definitionId}
                    onChange={(e) => {
                      const d = definitions.find(
                        (m) => m.id === e.target.value,
                      );
                      setDefinitionId(e.target.value);
                      setVisits(d?.visits ?? "");
                      const day = new Date(start + "T00:00:00Z");
                      day.setUTCDate(
                        day.getUTCDate() +
                          (d?.interval === "yearly" ? 364 : 29),
                      );
                      setEnd(
                        d?.kind === "membership"
                          ? day.toISOString().slice(0, 10)
                          : "",
                      );
                    }}
                  >
                    <option value="">{c.choose}</option>
                    {definitions.map((d) => (
                      <option value={d.id} key={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mf-form-field">
                  <span>{c.start}</span>
                  <input
                    type="date"
                    required
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </label>
                <label className="mf-form-field">
                  <span>{c.end}</span>
                  <input
                    type="date"
                    required={definition?.kind === "membership"}
                    min={start}
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </label>
                {definition?.kind === "package" && (
                  <label className="mf-form-field">
                    <span>{c.visits}</span>
                    <input
                      type="number"
                      min={1}
                      max={1000000}
                      step={1}
                      required
                      value={visits}
                      onChange={(e) => setVisits(e.target.value)}
                    />
                  </label>
                )}
                {definition && (
                  <div className="mf-membership-card">
                    <strong>{definition.name}</strong>
                    <p>{definition.description}</p>
                    <p>
                      {definition.price} {definition.currency} ·{" "}
                      {definition.kind === "package"
                        ? `${visits} · ${c.visits}`
                        : c.unlimited}
                    </p>
                    <p>
                      {start} — {end || "—"}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p>
                  {
                    readLocalRecords(businessId, "customers").find(
                      (c) => c.id === customerId,
                    )?.name
                  }
                </p>
                {selected && (
                  <MembershipCard membership={selected} locale={locale} />
                )}
                {pending.action === "freeze" && (
                  <label className="mf-form-field">
                    <span>{c.reason}</span>
                    <input
                      required
                      maxLength={240}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </label>
                )}
              </>
            )}
            {["freeze", "resume"].includes(pending.action) && <p>{c.rule}</p>}
            {error && <p role="alert">{c.error}</p>}
            <p className="mf-draft-notice">{c.notice}</p>
            <div className="mf-dialog-actions">
              <button
                type="button"
                className="button"
                disabled={busy}
                onClick={() => setPending(null)}
              >
                {c.cancel}
              </button>
              <button className="button button-primary" disabled={busy}>
                {c.confirm}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
