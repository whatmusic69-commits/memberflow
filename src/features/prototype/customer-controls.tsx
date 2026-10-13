"use client";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { moduleContent } from "@/content/modules";
import Link from "next/link";
import type { Locale } from "@/content";
import type { Permission } from "@/features/access/types";
import { readLocalRecords } from "@/features/workspace/repository";
import { executePrototype, readPrototypeLedger } from "./repository";
import { readPageDraft, previewUrl } from "@/features/customer-page/service";
import { customerPageContent } from "@/content/customer-page";
import { prototypeCode } from "./customer-model";
import { prototypeContent } from "@/content/prototype";
export function PrototypeCustomerControls({
  businessId,
  customerId,
  locale,
  can,
  onChanged,
  memberId,
  actorName,
}: {
  businessId: string;
  customerId: string;
  locale: Locale;
  can: (p: Permission) => boolean;
  onChanged: () => void;
  memberId: string;
  actorName: string;
}) {
  const c = prototypeContent[locale];
  const [, refresh] = useState(0);
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  const modal = useRef<HTMLDialogElement>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "join" | "visit" | "award" | "redeem";
    programmeId?: string;
    rewardId?: string;
    key: string;
  } | null>(null);
  const labels = {
    join: c.join,
    visit: c.visit,
    award: c.award,
    redeem: c.redeem,
  };
  function queue(
    type: "join" | "visit" | "award" | "redeem",
    programmeId?: string,
    rewardId?: string,
  ) {
    setMessage("");
    setPendingAction({ type, programmeId, rewardId, key: crypto.randomUUID() });
  }
  const programmes = readLocalRecords(businessId, "loyalty").filter(
    (p) => !p.archived,
  );
  const ledger = readPrototypeLedger(businessId);
  const page = readPageDraft(businessId);
  const customer = readLocalRecords(businessId, "customers").find(
    (c) => c.id === customerId,
  );
  useEffect(() => {
    const update = () => refresh((n) => n + 1);
    window.addEventListener("memberflow:workspace-drafts-changed", update);
    return () =>
      window.removeEventListener("memberflow:workspace-drafts-changed", update);
  }, []);
  function execute() {
    if (!pendingAction) return;
    const { type, programmeId, rewardId, key } = pendingAction;
    if (lock.current || customer?.archived) return;
    const permission: Permission =
      type === "join"
        ? "customer.create"
        : type === "visit"
          ? "visit.record"
          : type === "award"
            ? "loyalty.award"
            : "reward.redeem";
    if (!can(permission)) return;
    lock.current = true;
    try {
      executePrototype({
        businessId,
        customerId,
        programmeId,
        rewardId,
        type,
        key,
        actorName,
        memberId,
      });
      setMessage(c.saved);
      setPendingAction(null);
      onChanged();
    } catch {
      setMessage(c.error);
    } finally {
      lock.current = false;
    }
  }
  if (!customer) return null;
  return (
    <section className="mf-panel mf-prototype">
      <h2>{c.title}</h2>
      <p className="mf-draft-notice">{c.notice}</p>
      <p className="mf-draft-notice">{c.inactive}</p>
      <label className="mf-form-field">
        <span>{c.code}</span>
        <input
          readOnly
          value={prototypeCode(businessId, customerId)}
          onFocus={(e) => e.target.select()}
        />
      </label>
      {page && (
        <Link
          className="mf-text-link"
          href={`${previewUrl(page, locale)}&prototypeCustomer=${encodeURIComponent(customerId)}`}
        >
          {customerPageContent[locale].title} →
        </Link>
      )}
      {can("customer.scan") && (
        <Link
          className="mf-text-link"
          href={`/staff?lang=${locale}&previewRole=STAFF&workspaceDemo=new&business=${encodeURIComponent(businessId)}`}
        >
          {c.scanner} →
        </Link>
      )}
      {!customer.archived && (
        <>
          <div className="mf-prototype-actions">
            {can("visit.record") && (
              <button className="button" onClick={() => queue("visit")}>
                {c.visit}
              </button>
            )}
          </div>
          {programmes.map((p) => {
            const progress = ledger.progress.find(
              (r) => r.customerId === customerId && r.programmeId === p.id,
            );
            return (
              <div className="mf-prototype-programme" key={p.id}>
                <div>
                  <strong>{p.name}</strong>
                  <p>
                    {progress
                      ? `${progress.current} / ${progress.target} · ${progress.reward}`
                      : p.description}
                  </p>
                </div>
                {progress
                  ? can("loyalty.award") && (
                      <button
                        className="button"
                        onClick={() => queue("award", p.id)}
                      >
                        {c.award}
                      </button>
                    )
                  : can("customer.create") && (
                      <button
                        className="button"
                        onClick={() => queue("join", p.id)}
                      >
                        {c.join}
                      </button>
                    )}
              </div>
            );
          })}
        </>
      )}
      <h3>{c.available}</h3>
      {ledger.rewards
        .filter((r) => r.customerId === customerId && r.status === "AVAILABLE")
        .map((r) => (
          <div className="mf-prototype-programme" key={r.id}>
            <span>{r.name}</span>
            {!customer.archived && can("reward.redeem") && (
              <button
                className="button"
                onClick={() => queue("redeem", r.programmeId, r.id)}
              >
                {c.redeem}
              </button>
            )}
          </div>
        ))}
      <p role="status">{message}</p>
      {pendingAction && (
        <Modal
          dialogRef={modal}
          title={labels[pendingAction.type]}
          closeLabel={moduleContent[locale].cancel}
          onClose={() => setPendingAction(null)}
          className="mf-notification"
        >
          <p>{c.notice}</p>
          {message && <p role="alert">{message}</p>}
          <button className="button button-primary" onClick={execute}>
            {labels[pendingAction.type]}
          </button>
          <button className="button" onClick={() => setPendingAction(null)}>
            {moduleContent[locale].cancel}
          </button>
        </Modal>
      )}
    </section>
  );
}
