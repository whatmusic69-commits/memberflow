import Link from "next/link";
import type { Locale } from "@/content";
import type { OnboardingContent } from "@/content/onboarding/types";
import type { Activation } from "./types";
/** Only a server-verified active/trialing subscription may render this transition. */
export function ReadyState({
  activation,
  businessName,
  planName,
  c,
  locale,
}: {
  activation: Extract<Activation, { verified: true }>;
  businessName: string;
  planName: string;
  c: OnboardingContent;
  locale: Locale;
}) {
  if (!activation.verified) return null;
  return (
    <section className="onboarding-ready">
      <p className="eyebrow">MEMBERFLOW</p>
      <h1>{c.ready}</h1>
      <h2>{businessName}</h2>
      <p className="ready-flow">{c.readyFlow.join(" → ")}</p>
      <p>
        {c.steps[4]} · {planName}
      </p>
      <Link
        className="button button-primary"
        href={`/dashboard?lang=${locale}&welcome=1`}
      >
        {c.openWorkspace} →
      </Link>
    </section>
  );
}
