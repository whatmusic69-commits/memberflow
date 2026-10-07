"use client";
import { useDialogDismiss, animateDialogClose } from "@/lib/motion/dialog";
import { createPermissions } from "@/features/access/permissions";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { moduleContent } from "@/content/modules";
import { useWorkspace } from "@/features/dashboard/workspace";
import { schemas } from "./schema";
import { RecordPreview } from "./record-preview";
import type { ModuleId, ModuleRecords, OfferDraft, RecordInput } from "./types";
import { isDemoAdapter, moduleRepository } from "./repository";
export function ModuleEditor({
  feature,
  record,
  offers,
  onClose: closeImmediately,
  onSaved,
}: {
  feature: ModuleId;
  record?: ModuleRecords[ModuleId];
  offers: OfferDraft[];
  onClose: () => void;
  onSaved: (record: ModuleRecords[ModuleId]) => void;
}) {
  const { data, locale, href, can } = useWorkspace();
  const c = moduleContent[locale];
  const schema = schemas[feature];
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.keys(schema.defaults).map((key) => [
        key,
        record && key in record
          ? String(record[key as keyof typeof record])
          : schema.defaults[key],
      ]),
    ),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const onClose = useDialogDismiss(dialog, closeImmediately);
  const demo = isDemoAdapter(data?.source === "demo");
  const writable = demo && can(createPermissions[feature]);
  useEffect(() => {
    const node = dialog.current;
    const opener = document.activeElement as HTMLElement | null;
    const before = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      node?.close();
      document.body.style.overflow = before;
      opener?.focus({ preventScroll: true });
    };
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !data || !writable) return;
    if (!values.name.trim()) {
      setError(c.required);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const input = {
        ...values,
        name: values.name.trim(),
      } as unknown as RecordInput<ModuleId>;
      const result = await moduleRepository(feature, true).save(
        data.business.id,
        input,
        record?.id,
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
      aria-labelledby="module-editor-heading"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <header>
        <div>
          <span className="mf-kicker">MemberFlow / {c.preview}</span>
          <h2 id="module-editor-heading">
            {record ? c.edit : c.create[feature]}
          </h2>
        </div>
        <button
          className="mf-icon-button"
          onClick={onClose}
          disabled={busy}
          aria-label={c.close}
        >
          <X size={21} />
        </button>
      </header>
      <div className="mf-editor-layout">
        <form onSubmit={submit}>
          {schema.fields
            .filter(
              (field) =>
                !(
                  feature === "memberships" &&
                  values.kind === "package" &&
                  field.key === "interval"
                ),
            )
            .map((field) => {
              const label = c.fields[field.key as keyof typeof c.fields];
              return (
                <label key={field.key} className="mf-form-field">
                  <span>{label}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      required={field.required}
                      maxLength={2000}
                      value={values[field.key]}
                      onChange={(e) =>
                        setValues({ ...values, [field.key]: e.target.value })
                      }
                    />
                  ) : field.type === "select" ? (
                    <select
                      required={field.required}
                      value={values[field.key]}
                      onChange={(e) =>
                        setValues({ ...values, [field.key]: e.target.value })
                      }
                    >
                      {field.key === "offerId" ? (
                        <>
                          <option value="">{c.selectOffer}</option>
                          {offers
                            .filter((offer) => !offer.archived)
                            .map((offer) => (
                              <option value={offer.id} key={offer.id}>
                                {offer.name}
                              </option>
                            ))}
                        </>
                      ) : (
                        (field.options || []).map((option) => (
                          <option key={option} value={option}>
                            {c.options[option as keyof typeof c.options] ||
                              option}
                          </option>
                        ))
                      )}
                    </select>
                  ) : (
                    <input
                      autoFocus={field.key === "name"}
                      type={field.type || "text"}
                      min={field.min}
                      step={field.step || "1"}
                      max={field.type === "number" ? 1000000 : undefined}
                      required={field.required}
                      maxLength={field.type === "number" ? undefined : 240}
                      value={values[field.key]}
                      onChange={(e) =>
                        setValues({ ...values, [field.key]: e.target.value })
                      }
                    />
                  )}
                </label>
              );
            })}
          {feature === "automations" &&
            !offers.some((offer) => !offer.archived) && (
              <p className="mf-draft-notice">
                {c.noOffer}{" "}
                <Link
                  className="mf-text-link"
                  href={href("offers")}
                  onClick={onClose}
                >
                  {c.offerLink}
                  <ArrowRight size={13} />
                </Link>
              </p>
            )}
          <p className="mf-draft-notice">{demo ? c.demoNotice : c.apiNotice}</p>
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
              className="button button-primary"
              type="submit"
              disabled={
                busy ||
                !writable ||
                (feature === "automations" &&
                  !offers.some((offer) => !offer.archived))
              }
            >
              {busy
                ? c.saving
                : feature === "customers"
                  ? c.saveCustomer
                  : c.save}
              <ArrowRight size={15} />
            </button>
          </footer>
        </form>
        <aside className="mf-editor-preview">
          <p className="mf-kicker">{c.preview}</p>
          <RecordPreview
            feature={feature}
            values={values}
            c={c}
            businessName={data?.business.name || "MemberFlow"}
            offerName={
              offers.find((offer) => offer.id === values.offerId)?.name
            }
          />
        </aside>
      </div>
    </dialog>
  );
}
