import {
  Coffee,
  ScanLine,
  Check,
  Wallet,
  UserRound,
  Gift,
  Ticket,
  ArrowRight,
  Clock,
} from "lucide-react";
import type { HomeContent } from "@/content/types";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { DemoQr, CreateVisual, ActivityVisual } from "./story-visuals";
import { LoyaltyProgress } from "@/components/customer/loyalty-progress";
import { marketingLoyalty, campaign } from "@/data/demo/home";
import { customerPageContent } from "@/content/customer-page";
import type { Locale } from "@/content";
export function CampaignStory({ c }: { c: HomeContent }) {
  return (
    <figure className="campaign-story">
      <CreateVisual c={c} />
      <div id="integrations" className="channel-preparation">
        <span className="product-label">{c.distribution[0]}</span>
        <div>
          {["Instagram", "TikTok", "Pinterest"].map((name, i) => (
            <span key={name}>
              <PlatformIcon index={i} />
              <strong>{name}</strong>
              <small>{c.channelFormats[i]}</small>
            </span>
          ))}
        </div>
      </div>
      <figcaption>{c.experience.why.example}</figcaption>
    </figure>
  );
}
export function WalletPass({ c }: { c: HomeContent }) {
  return (
    <div className="story-wallet-pass">
      <div className="story-wallet-brand">
        <Coffee size={17} />
        <strong>{campaign.business}</strong>
        <Wallet size={16} />
      </div>
      <div className="story-wallet-person">
        <small>{c.connect[4]}</small>
        <strong>{c.experience.customerPage.personal}</strong>
      </div>
      <div className="story-wallet-progress">
        <span>{c.retention[0]}</span>
        <strong>4 / 6</strong>
      </div>
      <div className="story-wallet-reward">
        <Gift size={15} />
        <span>
          {c.connect[5]}
          <strong>{c.connect[6]}</strong>
        </span>
      </div>
      <small>Apple Wallet / Google Wallet</small>
    </div>
  );
}
export function StaffStory({ c, locale }: { c: HomeContent; locale: Locale }) {
  const s = c.experience.staff;
  return (
    <figure className="staff-story">
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
              <DemoQr label={c.connect[8]} />
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
            <LoyaltyProgress
              loyalty={marketingLoyalty}
              progressLabel={customerPageContent[locale].progress}
            />
          </div>
          <p className="staff-example-note">{s.progress}</p>
        </div>
        <div className="staff-side-story">
          <WalletPass c={c} />
          <div className="staff-access">
            <UserRound size={16} />
            <p>
              <strong>{s.access}</strong>
              {s.owner}
            </p>
          </div>
        </div>
      </div>
      <figcaption>{c.experience.why.example}</figcaption>
    </figure>
  );
}
export function WalletExplanation({ c }: { c: HomeContent }) {
  const w = c.experience.wallet;
  return (
    <div className="wallet-explanation">
      <div>
        <p className="eyebrow">APPLE WALLET / GOOGLE WALLET</p>
        <h3>{w.title}</h3>
        <p>{w.text}</p>
      </div>
      <ul>
        <li>
          <Wallet size={17} />
          <span>{w.updates}</span>
        </li>
        <li>
          <Gift size={17} />
          <span>{w.notifications}</span>
        </li>
        <li>
          <UserRound size={17} />
          <span>{w.page}</span>
        </li>
      </ul>
      <small>{c.experience.why.walletNote}</small>
    </div>
  );
}
export function ActivityStory({ c }: { c: HomeContent }) {
  const a = c.experience.activity;
  return (
    <figure className="activity-story">
      <ActivityVisual c={c} />
      <div className="activity-next">
        <span>
          <UserRound size={16} />
          {a.segmentation}
        </span>
        <ArrowRight size={15} aria-hidden="true" />
        <span>
          <Clock size={16} />
          {a.automation}
        </span>
      </div>
      <p>{a.eligibility}</p>
      <figcaption>{c.experience.why.example}</figcaption>
    </figure>
  );
}
export function ReturnJourney({ c }: { c: HomeContent }) {
  const w = c.experience.why;
  const icons = [Clock, Ticket, Wallet, Coffee];
  return (
    <figure className="return-journey panel">
      <div className="return-journey-heading">
        <span className="avatar">A</span>
        <div>
          <span>Your Coffee</span>
          <h3>{w.scenarioTitle}</h3>
        </div>
      </div>
      <ol>
        {w.steps.map((step, i) => {
          const Icon = icons[i];
          return (
            <li key={step.title}>
              <span className="return-step-icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
                {i === 2 && (
                  <div className="return-wallet-mini">
                    <div>
                      <Coffee size={14} />
                      <strong>Your Coffee</strong>
                      <Wallet size={14} />
                    </div>
                    <span>
                      {c.retention[0]}
                      <strong>4 / 6</strong>
                    </span>
                    <small>Apple Wallet / Google Wallet</small>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <figcaption>{w.example}</figcaption>
    </figure>
  );
}
