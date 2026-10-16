"use client";
import { useState } from "react";
import { motionDemoContent } from "@/content/motion";
import { ScanLine, Check, Wallet, UserRound } from "lucide-react";
import type { HomeContent } from "@/content/types";
import type { Locale } from "@/content";
import { BusinessDemoQr } from "@/features/product/business-demo-qr";
import { ProgrammeCard } from "@/components/customer/programme-card";
import { LoyaltyProgress } from "@/components/customer/loyalty-progress";
import { marketingLoyalty } from "@/data/demo/home";
import { customerPageContent } from "@/content/customer-page";
export function WalletPass({ c, stamps = 4, progressLabel = c.retention[4] }: { c: HomeContent; stamps?: number; progressLabel?: string }) {
  return <div className="story-wallet-pass story-wallet-unified">
    <ProgrammeCard business="Your Coffee" label={c.retention[0]} title={c.connect[6]}>
      <div className="story-wallet-progress"><LoyaltyProgress loyalty={{ ...marketingLoyalty, stamps }} progressLabel={progressLabel} /></div>
    </ProgrammeCard>
    <small><Wallet size={13} aria-hidden="true" /> Apple Wallet / Google Wallet</small>
  </div>;
}
export function StaffStory({ c, locale }: { c: HomeContent; locale: Locale }) {
  const s = c.experience.staff;
  const [phase, setPhase] = useState<"idle" | "confirm" | "done">("idle");
  const copy = motionDemoContent[locale];
  const stamps = phase === "done" ? 4 : 3;
  return (
    <figure id="staff-scanner-demo" className="staff-story" data-demo-phase={phase}>
      <div className="staff-composition">
        <div className="staff-device product-phone">
          <div className="phone-chrome">
            <span />
            <span>MEMBERFLOW</span>
            <span />
          </div>
          <div className="staff-example-heading">
            <ScanLine size={19} />
            <strong>{s.title}</strong>
          </div>
          <div className="staff-example-scan">
            <div className="scan-corner">
              <BusinessDemoQr locale={locale} label={c.connect[8]} variant="scanner" />
            </div>
            <small>{s.qr}</small>
          </div>
          <div className="staff-example-customer">
            <span className="avatar">A</span>
            <span>
              <strong>{locale === "ru" ? "Анна" : "Anna"}</strong>
              <small>Your Coffee</small>
            </span>
            <Check size={15} />
          </div>
          <p className="staff-example-action">{s.action}</p>
          <div className="staff-example-progress">
            <ProgrammeCard business="Your Coffee" label={c.retention[0]} title={c.connect[6]}>
            <LoyaltyProgress
              loyalty={{ ...marketingLoyalty, stamps }}
              progressLabel={customerPageContent[locale].progress}
            />
            </ProgrammeCard>
          </div>
          <p className="staff-example-note">{s.progress}</p>
        </div>
        <div className="staff-side-story">
          <WalletPass c={c} stamps={stamps} progressLabel={customerPageContent[locale].progress} />
          <div className="staff-access">
            <UserRound size={16} />
            <p>
              <strong>{s.access}</strong>
              {s.owner}
            </p>
          </div>
        </div>
      </div>
      <div className="staff-demo-controls">
        <p role="status" aria-live="polite">{phase === "idle" ? c.experience.why.example : phase === "confirm" ? copy.ready : copy.done}</p>
        {phase === "confirm" && <small>{copy.summary}</small>}
        <button type="button" className="button button-outline" onClick={() => setPhase((current) => current === "idle" ? "confirm" : current === "confirm" ? "done" : "idle")}>
          <ScanLine size={17} aria-hidden="true" />
          {phase === "idle" ? copy.run : phase === "confirm" ? copy.confirm : copy.reset}
        </button>
      </div>
      <figcaption>{c.experience.why.example}</figcaption>
    </figure>
  );
}
