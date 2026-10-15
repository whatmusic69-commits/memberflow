"use client";
import Image from "next/image";
import { useId, useState } from "react";
import { Coffee, MapPin, Clock, Gift, Ticket, Wallet } from "lucide-react";
import type { HomeContent } from "@/content/types";
import type { Locale } from "@/content";
import { customerPageContent } from "@/content/customer-page";
import { ProgrammeCard } from "@/components/customer/programme-card";
import { LoyaltyProgress } from "@/components/customer/loyalty-progress";
import { campaign, marketingLoyalty } from "@/data/demo/home";
export function CustomerPagePreview({
  c,
  locale,
}: {
  c: HomeContent;
  locale: Locale;
}) {
  const [personal, setPersonal] = useState(false);
  const instanceId = useId();
  const labels = c.experience.customerPage;
  const tabs = [labels.public, labels.personal];
  return (
    <figure className="customer-page-story">
      <div
        className="example-tabs"
        role="tablist"
        aria-label={labels.description}
      >
        {tabs.map((label, i) => (
          <button
            key={label}
            id={`${instanceId}-cp-example-tab-${i}`}
            role="tab"
            aria-selected={personal === Boolean(i)}
            aria-controls={`${instanceId}-cp-example-content`}
            tabIndex={personal === Boolean(i) ? 0 : -1}
            onClick={() => setPersonal(Boolean(i))}
            onKeyDown={(event) => {
              if (
                ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              ) {
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? 1
                      : personal
                        ? 0
                        : 1;
                setPersonal(Boolean(next));
                document.getElementById(`${instanceId}-cp-example-tab-${next}`)?.focus();
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className="product-phone"
        id={`${instanceId}-cp-example-content`}
        role="tabpanel"
        aria-labelledby={`${instanceId}-cp-example-tab-${personal ? 1 : 0}`}
        tabIndex={0}
      >
        <div className="phone-chrome">
          <span />
          <span>MEMBERFLOW</span>
          <span />
        </div>
        <div className="page-example-cover">
          <Image src={campaign.image} alt={c.imageAlt} fill sizes="300px" />
          <span>Your Coffee</span>
        </div>
        <div className="page-example-body">
          <div className="page-example-brand">
            <Coffee size={20} />
            <h3>Your Coffee</h3>
          </div>
          <p>{labels.businessDescription}</p>
          <div className="page-example-views">
            <div className="page-example-view" data-active={personal} aria-hidden={!personal} inert={!personal}>
              <div className="page-example-greeting">
                {customerPageContent[locale].greeting.replace(
                  "{name}",
                  locale === "ru" ? "Анна" : "Anna",
                )}
              </div>
              <div className="page-example-loyalty-card">
                <ProgrammeCard business="Your Coffee" label={c.retention[0]} title={c.connect[6]}>
                  <LoyaltyProgress loyalty={marketingLoyalty} progressLabel={customerPageContent[locale].progress} />
                </ProgrammeCard>
              </div>
              <div className="page-example-line">
                <Ticket size={15} />
                <span>
                  {labels.membership}
                  <strong>Coffee Club · {c.retention[6]}</strong>
                </span>
              </div>
              <div className="page-example-line">
                <Wallet size={15} />
                <span>
                  {labels.wallet}
                  <small>{labels.noApp}</small>
                </span>
              </div>
            </div>
            <div className="page-example-view" data-active={!personal} aria-hidden={personal} inert={personal}>
              <div className="page-example-info">
                <span>
                  <MapPin size={13} />
                  {labels.location}
                </span>
                <span>
                  <Clock size={13} />
                  {labels.hours}
                </span>
                <span>Instagram · {labels.social}</span>
              </div>
              <div className="page-example-invitation">
                <strong>{labels.connect}</strong>
                <p>{labels.connectText}</p>
              </div>
              <div className="page-example-line">
                <Gift size={15} />
                <span>
                  {labels.programme}
                  <strong>{c.connect[6]}</strong>
                </span>
              </div>
              <div className="page-example-line">
                <Ticket size={15} />
                <span>
                  {labels.membership}
                  <strong>Coffee Club</strong>
                </span>
              </div>
            </div>
          </div>
          <div className="page-example-offer">
            <small>{personal ? c.retention[9] : labels.offer}</small>
            <strong>{campaign.name}</strong>
            <span>
              {campaign.price} · +2 {c.stamps}
            </span>
          </div>
        </div>
      </div>
      <figcaption>{c.experience.why.example}</figcaption>
    </figure>
  );
}
