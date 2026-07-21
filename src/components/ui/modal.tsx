"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Modal({ open, title, children, onClose, panelClassName }: { open: boolean; title: string; children: ReactNode; onClose: () => void; panelClassName?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className={cn("w-full max-w-lg rounded-lg bg-white shadow-xl", panelClassName)}>
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="font-semibold">{title}</h2>
          <button className="rounded-md p-2 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#6D5DFB]" onClick={onClose} aria-label="Закрыть">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, text, onConfirm, onClose }: { open: boolean; title: string; text: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-slate-600">{text}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Подтвердить</Button>
      </div>
    </Modal>
  );
}
