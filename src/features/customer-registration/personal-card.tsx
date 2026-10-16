"use client";
/* eslint-disable @next/next/no-img-element -- QR is generated in-memory in the local prototype. */
import { useEffect, useState } from "react";
import type { Locale } from "@/content";
import { registrationContent } from "@/content/customer-registration";
import { prototypeCode } from "@/features/prototype/customer-model";
import { customerAccountContent } from "@/content/customer-account";
import { customerPageContent } from "@/content/customer-page";
export function PersonalPreviewCard({
  businessId,
  customerId,
  locale,
}: {
  businessId: string;
  customerId: string;
  locale: Locale;
}) {
  const c = registrationContent[locale], a = customerAccountContent[locale],
    code = prototypeCode(businessId, customerId),
    [result, setResult] = useState<{code:string;image:string;failed?:boolean} | null>(null),
    [copyStatus, setCopyStatus] = useState("");
  const qr = result?.code === code ? result.image : "", failed = result?.code === code && result.failed;
  useEffect(() => {
    let disposed = false;
    import("qrcode")
      .then((q) =>
        q.toDataURL(code, { margin: 2, width: 220, errorCorrectionLevel: "M" }),
      )
      .then((url) => {
        if (!disposed) setResult({code,image:url});
      })
      .catch(() => {
        if (!disposed) setResult({code,image:"",failed:true});
      });
    return () => {
      disposed = true;
    };
  }, [code]);
  return (
    <section id="cp-personal-qr" className="cr-personal-card">
      <h2>{c.qr}</h2>
      <div className="cr-qr-frame" aria-busy={!qr && !failed}>{qr ? <img src={qr} width={220} height={220} alt={c.qr} /> : !failed ? <span role="status">{customerPageContent[locale].loading}</span> : null}</div>
      <p>{c.qrNote}</p>
      {failed && <p role="alert">{c.qrError}</p>}
      <details className="cr-manual-code">
        <summary>{a.manual}</summary>
        <input aria-label={c.qr} readOnly value={code} onFocus={event=>event.target.select()}/>
        <button type="button" className="cp-text-action" onClick={async()=>{
          try { await navigator.clipboard.writeText(code); setCopyStatus(a.copied); }
          catch { setCopyStatus(a.copyError); }
        }}>{a.copy}</button>
        {copyStatus && <p role="status">{copyStatus}</p>}
      </details>
    </section>
  );
}
