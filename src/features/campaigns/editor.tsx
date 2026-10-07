"use client";
import { useDialogDismiss, animateDialogClose } from "@/lib/motion/dialog";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ImagePlus, X } from "lucide-react";
import { workspaceContent } from "@/content/workspace";
import { useWorkspace } from "@/features/dashboard/workspace";
import {
  campaignChannels,
  campaignKinds,
  type CampaignDraft,
  type CampaignInput,
} from "./types";
import { getCampaignService } from "./service";
const empty: CampaignInput = {
  name: "",
  kind: "offer",
  description: "",
  price: "",
  currency: "EUR",
  channels: [],
  image: null,
};
export function CampaignEditor({
  draft,
  onClose: closeImmediately,
  onSaved,
}: {
  draft?: CampaignDraft;
  onClose: () => void;
  onSaved: (draft: CampaignDraft) => void;
}) {
  const { locale, data, can } = useWorkspace();
  const c = workspaceContent[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const onClose = useDialogDismiss(dialog, closeImmediately);
  const [input, setInput] = useState<CampaignInput>(draft || empty);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const node = dialog.current;
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
  const field = <K extends keyof CampaignInput>(
    key: K,
    value: CampaignInput[K],
  ) => setInput((previous) => ({ ...previous, [key]: value }));
  const demo =
    data?.source === "demo" && process.env.NODE_ENV === "development";
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !data || !demo || !can("campaign.create")) return;
    if (!input.name.trim()) {
      setError(c.required);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await getCampaignService(true).save(
        data.business.id,
        {
          ...input,
          name: input.name.trim(),
          description: input.description.trim(),
        },
        draft?.id,
      );
      animateDialogClose(dialog.current, () => onSaved(result));
    } catch {
      setError(c.saveError);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="mf-campaign-dialog"
      aria-labelledby="campaign-editor-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <header>
        <div>
          <span className="mf-kicker">MemberFlow / {c.source}</span>
          <h2 id="campaign-editor-title">
            {draft ? c.editTitle : c.editorTitle}
          </h2>
        </div>
        <button
          className="mf-icon-button"
          aria-label={c.cancel}
          disabled={busy}
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </header>
      <div className="mf-editor-layout">
        <form onSubmit={save}>
          <label className="mf-form-field">
            <span>{c.title}</span>
            <input
              autoFocus
              name="campaignName"
              value={input.name}
              required
              maxLength={120}
              onChange={(e) => field("name", e.target.value)}
            />
          </label>
          <label className="mf-form-field">
            <span>{c.kind}</span>
            <select
              value={input.kind}
              onChange={(e) =>
                field("kind", e.target.value as CampaignInput["kind"])
              }
            >
              {campaignKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {c.kinds[kind]}
                </option>
              ))}
            </select>
          </label>
          <label className="mf-form-field">
            <span>{c.description}</span>
            <textarea
              value={input.description}
              maxLength={2000}
              rows={3}
              placeholder={c.descriptionHint}
              onChange={(e) => field("description", e.target.value)}
            />
          </label>
          <div className="mf-price-fields">
            <label className="mf-form-field">
              <span>{c.price}</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={input.price}
                onChange={(e) => field("price", e.target.value)}
              />
            </label>
            <label className="mf-form-field">
              <span>{c.currency}</span>
              <select
                value={input.currency}
                onChange={(e) => field("currency", e.target.value)}
              >
                {["EUR", "USD", "GBP"].map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="mf-form-field">
            <span>{c.image}</span>
            <input
              ref={imageInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0];
                setImageError(false);
                if (!file) return;
                if (
                  !["image/jpeg", "image/png", "image/webp"].includes(
                    file.type,
                  ) ||
                  file.size > 2 * 1024 * 1024
                ) {
                  setImageError(true);
                  event.currentTarget.value = "";
                  return;
                }
                try {
                  const value = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                  });
                  field("image", value);
                } catch {
                  setImageError(true);
                }
              }}
            />
            <small>{c.imageHint}</small>
          </label>
          {imageError && (
            <p role="alert" className="mf-form-error">
              {c.imageError}
            </p>
          )}
          {input.image && (
            <button
              type="button"
              className="mf-text-link"
              onClick={() => {
                field("image", null);
                if (imageInput.current) imageInput.current.value = "";
              }}
            >
              {c.removeImage}
            </button>
          )}
          <fieldset className="mf-channel-select">
            <legend>{c.channels}</legend>
            <p>{c.channelsHint}</p>
            {campaignChannels.map((channel) => (
              <label key={channel}>
                <input
                  type="checkbox"
                  checked={input.channels.includes(channel)}
                  onChange={(e) =>
                    field(
                      "channels",
                      e.target.checked
                        ? [...input.channels, channel]
                        : input.channels.filter((value) => value !== channel),
                    )
                  }
                />
                <span>{channel}</span>
              </label>
            ))}
          </fieldset>
          <p className="mf-draft-notice">
            {demo ? c.draftNotice : c.apiNotice}
          </p>
          <div aria-live="polite">
            {error && <p className="mf-form-error">{error}</p>}
          </div>
          <footer>
            <button
              type="button"
              className="button"
              onClick={onClose}
              disabled={busy}
            >
              {c.cancel}
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={busy || !demo}
            >
              {busy ? c.saving : c.save}
              <ArrowRight size={15} />
            </button>
          </footer>
        </form>
        <aside className="mf-editor-preview">
          <p className="mf-kicker">{c.preview}</p>
          <div className="mf-campaign-preview-card">
            <span className="mf-kicker">{c.kinds[input.kind]}</span>
            {input.image ? (
              <Image
                src={input.image}
                alt=""
                width={420}
                height={300}
                unoptimized
              />
            ) : (
              <div className="mf-photo-placeholder">
                <ImagePlus size={30} strokeWidth={1} />
              </div>
            )}
            <h3>{input.name || c.untitled}</h3>
            {input.price && (
              <strong>
                {input.price} {input.currency}
              </strong>
            )}
            <p>{input.description}</p>
            <small>
              {data?.business.name} · {data?.business.city}
            </small>
          </div>
          <p className="mf-kicker">{c.selectedChannels}</p>
          <div className="mf-preview-channels">
            {input.channels.length ? (
              input.channels.map((channel) => (
                <span key={channel}>{channel}</span>
              ))
            ) : (
              <small>{c.noChannels}</small>
            )}
          </div>
        </aside>
      </div>
    </dialog>
  );
}
