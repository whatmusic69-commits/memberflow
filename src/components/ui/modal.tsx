"use client";
import { useDialogDismiss } from "@/lib/motion/dialog";
import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { X } from "lucide-react";
export function Modal({
  title,
  closeLabel,
  onClose: closeImmediately,
  children,
  className = "",
  dialogRef,
  closeDisabled = false,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  dialogRef?: RefObject<HTMLDialogElement | null>;
  closeDisabled?: boolean;
}) {
  const localDialog = useRef<HTMLDialogElement>(null);
  const dialog = dialogRef ?? localDialog;
  const onClose = useDialogDismiss(dialog, closeImmediately);
  const titleId = useId();
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.current?.showModal();
    dialog.current?.querySelector<HTMLElement>("input, select")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
  }, [dialog]);
  return (
    <dialog
      ref={dialog}
      className={`mf-editor-dialog mf-dialog-compact ${className}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!closeDisabled) onClose();
      }}
      onClick={(event) => {
        if (!closeDisabled && event.target === event.currentTarget) onClose();
      }}
    >
      <header className="mf-panel-heading">
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="mf-icon-button"
          aria-label={closeLabel}
          disabled={closeDisabled}
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
