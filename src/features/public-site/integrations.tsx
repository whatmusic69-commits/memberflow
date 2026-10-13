import Image from "next/image";
import { Waypoints, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/content";
import { publicSiteContent } from "@/content/public-site";
const platforms = [
  "Instagram",
  "Facebook",
  "TikTok",
  "Pinterest",
  "Google Business Profile",
];
export function IntegrationsOverview({ locale }: { locale: Locale }) {
  const c = publicSiteContent[locale];
  return (
    <>
      <section className="wallet-section">
        <div className="public-section-heading">
          <p className="eyebrow">01</p>
          <h2>{c.walletCategory}</h2>
        </div>
        <div className="wallet-pair">
          {["Apple Wallet", "Google Wallet"].map((name, i) => (
            <article key={name}>
              <Image
                src={`/icons/${i === 0 ? "apple" : "google"}-wallet.svg`}
                alt=""
                width={36}
                height={36}
              />
              <span className="public-status">{c.planned}</span>
              <h3>{name}</h3>
              <p>{c.walletDescriptions[i]}</p>
              <div className="wallet-mini-card">
                <span>MemberFlow</span>
                <strong>{c.comparisonRows[2]}</strong>
                <div>
                  <span>● ● ● ○ ○ ○</span>
                  <Waypoints size={24} aria-hidden="true" />
                </div>
              </div>
            </article>
          ))}
        </div>
        <ol className="wallet-steps">
          {c.walletSteps.map((step, i) => (
            <li key={step}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="public-note">{c.walletNote}</p>
        <Link className="secondary-link" href={`/${locale}/help/wallet`}>
          {c.helpHome}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
      <section className="social-section">
        <div className="public-section-heading">
          <p className="eyebrow">02</p>
          <h2>{c.socialCategory}</h2>
        </div>
        <div className="integration-list">
          {platforms.map((name, i) => (
            <article key={name}>
              <span className="integration-icon">
                {[0, 2, 3].includes(i) ? (
                  <Image
                    src={`/icons/${name.toLowerCase()}-color.svg`}
                    alt=""
                    width={27}
                    height={27}
                  />
                ) : (
                  <Waypoints size={27} aria-hidden="true" />
                )}
              </span>
              <div>
                <h3>{name}</h3>
                <p>{c.socialDescriptions[i]}</p>
              </div>
              <span className="public-status">
                {i === 1 ? c.linkOnly : c.planned}
              </span>
            </article>
          ))}
        </div>
        <p className="public-note">{c.integrationNote}</p>
      </section>
    </>
  );
}
