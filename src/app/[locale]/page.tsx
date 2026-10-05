import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, isLocale, content } from "@/content";
import { MotionController } from "@/components/marketing/motion-controller";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { Hero } from "@/features/home/hero";
import { Story } from "@/features/home/story";
import { GrowthLoop, Solutions, FinalCTA } from "@/features/home/closing";
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return {
    title: content[locale].seo,
    description: content[locale].intro,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", lv: "/lv", ru: "/ru" },
    },
    openGraph: {
      title: content[locale].seo,
      description: content[locale].intro,
      type: "website",
      locale: locale === "lv" ? "lv_LV" : locale === "ru" ? "ru_RU" : "en_US",
    },
  };
}
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = content[locale];
  return (
    <>
      <div id="top" aria-hidden="true" />
      <MotionController />
      <Header c={c} locale={locale} />
      <main id="main">
        <Hero c={c} />
        <Story c={c} />
        <GrowthLoop c={c} />
        <Solutions c={c} />
        <FinalCTA c={c} />
      </main>
      <Footer c={c} locale={locale} />
    </>
  );
}
