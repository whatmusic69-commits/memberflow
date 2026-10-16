import Link from "next/link";
import { contactContent } from "@/content/contact";
import { faqContent } from "@/content/faq";
import { landingContent, landingUI } from "@/content/landing-pages";
import { HomeLink } from "@/components/ui/home-link";
import { helpNavigationLabel, type MarketingPage } from "@/content/public-site/navigation";
import type { HomeContent } from "@/content/types";
import { locales, type Locale } from "@/content";
import { Wordmark } from "@/components/ui/brand";
import { StartLink } from "./start-link";
import "./footer.css";
export function Footer({c,locale,page}:{c:HomeContent;locale:Locale;page?:MarketingPage}) {
 const ui=landingUI[locale],landing=landingContent[locale];
 const groups=[
  {title:c.nav[0],links:[
   ["product",ui.overview],
   ["features/digital-loyalty-cards",landing["features/digital-loyalty-cards"].label],
   ["features/qr-code-loyalty",landing["features/qr-code-loyalty"].label],
   ["product#customer-retention",ui.retention],["pricing",c.nav[2]],["integrations",c.nav[3]],
  ]},
  {title:c.nav[1],links:[
   ["solutions/coffee-shops",landing["solutions/coffee-shops"].label],
   ["solutions/beauty-salons",landing["solutions/beauty-salons"].label],
   ["solutions#industry-0",ui.restaurants],["solutions#industry-2",ui.fitness],
  ]},
  {title:ui.resources,links:[["product#customer-journey",ui.how],["help",helpNavigationLabel[locale]],["faq",faqContent[locale].nav]]},
  {title:c.company,links:[["about",c.about],["contact",contactContent[locale].nav]]},
 ];
 return <footer className="site-footer"><div className="container">
  <div className="footer-top">
   <div className="footer-brand"><HomeLink locale={locale}><Wordmark/></HomeLink><p>{ui.tagline}</p><StartLink label={c.start}/></div>
   {groups.map(group=><nav key={group.title} aria-label={group.title}><strong>{group.title}</strong>{group.links.map(([path,label])=><Link key={path} href={`/${locale}/${path}`} aria-current={path===page?"page":undefined}>{label}</Link>)}</nav>)}
  </div>
  <div className="footer-bottom">
   <span>© {new Date().getFullYear()} MemberFlow</span>
   <nav className="footer-legal" aria-label={c.legal}><Link href={`/${locale}/privacy`}>{c.privacy}</Link><Link href={`/${locale}/terms`}>{c.terms}</Link></nav>
   <nav className="footer-languages" aria-label={c.language}>{locales.map(language=><Link key={language} href={`/${language}${page?`/${page}`:""}`} scroll={false} data-preserve-scroll lang={language} aria-current={language===locale?"page":undefined}>{language.toUpperCase()}</Link>)}</nav>
  </div>
 </div></footer>;
}
