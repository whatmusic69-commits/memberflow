import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { content, isLocale } from "@/content";
import { legalContent } from "@/content/legal";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
export type LegalDocumentType = "terms" | "privacy";
export function legalMetadata(
  locale: string,
  document: LegalDocumentType,
): Metadata {
  if (!isLocale(locale)) notFound();
  return {
    title: `${legalContent[locale][document]} — MemberFlow`,
    robots: { index: false, follow: true },
  };
}
export function LegalDocument({
  locale,
  document,
}: {
  locale: string;
  document: LegalDocumentType;
}) {
  if (!isLocale(locale)) notFound();
  const c = content[locale];
  return (
    <>
      <div id="top" aria-hidden="true" />
      <Header c={c} locale={locale} page={document} />
      <main id="main" className="legal-document container">
        <h1>{legalContent[locale][document]}</h1>
      </main>
      <Footer c={c} locale={locale} page={document} />
    </>
  );
}
