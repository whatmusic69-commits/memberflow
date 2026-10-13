import { notFound } from "next/navigation";
import { isLocale, locales } from "@/content";
import { publicSiteContent } from "@/content/public-site";
import {
  PublicShell,
  PublicHeading,
  PublicCTA,
  publicMetadata,
} from "@/features/public-site/shell";
import { SolutionsExplorer } from "@/features/public-site/solutions";
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = publicSiteContent[locale];
  return publicMetadata(
    locale,
    "solutions",
    c.solutionsTitle,
    c.solutionsIntro,
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = publicSiteContent[locale];
  return (
    <PublicShell locale={locale} page="solutions">
      <PublicHeading
        label={c.nav[0]}
        title={c.solutionsTitle}
        intro={c.solutionsIntro}
      />
      <SolutionsExplorer c={c} />
      <PublicCTA locale={locale} />
    </PublicShell>
  );
}
