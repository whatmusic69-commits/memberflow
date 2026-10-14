"use client";
/* eslint-disable @next/next/no-img-element -- QR is generated in-memory in the local prototype. */
import { useEffect, useState } from "react";
import type { Locale } from "@/content";
import { registrationContent } from "@/content/customer-registration";
import { prototypeCode } from "@/features/prototype/customer-model";
import { readPrototypeLedger } from "@/features/prototype/repository";
import { workspaceDraftEvent } from "@/features/workspace/repository";
export function PersonalPreviewCard({
  businessId,
  customerId,
  locale,
}: {
  businessId: string;
  customerId: string;
  locale: Locale;
}) {
  const c = registrationContent[locale],
    code = prototypeCode(businessId, customerId),
    [qr, setQr] = useState(""),
    [failed, setFailed] = useState(false),
    [, refresh] = useState(0);
  useEffect(() => {
    let disposed = false;
    import("qrcode")
      .then((q) =>
        q.toDataURL(code, { margin: 2, width: 220, errorCorrectionLevel: "M" }),
      )
      .then((url) => {
        if (!disposed) setQr(url);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
    };
  }, [code]);
  useEffect(() => {
    const update = () => refresh((n) => n + 1);
    window.addEventListener(workspaceDraftEvent, update);
    return () => window.removeEventListener(workspaceDraftEvent, update);
  }, []);
  const rewards = readPrototypeLedger(businessId).rewards.filter(
    (r) => r.customerId === customerId && r.status === "AVAILABLE",
  );
  return (
    <section className="cr-personal-card">
      <h2>{c.qr}</h2>
      {qr && <img src={qr} width={220} height={220} alt={c.qr} />}
      <p>{c.qrNote}</p>
      {failed && <p role="alert">{c.qrError}</p>}
      <input
        aria-label={c.qr}
        readOnly
        value={code}
        onFocus={(e) => e.target.select()}
      />
      {rewards.map((r) => (
        <p className="cr-benefit" key={r.id}>
          {r.name}
        </p>
      ))}
    </section>
  );
}
