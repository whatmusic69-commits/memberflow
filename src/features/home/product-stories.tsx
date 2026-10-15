import {
  Coffee,
  Wallet,
  UserRound,
  Gift,
  Ticket,
  ArrowRight,
  Clock,
} from "lucide-react";
import type { HomeContent } from "@/content/types";
import { WalletPass } from "./staff-demo";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { CreateVisual, ActivityVisual } from "./story-visuals";
export function CampaignStory({ c }: { c: HomeContent }) {
  return (
    <figure className="campaign-story" data-motion-scene="campaign">
      <CreateVisual c={c} />
      <div id="integrations" className="channel-preparation">
        <span className="product-label">{c.distribution[0]}</span>
        <div>
          {["Instagram", "TikTok", "Pinterest"].map((name, i) => (
            <span key={name} data-motion-item>
              <PlatformIcon index={i} />
              <strong>{name}</strong>
              <small>{c.channelFormats[i]}</small>
            </span>
          ))}
        </div>
      </div>
      <figcaption>{c.experience.why.example} · {c.experience.stories[0].takeaway}</figcaption>
    </figure>
  );
}
export { StaffStory, WalletPass } from "./staff-demo";
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
                  <WalletPass c={c} />
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
