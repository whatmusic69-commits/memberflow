import type { ReactNode } from "react";
import type { Metadata } from "next";
import { content, type Locale, locales } from "@/content";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { StartLink } from "@/components/marketing/start-link";
import { publicSiteContent, type MarketingPage } from "@/content/public-site";
import "@/features/home/home.css";
import "./public-site.css";
export function publicMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  const origin = "https://memberflow-seven.vercel.app";
  const url = `${origin}/${locale}/${path}`;
  return {
    title: `${title} — MemberFlow`,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${origin}/${l}/${path}`]),
      ),
    },
    openGraph: {
      title: `${title} — MemberFlow`,
      description,
      url,
      siteName: "MemberFlow",
      type: "website",
      locale: { en: "en_US", lv: "lv_LV", ru: "ru_RU" }[locale],
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => ({ en: "en_US", lv: "lv_LV", ru: "ru_RU" })[l]),
    },
  };
}
export function PublicShell({
  locale,
  page,
  children,
}: {
  locale: Locale;
  page: MarketingPage;
  children: ReactNode;
}) {
  return (
    <>
      <div id="top" aria-hidden="true" />
      <Header c={content[locale]} locale={locale} page={page} />
      <main id="main" className="public-page container">
        {children}
      </main>
      <Footer c={content[locale]} locale={locale} page={page} />
    </>
  );
}
export function PublicHeading({
  label,
  title,
  intro,
}: {
  label: string;
  title: string;
  intro: string;
}) {
  return (
    <header className="public-heading">
      <p className="eyebrow">
        <span className="status-dot" />
        {label}
      </p>
      <h1>{title}</h1>
      <p>{intro}</p>
    </header>
  );
}
export function PublicCTA({ locale }: { locale: Locale }) {
  const c = publicSiteContent[locale];
  return (
    <section className="public-cta">
      <div>
        <h2>{c.ctaTitle}</h2>
        <p>{c.ctaText}</p>
      </div>
      <StartLink label={c.start} />
    </section>
  );
}
