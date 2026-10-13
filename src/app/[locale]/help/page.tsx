import { notFound } from "next/navigation";
import { isLocale, locales } from "@/content";
import { publicSiteContent, helpArticles } from "@/content/public-site";
import {
  PublicShell,
  PublicHeading,
  publicMetadata,
} from "@/features/public-site/shell";
import { HelpSearch } from "@/features/public-site/help-search";
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
  return publicMetadata(locale, "help", c.helpTitle, c.helpIntro);
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
    <PublicShell locale={locale} page="help">
      <PublicHeading label={c.nav[2]} title={c.helpTitle} intro={c.helpIntro} />
      <HelpSearch articles={helpArticles[locale]} c={c} locale={locale} />
    </PublicShell>
  );
}
