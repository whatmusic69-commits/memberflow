import { ArrowDownRight } from "lucide-react";
import type { HomeContent } from "@/content/types";
import { StartLink } from "@/components/marketing/start-link";
import { CampaignFlow } from "./campaign-flow";
export function Hero({ c }: { c: HomeContent }) {
  return (
    <section className="hero container">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="status-dot" />
          {c.label}
        </p>
        <h1>
          {c.hero.map((line, i) => (
            <span key={line} className={i ? "muted-heading" : ""}>
              {line}
            </span>
          ))}
        </h1>
        <p className="hero-description">{c.intro}</p>
        <div className="hero-ctas">
          <StartLink label={c.heroStart} />
          <a className="secondary-link" href="#why">
            {c.how}
            <ArrowDownRight size={17} />
          </a>
        </div>
        <p className="hero-footnote">
          <span className="small-line" />
          {c.heroNote}
        </p>
      </div>
      <CampaignFlow c={c} />
      <div className="hero-bottom">
        <span>{c.demo}</span>
      </div>
    </section>
  );
}
