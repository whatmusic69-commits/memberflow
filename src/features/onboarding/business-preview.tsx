"use client";
import Image from "next/image";
import {
  Coffee,
  Scissors,
  Dumbbell,
  Store,
  BriefcaseBusiness,
  Building2,
  UserRound,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { OnboardingContent } from "@/content/onboarding/types";
import type { BusinessDraft, BusinessType, ProfileDraft } from "./types";
const businessIcons = {
  cafe: Coffee,
  beauty: Scissors,
  fitness: Dumbbell,
  retail: Store,
  services: BriefcaseBusiness,
  other: Building2,
} satisfies Record<BusinessType, LucideIcon>;
export function BusinessPreview({
  c,
  business,
  profile,
  logoUrl,
  businessTypeLabel,
  goals,
}: {
  c: OnboardingContent;
  business: BusinessDraft;
  profile: ProfileDraft;
  logoUrl: string | null;
  businessTypeLabel?: string;
  goals?: string[];
}) {
  const BusinessIcon = businessIcons[business.type];
  return (
    <aside className="onboarding-preview">
      <p className="eyebrow">{c.businessContext}</p>
      <div className="business-preview-card">
        <div className="business-preview-brand">
          <div
            className="business-preview-logo"
            style={{ borderColor: profile.logoBorder ? profile.accent : "transparent" }}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={business.name}
                width={48}
                height={48}
                unoptimized
              />
            ) : (
              <BusinessIcon size={25} aria-hidden="true" />
            )}
          </div>
          <h2>
            {business.name || "MemberFlow"}
            <small>{businessTypeLabel ? `${businessTypeLabel} · ` : ""}{business.city || "—"}</small>
          </h2>
        </div>
        {profile.description && <p>{profile.description}</p>}
        <div className="preview-connection">
          <span style={{ background: profile.accent }} />
          <ArrowRight size={17} />
          <UserRound size={20} />
        </div>
        <p className="preview-customer-label">{c.previewLabel}</p>
        <div className="preview-customer-tabs">
          {c.previewTabs.map((tab) => (
            <span key={tab}>{tab}</span>
          ))}
        </div>
        {goals && goals.length > 0 && (
          <div className="business-preview-goals">
            <p className="eyebrow">{c.goalsContext}</p>
            <ul>{goals.map((goal) => <li key={goal}>{goal}</li>)}</ul>
          </div>
        )}
      </div>
      <p className="onboarding-note">{c.previewNotice}</p>
    </aside>
  );
}
