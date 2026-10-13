import { notFound } from "next/navigation";
import { isLocale, locales } from "@/content";
import { publicSiteContent } from "@/content/public-site";
import {
  PublicShell,
  PublicHeading,
  publicMetadata,
} from "@/features/public-site/shell";
import { IntegrationsOverview } from "@/features/public-site/integrations";
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
    "integrations",
    c.integrationTitle,
    c.integrationIntro,
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
    <PublicShell locale={locale} page="integrations">
      <PublicHeading
        label={c.nav[1]}
        title={c.integrationTitle}
        intro={c.integrationIntro}
      />
      <IntegrationsOverview locale={locale} />
    </PublicShell>
  );
}
