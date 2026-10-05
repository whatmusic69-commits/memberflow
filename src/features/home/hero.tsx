import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { HomeContent } from "@/content/types";
import { PreviewAction } from "@/components/marketing/actions";
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
          <PreviewAction
            label={c.start}
            title={c.dialogs.start[0]}
            description={c.dialogs.start[1]}
            close={c.close}
            primary
          />
          <a className="secondary-link" href="#product">
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
        <a href="#product" aria-label={c.how}>
          <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
