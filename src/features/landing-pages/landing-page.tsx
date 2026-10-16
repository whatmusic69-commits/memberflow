import Link from "next/link";
import { ArrowRight, Coffee, Sparkles, Ticket } from "lucide-react";
import { content, type Locale } from "@/content";
import { landingContent, landingPaths, landingUI, type LandingPath } from "@/content/landing-pages";
import { customerPageContent } from "@/content/customer-page";
import { marketingLoyalty } from "@/data/demo/home";
import { publicSiteOrigin } from "@/config/public-site";
import { PublicShell } from "@/features/public-site/shell";
import { StartLink } from "@/components/marketing/start-link";
import { FAQItem } from "@/components/ui/faq-item";
import { ProgrammeCard } from "@/components/customer/programme-card";
import { LoyaltyProgress } from "@/components/customer/loyalty-progress";
import { CustomerPagePreview } from "@/features/home/customer-page-preview";
import { StaffStory } from "@/features/home/staff-demo";
import { BusinessDemoQr } from "@/features/product/business-demo-qr";
import "./landing-page.css";

export function LandingPage({locale,path}:{locale:Locale;path:LandingPath}) {
 const p=landingContent[locale][path],c=content[locale],ui=landingUI[locale];
 const coffee=path==="solutions/coffee-shops",beauty=path==="solutions/beauty-salons",digital=path==="features/digital-loyalty-cards",qr=path==="features/qr-code-loyalty";
 const parent=path.startsWith("solutions/")?"solutions":"product";
 const breadcrumbs = {
  "@context":"https://schema.org", "@type":"BreadcrumbList",
  itemListElement:[{name:ui.home,path:""},{name:parent==="solutions"?c.nav[1]:ui.features,path:parent},{name:p.label,path}].map((item,i)=>({"@type":"ListItem",position:i+1,name:item.name,item:`${publicSiteOrigin}/${locale}${item.path?`/${item.path}`:""}`})),
 };
 const steps=<ol className={`seo-steps ${beauty?"seo-offer-scenarios":""}`}>{p.steps.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol>;
 return <PublicShell locale={locale} page={path}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbs).replace(/</g,"\\u003c")}}/>
  <nav className="help-breadcrumbs" aria-label={ui.home}><Link href={`/${locale}`}>{ui.home}</Link><span aria-hidden="true">/</span><Link href={`/${locale}/${parent}`}>{parent==="solutions"?c.nav[1]:ui.features}</Link><span aria-hidden="true">/</span><span aria-current="page">{p.label}</span></nav>
  <section className={`seo-hero seo-hero-${coffee?"coffee":beauty?"beauty":digital?"digital":"qr"}`}>
   <header className="public-heading"><p className="eyebrow"><span className="status-dot"/>{p.label}</p><h1>{p.title}</h1><p>{p.intro}</p><div className="seo-actions"><StartLink label={c.heroStart}/><Link className="secondary-link" href={`/${locale}/pricing`}>{c.nav[2]}<ArrowRight size={15} aria-hidden="true"/></Link></div></header>
   <div className="seo-hero-visual">
    {coffee && <div className="seo-coffee-card"><ProgrammeCard business="Your Coffee" label={c.retention[0]} title={c.connect[6]}><LoyaltyProgress loyalty={marketingLoyalty} progressLabel={customerPageContent[locale].progress}/></ProgrammeCard><div className="seo-counter-qr"><BusinessDemoQr locale={locale} label={ui.businessQR}/><span><Coffee size={20} aria-hidden="true"/>{ui.businessQR}</span></div></div>}
    {beauty && <div className="seo-salon-card"><ProgrammeCard business={ui.salon} label={ui.profile} title={ui.client} icon={<Sparkles size={17} aria-hidden="true"/>}><div className="seo-client-visit"><span>{ui.visit}</span><strong>{ui.pause}</strong></div></ProgrammeCard><div className="seo-return-offer"><Ticket size={22} aria-hidden="true"/><div><small>{ui.offer}</small><p>{ui.offerText}</p></div></div></div>}
    {digital && <CustomerPagePreview c={c} locale={locale}/>}
    {qr && <div className="seo-qr-pair">{(["business","scanner"] as const).map((variant,i)=><div key={variant}><span>0{i+1}</span><h2>{i===0?ui.businessQR:ui.personalQR}</h2><BusinessDemoQr locale={locale} variant={variant} label={i===0?ui.businessQR:ui.personalQR}/><p>{i===0?p.steps[0]:p.steps[3]}</p></div>)}</div>}
    <p className="seo-demo-note">{qr?ui.qrNote:c.experience.why.example}</p>
   </div>
  </section>
  <section className={`seo-problem ${beauty?"seo-problem-editorial":""}`}><h2>{p.problemTitle}</h2><p>{p.problem}</p></section>
  <section className={`seo-scenario ${coffee||qr?"seo-scenario-split":""}`}><div><h2>{p.scenarioTitle}</h2>{steps}</div>{coffee && <CustomerPagePreview c={c} locale={locale}/>} {qr && <StaffStory c={c} locale={locale}/>}</section>
  <section className={`seo-benefits ${digital?"seo-benefits-paper":""}`}><h2>{p.benefitTitle}</h2><div>{p.benefits.map(benefit=><article key={benefit.title}><h3>{benefit.title}</h3><p>{benefit.text}</p></article>)}</div>{digital && <p className="seo-demo-note">{ui.wallet} <Link href={`/${locale}/integrations`}>{c.nav[3]} ↗</Link></p>}</section>
  <section className="public-faq seo-faq"><h2>{c.experience.faqTitle}</h2>{p.faq.map(item=><FAQItem key={item.question} question={item.question} answer={item.answer}/>)}</section>
  <section className="seo-related"><h2>{ui.related}</h2><nav aria-label={ui.related}>{landingPaths.filter(other=>other!==path).map(other=><Link key={other} href={`/${locale}/${other}`}>{landingContent[locale][other].label}<ArrowRight size={14} aria-hidden="true"/></Link>)}<Link href={`/${locale}/product`}>{c.nav[0]}<ArrowRight size={14} aria-hidden="true"/></Link></nav></section>
  <section className="seo-final"><h2>{p.final}</h2><p>{p.finalText}</p><div className="seo-actions"><StartLink label={c.heroStart}/><Link className="secondary-link" href={`/${locale}/pricing`}>{c.nav[2]}<ArrowRight size={15} aria-hidden="true"/></Link></div></section>
 </PublicShell>;
}
