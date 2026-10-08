import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Users, MapPin, Layers } from "lucide-react";
import { PricingCards } from "@/features/pricing/pricing-cards";
import { content, isLocale } from "@/content";
import { onboardingContent } from "@/content/onboarding";
import { annualDiscountPercent, getDevelopmentPlans } from "@/config/plans";
import { StartLink } from "@/components/marketing/start-link";
import { getPublicPlans } from "@/features/pricing/service";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import "@/features/home/home.css";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = content[locale];
  const title = `${c.nav[2]} — MemberFlow`;
  return {
    title,
    description: c.experience.pricing.intro,
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: { en: "/en/pricing", lv: "/lv/pricing", ru: "/ru/pricing" },
    },
    openGraph: {
      title,
      description: c.experience.pricing.intro,
      type: "website",
    },
  };
}
export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = content[locale],
    p = c.experience.pricing;
  const backendPlans = await getPublicPlans(locale);
  const plans = backendPlans.length
    ? backendPlans
    : getDevelopmentPlans(onboardingContent[locale]);
  return (
    <>
      <Header c={c} locale={locale} page="pricing" />
      <main id="main" className="pricing-page container">
        <div className="pricing-heading">
        <p className="eyebrow">
          <span className="status-dot" />
          {c.nav[2]}
        </p>
        <h1>{p.title}</h1>
        <p className="pricing-intro">{p.intro}</p>
        </div>
        <PricingCards
          plans={plans}
          locale={locale}
          copy={p}
          monthlyLabel={onboardingContent[locale].monthly}
          yearlyLabel={onboardingContent[locale].yearly}
          annualSaving={backendPlans.length ? null : onboardingContent[locale].yearlyDiscount.replace("{percent}", String(annualDiscountPercent))}
        />
        <section className="pricing-scope">
          <div className="pricing-scope-copy">
            <p className="eyebrow"><span className="status-dot" />MEMBERFLOW</p>
            <h2>{p.ctaTitle}</h2>
            <p>{p.ctaText}</p>
            <div className="pricing-actions">
              <StartLink label={p.tryFree} />
              <Link className="secondary-link" href={`/${locale}#product`}>
                {p.back}<ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="pricing-scope-details">
            <h3>{p.details}</h3>
            <div className="pricing-dimensions">
              <span><Users size={17} aria-hidden="true" />{p.customers}</span>
              <span><MapPin size={17} aria-hidden="true" />{p.locations}</span>
              <span><Layers size={17} aria-hidden="true" />{p.features}</span>
            </div>
            <p>{p.upgrade}</p>
          </div>
        </section>
      </main>
      <Footer c={c} locale={locale} page="pricing" />
    </>
  );
}
