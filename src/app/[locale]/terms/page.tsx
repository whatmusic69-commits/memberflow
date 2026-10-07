import { locales } from "@/content";
import {
  LegalDocument,
  legalMetadata,
} from "@/components/legal/legal-document";
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return legalMetadata(locale, "terms");
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalDocument locale={locale} document="terms" />;
}
