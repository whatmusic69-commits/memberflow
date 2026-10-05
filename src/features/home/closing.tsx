import {
  ArrowRight,
  ArrowUpRight,
  Coffee,
  Scissors,
  Dumbbell,
  ShoppingBag,
  Wrench,
} from "lucide-react";
import { ReplayFlow } from "./replay-flow";
import type { HomeContent } from "@/content/types";
import { PreviewAction } from "@/components/marketing/actions";
import { FlowPath } from "@/components/ui/flow-path";
import { FlowMark } from "@/components/ui/brand";
export function GrowthLoop({ c }: { c: HomeContent }) {
  return (
    <section className="growth-section" id="growth" data-flow>
      <div className="container">
        <div className="growth-heading">
          <p className="eyebrow">
            <span className="status-dot" />
            MEMBERFLOW
          </p>
          <h2>{c.loopTitle}</h2>
          <p>{c.loopDescription}</p>
        </div>
        <div className="growth-loop">
          <svg
            className="growth-flow"
            viewBox="0 0 1200 130"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <FlowPath d="M100 35H1100V110H100V35" delay={200} duration={3600} />
            <circle
              className="loop-end-node"
              cx="1100"
              cy="110"
              r="3.5"
              fill="var(--accent)"
            />
          </svg>
          {c.loop.map((step, i) => (
            <div
              key={step}
              className="growth-step"
              data-stage
              style={{ animationDelay: `${i * 220}ms` }}
            >
              <span>0{i + 1}</span>
              <strong>{step}</strong>
              {i < 5 ? (
                <ArrowRight size={19} aria-hidden="true" />
              ) : (
                <ReplayFlow label={c.replayLoop} />
              )}
            </div>
          ))}
        </div>
        <div className="loop-return-line" aria-hidden="true">
          <span />
          <span className="loop-dot" />
          <span />
        </div>
      </div>
    </section>
  );
}
export function Solutions({ c }: { c: HomeContent }) {
  const icons = [Coffee, Scissors, Dumbbell, ShoppingBag, Wrench];
  return (
    <section id="solutions" className="solutions-section container">
      <div className="solutions-heading">
        <h2>{c.solutionsTitle}</h2>
        <p>{c.solutionsDescription}</p>
      </div>
      <div className="solutions-list">
        {c.solutions.map((solution, i) => {
          const Icon = icons[i];
          return (
            <a href="#product" key={solution}>
              <Icon size={23} strokeWidth={1.5} />
              <span>{solution}</span>
              <span className="solution-number">0{i + 1}</span>
              <ArrowUpRight
                className="solution-arrow"
                size={15}
                aria-hidden="true"
              />
            </a>
          );
        })}
      </div>
    </section>
  );
}
export function FinalCTA({ c }: { c: HomeContent }) {
  return (
    <section id="get-started" className="final-section container" data-flow>
      <svg className="final-signal" viewBox="0 0 40 65" aria-hidden="true">
        <FlowPath d="M20 0V56" duration={1200} />
      </svg>
      <div className="final-mark">
        <FlowMark />
      </div>
      <h2>{c.final[0]}</h2>
      <p>{c.final[1]}</p>
      <PreviewAction
        label={c.start}
        title={c.dialogs.start[0]}
        description={c.dialogs.start[1]}
        close={c.close}
        primary
      />
      <div className="final-flow" aria-hidden="true">
        <span />
        <ArrowRight size={15} />
        <span />
        <ArrowUpRight size={15} />
        <span className="orange" />
      </div>
    </section>
  );
}
