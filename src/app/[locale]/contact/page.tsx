import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles, Compass, Link2 } from "lucide-react";
import { isLocale, locales } from "@/content";
import { contactContent } from "@/content/contact";
import { ContactForm } from "@/features/contact/contact-form";
import { PublicShell, PublicHeading, publicMetadata } from "@/features/public-site/shell";
export function generateStaticParams() {return locales.map(locale=>({locale}));}
export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isLocale(locale)) notFound();
  const c = contactContent[locale];
  return publicMetadata(locale,"contact",c.nav,c.description);
}
export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isLocale(locale)) notFound();
  const c = contactContent[locale];
  const configuredEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const recipient = configuredEmail && /^[^\s@?&]+@[^\s@?&]+\.[^\s@?&]+$/.test(configuredEmail) ? configuredEmail : null;
  const icons = [Sparkles, Compass, Link2];
  return <PublicShell locale={locale} page="contact">
    <PublicHeading label={c.nav} title={c.title} intro={c.intro} />
    <div className="contact-page-layout"><div className="contact-page-context"><h2>{c.topicsTitle}</h2><div className="contact-topics">{c.topicDescriptions.map((description,index)=>{const Icon = icons[index];return <article key={description}><Icon size={19} aria-hidden="true" /><div><h3>{c.topics[index]}</h3><p>{description}</p></div></article>;})}</div><aside className="contact-help"><h3>{c.helpTitle}</h3><p>{c.helpText}</p><Link href={`/${locale}/faq`}>{c.faq}<ArrowRight size={14} aria-hidden="true" /></Link><Link href={`/${locale}/help`}>{c.help}<ArrowRight size={14} aria-hidden="true" /></Link></aside></div><ContactForm locale={locale} recipient={recipient} /></div>
  </PublicShell>;
}
