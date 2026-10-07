"use client";
import { animateDialogClose } from "@/lib/motion/dialog";
import { StartLink } from "./start-link";
import { useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
export function PreviewAction({
  label,
  title,
  description,
  close,
  primary = false,
}: {
  label: string;
  title: string;
  description: string;
  close: string;
  primary?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  if (primary) return <StartLink label={label} />;
  return (
    <>
      <button
        className={primary ? "button button-primary" : "text-action"}
        onClick={() => dialog.current?.showModal()}
      >
        {label}
        {primary && <ArrowUpRight size={17} aria-hidden="true" />}
      </button>
      <dialog
        ref={dialog}
        onCancel={(event) => {
          event.preventDefault();
          animateDialogClose(dialog.current, () => dialog.current?.close());
        }}
        className="preview-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget)
            animateDialogClose(dialog.current, () => dialog.current?.close());
        }}
        aria-label={title}
      >
        <button
          className="dialog-close icon-button"
          aria-label={close}
          onClick={() =>
            animateDialogClose(dialog.current, () => dialog.current?.close())
          }
        >
          <X size={20} />
        </button>
        <span className="eyebrow">MEMBERFLOW</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <button
          className="button button-primary"
          onClick={() =>
            animateDialogClose(dialog.current, () => dialog.current?.close())
          }
        >
          {close}
        </button>
      </dialog>
    </>
  );
}
