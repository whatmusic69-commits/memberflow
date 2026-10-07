"use client";
import { useDialogDismiss } from "@/lib/motion/dialog";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { dashboardContent } from "@/content/dashboard";
import type { CampaignDraft } from "./types";
export function CampaignDetails({
  campaign,
  onClose: closeImmediately,
}: {
  campaign: CampaignDraft;
  onClose: () => void;
}) {
  const { locale } = useWorkspace();
  const c = dashboardContent[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const onClose = useDialogDismiss(dialog, closeImmediately);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      opener?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="mf-editor-dialog"
      aria-labelledby="campaign-detail-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header className="mf-panel-heading">
        <h2 id="campaign-detail-title">{campaign.name}</h2>
        <button
          className="mf-icon-button"
          onClick={onClose}
          aria-label={c.close}
        >
          <X size={20} />
        </button>
      </header>
      <p className="mf-status">{c.statuses[campaign.status]}</p>
      {campaign.description && <p>{campaign.description}</p>}
      <ul className="mf-status-list">
        {campaign.channels.map((name) => {
          const status = campaign.channelStatuses?.find(
            (item) => item.name === name,
          );
          return (
            <li key={name}>
              <span>{name}</span>
              {status && (
                <span className="mf-status">{c.statuses[status.status]}</span>
              )}
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
