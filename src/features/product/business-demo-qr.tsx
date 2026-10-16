"use client";

import Image from "next/image";
import "./business-demo-qr.css";
import { useEffect, useState } from "react";
import type { Locale } from "@/content";

/** Real, scannable marketing QR; never a customer credential. */
export function BusinessDemoQr({ locale, label, variant = "business" }: { locale: Locale; label: string; variant?: "business" | "scanner" }) {
  const [code, setCode] = useState<{ image: string; href: string } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const localPreview = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DASHBOARD_MODE !== "api";
    // Public production marketing never assumes that a demo business exists in Symfony.
    const path = variant === "scanner"
      ? `/${locale}/product#staff-scanner-demo`
      : localPreview
      ? `/b/your-coffee?demo=guest&lang=${locale}`
      : `/${locale}/product#customer-page-preview`;
    const href = new URL(path, window.location.origin).href;
    import("qrcode").then(({ default: qr }) => qr.toDataURL(href, {
      width: 384, margin: 4, errorCorrectionLevel: "M", color: { dark: "#263426", light: "#ffffff" },
    })).then(image => {
      if (!cancelled) setCode({ image, href });
    }).catch(() => {
      // Keep the example reachable if QR generation is unavailable.
      if (!cancelled) setCode({ image: "", href });
    });
    return () => { cancelled = true; };
  }, [locale, variant]);
  return <a className="business-demo-qr" href={code?.href ?? `/${locale}/product#${variant === "scanner" ? "staff-scanner-demo" : "customer-page-preview"}`} aria-label={label}>
    {code?.image ? <Image src={code.image} alt={label} width={128} height={128} unoptimized /> : <span>{label}</span>}
  </a>;
}
