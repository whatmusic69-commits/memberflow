import type { HomeContent } from "@/content/types";
import type { Locale } from "@/content";
import { CustomerPagePreview } from "./customer-page-preview";
import {
  CampaignStory,
  StaffStory,
  ActivityStory,
  WalletExplanation,
} from "./product-stories";
const ids = ["product", "connect", "retain", "understand"];
export function Story({ c, locale }: { c: HomeContent; locale: Locale }) {
  return (
    <div className="story refined-story">
      {c.experience.stories.map((section, i) => (
        <section
          id={ids[i]}
          key={ids[i]}
          data-flow
          className={`story-section story-chapter ${i % 2 ? "reverse" : ""} ${i === 2 ? "relationship-chapter" : ""}`}
          aria-labelledby={`story-title-${i}`}
        >
          <div className="container story-inner">
            <div className="story-copy">
              <p className="eyebrow">
                <span className="section-number">0{i + 1}</span>
                {section.label}
              </p>
              <h2 id={`story-title-${i}`}>{section.title}</h2>
              <p className="section-description">{section.text}</p>
              <div className="story-takeaway">
                <span className="small-line" />
                {section.takeaway}
              </div>
              {i === 1 && (
                <ol className="connection-route">
                  <li>{c.experience.customerPage.entry}</li>
                  <li>{c.experience.customerPage.public}</li>
                  <li>{c.experience.customerPage.personal}</li>
                </ol>
              )}
            </div>
            <div className="story-visual">
              {i === 0 ? (
                <CampaignStory c={c} />
              ) : i === 1 ? (
                <CustomerPagePreview c={c} locale={locale} />
              ) : i === 2 ? (
                <StaffStory c={c} locale={locale} />
              ) : (
                <ActivityStory c={c} />
              )}
            </div>
          </div>
          {i === 2 && (
            <div className="container">
              <WalletExplanation c={c} />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
