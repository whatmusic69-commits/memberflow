import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Gift,
  MapPin,
  Phone,
  Ticket,
  Wallet,
} from "lucide-react";
import type { Locale } from "@/content";
import {
  customerPageContent,
  customerCategories,
} from "@/content/customer-page";
import type {
  CustomerPagePublic,
  CustomerPagePersonal,
  CustomerPageOffer,
} from "./types";
import { CustomerImage } from "./customer-image";
import { accentStyle, safeLink } from "./public-model";
function OfferCard({
  offer,
  locale,
}: {
  offer: CustomerPageOffer;
  locale: Locale;
}) {
  const c = customerPageContent[locale];
  const date = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(parsed);
  };
  return (
    <article className="cp-offer">
      {offer.imageUrl && (
        <CustomerImage
          src={offer.imageUrl}
          alt=""
          className="cp-offer-image"
          fallback={null}
        />
      )}
      <div>
        <h3>{offer.title}</h3>
        <div className="cp-offer-meta">
          {offer.priceLabel && <strong>{offer.priceLabel}</strong>}
          {offer.bonusLabel && <span>{offer.bonusLabel}</span>}
        </div>
        <details>
          <summary>
            {c.viewOffer}
            <ArrowUpRight size={15} />
          </summary>
          <p>{offer.description}</p>
          {offer.validUntil && (
            <small>
              {c.validUntil.replace("{date}", date(offer.validUntil))}
            </small>
          )}
        </details>
      </div>
    </article>
  );
}

export function CustomerPageView({
  page,
  personal = null,
  locale,
  onJoin,
  preview = false,
  onLogout,
}: {
  page: CustomerPagePublic;
  personal?: CustomerPagePersonal | null;
  locale: Locale;
  onJoin?: () => void;
  preview?: boolean;
  onLogout?: () => void;
}) {
  const c = customerPageContent[locale];
  const initials = page.business.name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] || "")
    .join("");
  const offers = personal ? personal.offers : page.offers;
  const date = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(parsed);
  };
  const links = Object.entries(page.social)
    .map(([name, value]) => ({ name, url: safeLink(value) }))
    .filter((item) => item.url);
  return (
    <div
      className={`cp-page ${preview ? "cp-preview" : ""}`}
      lang={locale}
      style={
        { "--cp-accent": accentStyle(page.branding.accent) } as CSSProperties
      }
    >
      <div className="cp-cover">
        <CustomerImage
          src={page.branding.coverUrl}
          alt=""
          className="cp-cover-image"
          cover
          fallback={
            <div className="cp-cover-fallback">
              <span>{initials}</span>
              <span className="cp-cover-line" />
            </div>
          }
        />
      </div>
      <div className="cp-body">
        <header className="cp-business">
          <CustomerImage
            src={page.branding.logoUrl}
            alt=""
            className="cp-logo"
            fallback={
              <span className="cp-logo cp-logo-fallback">{initials}</span>
            }
          />
          <h1>{page.business.name}</h1>
          {(page.business.category || page.business.city) && (
            <p className="cp-location">
              {[
                customerCategories[locale][page.business.category] ||
                  page.business.category,
                page.business.city,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {page.business.description && (
            <p className="cp-description">{page.business.description}</p>
          )}
        </header>
        {personal ? (
          <div className="cp-greeting">
            <span className="cp-dot" />
            <h2>{c.greeting.replace("{name}", personal.customer.firstName)}</h2>
            {onLogout && (
              <button className="cp-text-action" onClick={onLogout}>
                {c.logout}
              </button>
            )}
          </div>
        ) : (
          <section className="cp-join">
            <h2>{c.joinTitle.replace("{business}", page.business.name)}</h2>
            <p>{c.joinText}</p>
            <button className="cp-button" onClick={onJoin} disabled={preview}>
              {c.join}
              <ArrowUpRight size={17} />
            </button>
            <small>{c.noApp}</small>
          </section>
        )}
        {page.modules.loyalty && (page.loyalty || personal?.loyalty) && (
          <section className="cp-section cp-loyalty">
            <p className="cp-label">
              <Gift size={15} />
              {c.loyalty}
            </p>
            {personal?.loyalty ? (
              <>
                <div className="cp-stamps" aria-hidden="true">
                  {Array.from(
                    {
                      length: Math.min(
                        Math.max(0, personal.loyalty.target),
                        12,
                      ),
                    },
                    (_, i) => (
                      <span
                        key={i}
                        className={i < personal.loyalty!.stamps ? "filled" : ""}
                      >
                        {i < personal.loyalty!.stamps ? (
                          <BadgeCheck size={28} strokeWidth={1.6} />
                        ) : i === personal.loyalty!.target - 1 ? (
                          <Gift size={23} strokeWidth={1.5} />
                        ) : (
                          <span>{String(i + 1).padStart(2, "0")}</span>
                        )}
                      </span>
                    ),
                  )}
                </div>
                <p className="cp-progress">
                  {c.progress
                    .replace("{current}", String(personal.loyalty.stamps))
                    .replace("{target}", String(personal.loyalty.target))}
                </p>
                <div className="cp-reward">
                  <span>{c.nextReward}</span>
                  <strong>{personal.loyalty.nextReward}</strong>
                </div>
              </>
            ) : (
              <>
                <h3>{c.loyaltyTeaser}</h3>
                <p>{page.loyalty?.reward}</p>
                <button
                  className="cp-text-action"
                  onClick={onJoin}
                  disabled={preview}
                >
                  {c.joinRewards}
                  <ArrowUpRight size={15} />
                </button>
              </>
            )}
          </section>
        )}
        {page.modules.offers && offers.length > 0 && (
          <section className="cp-section">
            <p className="cp-label">{personal ? c.forYou : c.offers}</p>
            <div className="cp-offers">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} locale={locale} />
              ))}
            </div>
          </section>
        )}
        {page.modules.memberships &&
          personal &&
          personal.memberships.length > 0 && (
            <section className="cp-section">
              <p className="cp-label">
                <Ticket size={15} />
                {c.memberships}
              </p>
              {personal.memberships.map((membership) => (
                <article className="cp-membership" key={membership.id}>
                  <h3>{membership.name}</h3>
                  {membership.remainingVisits !== null && (
                    <p>
                      {c.visits.replace(
                        "{n}",
                        String(membership.remainingVisits),
                      )}
                    </p>
                  )}
                  {membership.statusLabel && (
                    <small>{membership.statusLabel}</small>
                  )}
                  {membership.validUntil && (
                    <small>
                      {c.validUntil.replace(
                        "{date}",
                        date(membership.validUntil),
                      )}
                    </small>
                  )}
                </article>
              ))}
            </section>
          )}
        {page.modules.memberships &&
          !personal &&
          page.availableMemberships.length > 0 && (
            <section className="cp-section">
              <p className="cp-label">
                <Ticket size={15} />
                {c.discoverMemberships}
              </p>
              {page.availableMemberships.map((membership) => (
                <article className="cp-membership" key={membership.id}>
                  <h3>{membership.name}</h3>
                  <p>{membership.description}</p>
                </article>
              ))}
            </section>
          )}
        {personal &&
          Object.values(personal.wallet).some(
            (state) => state.status !== "UNAVAILABLE",
          ) && (
            <section className="cp-section cp-wallet">
              <p className="cp-label">
                <Wallet size={15} />
                {c.wallet}
              </p>
              <h3>{c.walletTitle.replace("{business}", page.business.name)}</h3>
              <p>{c.walletText}</p>
              {(["apple", "google"] as const).map((provider) => {
                const state = personal.wallet[provider],
                  url = safeLink(state.actionUrl);
                return state.status === "ADDED" ? (
                  <span className="cp-wallet-added" key={provider}>
                    ✓ {provider === "apple" ? "Apple Wallet" : "Google Wallet"}{" "}
                    · {c.walletAdded}
                  </span>
                ) : state.status === "AVAILABLE" && url ? (
                  <a className="cp-wallet-button" key={provider} href={url}>
                    {c[provider]}
                    <ArrowUpRight size={15} />
                  </a>
                ) : null;
              })}
            </section>
          )}
        {(page.business.address ||
          page.business.openingHours ||
          page.business.phone ||
          page.business.email) && (
          <section className="cp-section cp-about">
            <p className="cp-label">{c.about}</p>
            {page.business.address && (
              <div>
                <MapPin size={17} />
                <p>
                  {page.business.address}
                  {page.business.city && <small>{page.business.city}</small>}
                </p>
              </div>
            )}
            {page.business.openingHours && (
              <div>
                <Clock size={17} />
                <p className="cp-hours">{page.business.openingHours}</p>
              </div>
            )}
            {page.business.phone && (
              <div>
                <Phone size={17} />
                <a href={`tel:${page.business.phone.replace(/[^\d+]/g, "")}`}>
                  {page.business.phone}
                </a>
              </div>
            )}
            {page.business.email && (
              <a href={`mailto:${encodeURIComponent(page.business.email)}`}>
                {page.business.email}
              </a>
            )}
          </section>
        )}
        {page.modules.social && links.length > 0 && (
          <nav className="cp-social" aria-label={c.social}>
            {links.map((link) => (
              <a
                key={link.name}
                href={link.url!}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name === "website"
                  ? c.website
                  : {
                      instagram: "Instagram",
                      tiktok: "TikTok",
                      facebook: "Facebook",
                    }[link.name as "instagram" | "tiktok" | "facebook"]}
                <ArrowUpRight size={13} />
              </a>
            ))}
          </nav>
        )}
        <footer className="cp-footer">
          <span className="cp-dot" />
          {c.powered}
        </footer>
      </div>
    </div>
  );
}
