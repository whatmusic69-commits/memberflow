import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { content, isLocale, locales } from "@/content";
import { faqContent } from "@/content/faq";
import { publicSiteContent } from "@/content/public-site";
import { FAQItem } from "@/components/ui/faq-item";
import { PublicShell, PublicHeading, publicMetadata } from "@/features/public-site/shell";
export function generateStaticParams() {
  return locales.map(locale => ({locale}));
}
export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isLocale(locale)) notFound();
  const c = faqContent[locale];
  return publicMetadata(locale, "faq", c.nav, c.description);
}
export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isLocale(locale)) notFound();
  const c = faqContent[locale];
  const groups = [
    {id:"basics", title:c.groups[0], questions:c.basics},
    {id:"customers", title:c.groups[1], questions:content[locale].experience.faq},
    {id:"plans", title:c.groups[2], questions:publicSiteContent[locale].pricingFaq.map(([question,answer])=>({question,answer}))},
  ];
  return <PublicShell locale={locale} page="faq">
    <PublicHeading label={c.nav} title={c.title} intro={c.intro} />
    <div className="faq-page-layout">
      <nav className="faq-page-topics" aria-label={c.nav}>{groups.map(group=><a key={group.id} href={`#faq-${group.id}`}>{group.title}<ArrowRight size={14} aria-hidden="true" /></a>)}</nav>
      <div>{groups.map(group=><section key={group.id} className="public-faq faq-page-group" id={`faq-${group.id}`} aria-labelledby={`faq-${group.id}-title`}><h2 id={`faq-${group.id}-title`}>{group.title}</h2>{group.questions.map(item=><FAQItem key={item.question} question={item.question} answer={item.answer} />)}</section>)}</div>
    </div>
    <section className="faq-page-help"><div><h2>{c.helpTitle}</h2><p>{c.helpText}</p></div><div><Link href={`/${locale}/help`} className="button button-primary">{c.help}<ArrowRight size={15} aria-hidden="true" /></Link><Link href={`/${locale}/pricing`} className="secondary-link">{c.pricing}<ArrowRight size={14} aria-hidden="true" /></Link></div></section>
  </PublicShell>;
}
