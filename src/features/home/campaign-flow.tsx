import Image from "next/image";
import { HeroConnections } from "./hero-connections";
import { ArrowDown, Coffee } from "lucide-react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import type { HomeContent } from "@/content/types";
import { campaign } from "@/data/demo/home";
export const ChannelIcon = PlatformIcon;
export function CampaignCard({
  c,
  compact = false,
}: {
  c: HomeContent;
  compact?: boolean;
}) {
  return (
    <article className={`campaign-card ${compact ? "compact" : ""}`}>
      <div className="campaign-label">
        <span className="status-dot" />
        {c.newOffer}
        <span className="campaign-number">01</span>
      </div>
      <div className="campaign-image">
        <Image
          src={campaign.image}
          alt={c.imageAlt}
          fill
          sizes={compact ? "200px" : "(max-width: 600px) 280px, 260px"}
          preload={!compact}
        />
        <span className="image-caption">YOUR COFFEE / RIGA</span>
      </div>
      <div className="campaign-info">
        <div>
          <h3>{campaign.name}</h3>
          <p>{campaign.price}</p>
        </div>
        <span className="stamp-badge">
          +{campaign.stamps} {c.stamps}
        </span>
      </div>
      <div className="campaign-business">
        <Coffee size={15} aria-hidden="true" />
        {campaign.business}
        <span>{campaign.city}</span>
      </div>
    </article>
  );
}
export function CampaignFlow({ c }: { c: HomeContent }) {
  return (
    <div className="hero-flow" data-flow>
      <div className="diagram-topline">
        <span>01 — {c.editor[5]}</span>
        <span>02 — {c.sections[1][0]}</span>
      </div>
      <div className="hero-diagram">
        <div className="hero-campaign">
          <CampaignCard c={c} />
        </div>
        <HeroConnections />
        <span className="mobile-flow-arrow">
          <ArrowDown size={24} />
        </span>
        <div className="hero-channels">
          {["Instagram", "TikTok", "Pinterest", "Apple & Google Wallet"].map(
            (name, i) => (
              <div
                className="channel-node"
                data-stage
                key={name}
                style={{ animationDelay: `${1500 + i * 160}ms` }}
              >
                <div className={`channel-icon channel-${i}`}>
                  <ChannelIcon index={i} />
                </div>
                <div className="channel-copy">
                  <strong>{name}</strong>
                  <span>{c.channelFormats[i]}</span>
                </div>
                <span className="node-end" />
              </div>
            ),
          )}
        </div>
      </div>
      <div className="diagram-bottom">
        <span className="tiny-cross">+</span>
        {c.heroNote}
        <span className="tiny-cross">+</span>
      </div>
    </div>
  );
}
