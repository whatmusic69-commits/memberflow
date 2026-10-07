import type { HomeContent } from "@/content/types";
import {
  CreateVisual,
  DistributionVisual,
  AcquireVisual,
  ConnectVisual,
  CommunicationVisual,
  ActivityVisual,
  ReturnVisual,
} from "./story-visuals";
import { RetentionVisual } from "./retention";
const visuals = [
  CreateVisual,
  DistributionVisual,
  AcquireVisual,
  ConnectVisual,
  RetentionVisual,
  CommunicationVisual,
  ActivityVisual,
  ReturnVisual,
];
const ids = [
  "product",
  "integrations",
  "acquire",
  "connect",
  "retain",
  "communication",
  "understand",
  "return",
];
export function Story({ c }: { c: HomeContent }) {
  return (
    <div className="story">
      {c.sections.map((section, i) => {
        const Visual = visuals[i];
        return (
          <section
            id={ids[i]}
            key={ids[i]}
            data-flow
            className={`story-section ${i % 2 ? "reverse" : ""} story-${ids[i]} ${i >= 3 && i <= 5 ? "relationship-chapter" : ""}`}
          >
            <div className="container story-inner">
              <div className="story-copy">
                <p className="eyebrow">
                  <span className="section-number">0{i + 1}</span>
                  {section[0]}
                </p>
                <h2>{section[1]}</h2>
                <p className="section-description">{section[2]}</p>
                <div className="story-takeaway">
                  <span className="small-line" />
                  {section[3]}
                </div>
              </div>
              <div className="story-visual">
                <Visual c={c} />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
