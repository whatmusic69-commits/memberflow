"use client";
import { animateDialogClose } from "@/lib/motion/dialog";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Users, ArrowRight } from "lucide-react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { OverviewSkeleton } from "@/features/dashboard/overview";
import { dashboardContent } from "@/content/dashboard";
import { teamContent } from "@/content/team";
import { Modal } from "@/components/ui/modal";
import { getTeamService } from "./service";
import type {
  BusinessMember,
  Invitation,
  InviteRole,
  TeamOverview,
} from "./types";
type Dialog =
  | { kind: "invite" }
  | { kind: "member"; member: BusinessMember }
  | {
      kind: "confirm";
      action: "remove" | "deactivate" | "revoke";
      id: string;
      name: string;
    };
export function TeamPage() {
  const { data, locale, loading, can } = useWorkspace();
  const c = teamContent[locale],
    d = dashboardContent[locale];
  const query = useSearchParams();
  const [team, setTeam] = useState<TeamOverview | null>(null);
  const [pending, setPending] = useState(true),
    [error, setError] = useState(false);
  const [retry, setRetry] = useState(0),
    [message, setMessage] = useState("");
  const modalNode = useRef<HTMLDialogElement>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [email, setEmail] = useState(""),
    [role, setRole] = useState<InviteRole>("STAFF");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const owner: BusinessMember | null = data
    ? { ...data.membership, user: data.user }
    : null;
  const populated = ["active", "partial", "manager"].includes(
    query.get("demo") || "",
  );
  const service =
    data && owner
      ? getTeamService(
          data.business.id,
          data.source === "demo",
          owner,
          populated,
        )
      : null;
  useEffect(() => {
    if (!data || !can("team.read")) return;
    let disposed = false;
    const controller = new AbortController();
    const adapter = getTeamService(
      data.business.id,
      data.source === "demo",
      { ...data.membership, user: data.user },
      populated,
    );
    Promise.resolve().then(() => {
      if (!disposed) {
        setPending(true);
        setError(false);
      }
    });
    adapter
      .list(controller.signal)
      .then((value) => {
        if (!disposed) setTeam(value);
      })
      .catch(() => {
        if (!disposed) setError(true);
      })
      .finally(() => {
        if (!disposed) setPending(false);
      });
    return () => {
      disposed = true;
      controller.abort();
    };
  }, [data, populated, retry, can]);
  async function perform(operation: () => Promise<TeamOverview>) {
    if (lock.current || !can("team.manage")) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    setMessage("");
    try {
      setTeam(await operation());
      animateDialogClose(modalNode.current, () => setDialog(null));
      setMessage(data?.source === "demo" ? c.previewSaved : c.saved);
    } catch {
      setError(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (loading) return <OverviewSkeleton />;
  if (!data || !can("team.read"))
    return (
      <section className="mf-load-error">
        <h1>{d.accessDenied}</h1>
      </section>
    );
  const date = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(value))
      : c.never;
  const status = (value: Invitation["status"]) =>
    ({
      PENDING: c.pending,
      ACCEPTED: c.accepted,
      EXPIRED: c.expired,
      REVOKED: c.revoked,
    })[value];
  const openInvite = () => {
    setEmail("");
    setRole("STAFF");
    setError(false);
    setDialog({ kind: "invite" });
  };
  const alone =
    team?.members.length === 1 &&
    !team.invitations.some((item) => item.status === "PENDING");
  return (
    <section className="mf-feature-page mf-team-page">
      <header className="mf-feature-heading">
        <div>
          <p className="mf-kicker">{data.business.name}</p>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
        </div>
        {can("team.manage") && !alone && (
          <button className="button button-primary" onClick={openInvite}>
            <Plus size={16} />
            {c.invite}
          </button>
        )}
      </header>
      <div aria-live="polite" className="mf-team-feedback">
        {message}
      </div>
      {error && (
        <p role="alert" className="mf-form-error">
          {team ? c.error : c.loadError}
        </p>
      )}
      {pending ? (
        <OverviewSkeleton />
      ) : !team ? (
        <button className="button" onClick={() => setRetry((v) => v + 1)}>
          {c.retry}
        </button>
      ) : (
        <>
          {alone && (
            <div className="mf-team-empty">
              <Users size={28} />
              <div>
                <h2>{c.emptyTitle}</h2>
                <p>{c.emptyText}</p>
              </div>
              {can("team.manage") && (
                <button className="button button-primary" onClick={openInvite}>
                  <Plus size={16} />
                  {c.invite}
                </button>
              )}
            </div>
          )}
          <div className="mf-team-list">
            <div className="mf-team-list-head" aria-hidden="true">
              <span>{c.member}</span>
              <span>{c.role}</span>
              <span>{c.status}</span>
              <span>{c.lastActive}</span>
              <span />
            </div>
            {team.members.map((member) => (
              <article className="mf-team-row" key={member.id}>
                <div className="mf-team-person">
                  <span className="mf-user-avatar">
                    {member.user.firstName.slice(0, 1)}
                  </span>
                  <div>
                    <strong>
                      {member.user.firstName}
                      {member.user.id === data.user.id ? ` · ${c.you}` : ""}
                    </strong>
                    <small>{member.user.email || c.noEmail}</small>
                  </div>
                </div>
                <span className="mf-team-role">{d.roles[member.role]}</span>
                <span
                  className={`mf-status mf-status-${member.status === "ACTIVE" ? "ready" : "notConfigured"}`}
                >
                  {member.status === "ACTIVE" ? c.active : c.inactive}
                </span>
                <time dateTime={member.lastActiveAt || undefined}>
                  {date(member.lastActiveAt)}
                </time>
                <button
                  className="mf-text-link"
                  onClick={() => {
                    setRole(member.role === "OWNER" ? "STAFF" : member.role);
                    setError(false);
                    setDialog({ kind: "member", member });
                  }}
                >
                  {member.role === "OWNER" || !can("team.manage")
                    ? c.details
                    : c.edit}
                  <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
          {team.invitations.length > 0 && (
            <section className="mf-team-invitations">
              <h2>{c.invitationHeading}</h2>
              {team.invitations.map((invitation) => (
                <article className="mf-team-row" key={invitation.id}>
                  <div className="mf-team-person">
                    <span className="mf-user-avatar">
                      {invitation.email.slice(0, 1).toUpperCase()}
                    </span>
                    <strong>{invitation.email}</strong>
                  </div>
                  <span className="mf-team-role">
                    {d.roles[invitation.role]}
                  </span>
                  <span className="mf-status">{status(invitation.status)}</span>
                  <span />
                  {can("team.manage") &&
                    ["PENDING", "EXPIRED"].includes(invitation.status) && (
                      <div className="mf-team-row-actions">
                        <button
                          className="mf-text-link"
                          disabled={busy}
                          onClick={() =>
                            service &&
                            void perform(() =>
                              service.invitation(invitation.id, "resend"),
                            )
                          }
                        >
                          {c.resend}
                        </button>
                        <button
                          className="mf-text-link mf-danger"
                          disabled={busy}
                          onClick={() =>
                            setDialog({
                              kind: "confirm",
                              action: "revoke",
                              id: invitation.id,
                              name: invitation.email,
                            })
                          }
                        >
                          {c.revoke}
                        </button>
                      </div>
                    )}
                </article>
              ))}
            </section>
          )}
        </>
      )}
      {dialog && (
        <Modal
          dialogRef={modalNode}
          closeDisabled={busy}
          title={
            dialog.kind === "invite"
              ? c.invite
              : dialog.kind === "member"
                ? dialog.member.user.firstName
                : dialog.action === "remove"
                  ? c.confirmRemove
                  : dialog.action === "deactivate"
                    ? c.confirmDeactivate
                    : c.confirmRevoke
          }
          closeLabel={c.close}
          onClose={() => {
            if (!busy) setDialog(null);
          }}
        >
          {error && (
            <p role="alert" className="mf-form-error">
              {c.error}
            </p>
          )}
          {dialog.kind === "invite" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (service)
                  void perform(() => service.invite(email.trim(), role));
              }}
            >
              <label className="mf-form-field">
                <span>{c.email}</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="mf-form-field">
                <span>{c.role}</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as InviteRole)}
                >
                  {(["ADMIN", "MANAGER", "STAFF"] as const).map((value) => (
                    <option key={value} value={value}>
                      {d.roles[value]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mf-dialog-actions">
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={() => setDialog(null)}
                >
                  {c.cancel}
                </button>
                <button className="button button-primary" disabled={busy}>
                  {busy ? c.sending : c.send}
                </button>
              </div>
            </form>
          ) : dialog.kind === "member" ? (
            <>
              <p>{dialog.member.user.email || c.noEmail}</p>
              <dl className="mf-member-detail">
                <div>
                  <dt>{c.role}</dt>
                  <dd>{d.roles[dialog.member.role]}</dd>
                </div>
                <div>
                  <dt>{c.lastActive}</dt>
                  <dd>{date(dialog.member.lastActiveAt)}</dd>
                </div>
              </dl>
              {dialog.member.role === "OWNER" ? (
                <p className="mf-muted">{c.ownerProtected}</p>
              ) : (
                can("team.manage") && (
                  <>
                    <label className="mf-form-field">
                      <span>{c.role}</span>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as InviteRole)}
                      >
                        {(["ADMIN", "MANAGER", "STAFF"] as const).map(
                          (value) => (
                            <option key={value} value={value}>
                              {d.roles[value]}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    <button
                      className="button button-primary"
                      disabled={busy}
                      onClick={() =>
                        service &&
                        void perform(() =>
                          service.updateMember(dialog.member.id, { role }),
                        )
                      }
                    >
                      {busy ? c.saving : c.save}
                    </button>
                    <div className="mf-team-member-actions">
                      <button
                        className="mf-text-link"
                        disabled={busy}
                        onClick={() =>
                          dialog.member.status === "INACTIVE"
                            ? service &&
                              void perform(() =>
                                service.updateMember(dialog.member.id, {
                                  status: "ACTIVE",
                                }),
                              )
                            : setDialog({
                                kind: "confirm",
                                action: "deactivate",
                                id: dialog.member.id,
                                name: dialog.member.user.firstName,
                              })
                        }
                      >
                        {dialog.member.status === "ACTIVE"
                          ? c.deactivate
                          : c.activate}
                      </button>
                      <button
                        className="mf-text-link mf-danger"
                        disabled={busy}
                        onClick={() =>
                          setDialog({
                            kind: "confirm",
                            action: "remove",
                            id: dialog.member.id,
                            name: dialog.member.user.firstName,
                          })
                        }
                      >
                        {c.remove}
                      </button>
                    </div>
                  </>
                )
              )}
            </>
          ) : (
            <>
              <p>{dialog.name}</p>
              <div className="mf-dialog-actions">
                <button
                  className="button"
                  disabled={busy}
                  onClick={() => setDialog(null)}
                >
                  {c.cancel}
                </button>
                <button
                  className="button button-primary"
                  disabled={busy}
                  onClick={() =>
                    service &&
                    void perform(() =>
                      dialog.action === "remove"
                        ? service.removeMember(dialog.id)
                        : dialog.action === "deactivate"
                          ? service.updateMember(dialog.id, {
                              status: "INACTIVE",
                            })
                          : service.invitation(dialog.id, "revoke"),
                    )
                  }
                >
                  {busy ? c.saving : c.confirm}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </section>
  );
}
