import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content, isLocale, locales } from "@/content";
import { aboutContent } from "@/content/about";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { MotionController } from "@/components/marketing/motion-controller";
import { AboutStory } from "@/features/about/about-page";
import "@/features/home/home.css";
import "@/features/about/about.css";

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
  const { title, description } = aboutContent[locale].seo;
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/about`,
      languages: { en: "/en/about", lv: "/lv/about", ru: "/ru/about" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "lv" ? "lv_LV" : locale === "ru" ? "ru_RU" : "en_US",
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <div id="top" aria-hidden="true" />
      <MotionController />
      <Header c={content[locale]} locale={locale} page="about" />
      <AboutStory c={aboutContent[locale]} />
      <Footer c={content[locale]} locale={locale} page="about" />
    </>
  );
}
