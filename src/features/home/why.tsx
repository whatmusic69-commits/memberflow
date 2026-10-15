import Link from "next/link";
import type { Locale } from "@/content";
import { faqContent } from "@/content/faq";
import { FAQItem } from "./faq-item";
import type { HomeContent } from "@/content/types";
import { Wallet } from "lucide-react";
import { StartLink } from "@/components/marketing/start-link";
import { ReturnJourney } from "./product-stories";
export function WhyMemberFlow({ c, compact = false }: { c: HomeContent; compact?: boolean }) {
  const w = c.experience.why;
  return (
    <section
      id="why"
      className="why-section container"
      aria-labelledby="why-title"
    >
      <div className="why-heading">
        <p className="eyebrow">
          <span className="status-dot" />
          {w.label}
        </p>
        <h2 id="why-title">{w.title}</h2>
        <p>{w.intro}</p>
      </div>
      {!compact && <><div className="why-content">
        <div className="why-reasons">
          {w.pairs.map((pair, i) => (
            <div key={pair.problem}>
              <span className="why-index">0{i + 1}</span>
              <div>
                <h3>{pair.problem}</h3>
                <p>{pair.solution}</p>
              </div>
            </div>
          ))}
        </div>
        <ReturnJourney c={c} />
      </div>
      <div className="why-wallet-connection">
        <Wallet size={22} aria-hidden="true" />
        <div>
          <h3>{w.walletConnection}</h3>
          <p>{w.walletRelationship}</p>
          <small>{w.walletNote}</small>
        </div>
      </div></>}
    </section>
  );
}
export function Benefits({ c }: { c: HomeContent }) {
  return (
    <section
      className="benefits-section container"
      aria-labelledby="benefits-title"
    >
      <h2 id="benefits-title">{c.experience.benefitsTitle}</h2>
      <div className="benefits-list">
        {c.experience.benefits.map((benefit, i) => (
          <div key={benefit.title}>
            <span>0{i + 1}</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </div>
        ))}
      </div>
      <StartLink label={c.heroStart} />
    </section>
  );
}
export function FAQ({ c, locale }: { c: HomeContent; locale: Locale }) {
  return (
    <section
      id="faq"
      className="faq-section container"
      aria-labelledby="faq-title"
    >
      <h2 id="faq-title">{c.experience.faqTitle}</h2>
      <div>
        {c.experience.faq.map((item) => (
          <FAQItem key={item.question} question={item.question} answer={item.answer} />
        ))}
      </div>
      <Link className="secondary-link faq-all-link" href={`/${locale}/faq`}>{faqContent[locale].all} →</Link>
    </section>
  );
}
