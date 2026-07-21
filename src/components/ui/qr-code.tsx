"use client";

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

export function QrCode({ label = "QR", value = "https://memberflow.demo/card/demo-washclub", size = 120, className }: { label?: string; value?: string; size?: number; className?: string }) {
  const boxSize = size + 24;
  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div className="grid place-items-center rounded-xl bg-white p-3 ring-1 ring-slate-200" style={{ width: boxSize, height: boxSize }}>
        <QRCodeSVG value={value} size={size} bgColor="#FFFFFF" fgColor="#151625" level="M" marginSize={1} />
      </div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}
