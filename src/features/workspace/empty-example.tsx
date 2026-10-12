import {
  ArrowRight,
  Circle,
  Gift,
  Megaphone,
  QrCode,
  Ticket,
  Waypoints,
} from "lucide-react";
import type { Locale } from "@/content";
import { emptyExamples, type ExampleFeature } from "@/content/empty-examples";
const icons = {
  offers: Gift,
  loyalty: Gift,
  memberships: Ticket,
  campaigns: Megaphone,
  customers: QrCode,
  automations: Waypoints,
};
export function EmptyExample({
  feature,
  locale,
}: {
  feature: ExampleFeature;
  locale: Locale;
}) {
  const c = emptyExamples[locale];
  const example = c.examples[feature];
  const Icon = icons[feature];
  return (
    <aside
      className={`mf-empty-example mf-empty-example-${feature}`}
      aria-label={c.label}
    >
      <div className="mf-empty-example-preview">
        <span className="mf-empty-example-label">
          <Icon size={16} aria-hidden="true" />
          {c.label}
        </span>
        <h3>{example.title}</h3>
        {feature === "loyalty" && (
          <div className="mf-empty-example-stamps" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <Circle key={i} size={24} strokeWidth={1.3} />
            ))}
          </div>
        )}
        <p>{example.text}</p>
        <dl className="mf-empty-example-details">
          {example.details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <small>{c.hint}</small>
      </div>
      <ol className="mf-empty-example-steps">
        {example.steps.map((step, i) => (
          <li key={step}>
            <span>0{i + 1}</span>
            <p>{step}</p>
            {i < 2 && <ArrowRight size={15} aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </aside>
  );
}
