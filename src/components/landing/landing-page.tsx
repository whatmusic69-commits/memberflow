'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowDownRight, Menu, Plus } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { growthContent, type GrowthContent, type GrowthLanguage } from '@/data/growth-content';
import legacyContent from '@/data/landing-content.json';
import { CampaignFlow } from './campaign-flow';
import { CreateSection, DistributionSection, AcquireSection, RetainSection, GrowthLoop, Solutions, FinalCTA } from './growth-sections';
import './landing.css';

const navTargets = ['#product', '#solutions', '#pricing', '#integrations', '#resources'];
export function LandingPage() {
  const [language, setLanguage] = useState<GrowthLanguage>('ru');
  useEffect(() => {
    const timeout = window.setTimeout(() => {const saved = window.localStorage.getItem('memberflow-language'); if (saved && saved in growthContent) setLanguage(saved as GrowthLanguage);}, 0);
    const onChange = (event: Event) => {const next = (event as CustomEvent<GrowthLanguage>).detail; if (next in growthContent) setLanguage(next);};
    window.addEventListener('memberflow-language-change', onChange);
    return () => {clearTimeout(timeout); window.removeEventListener('memberflow-language-change', onChange);};
  }, []);
  const t = growthContent[language];
  return <div className="mf-home" lang={language}><a className="mf-skip" href="#main">{t.skip}</a><LandingNavbar t={t}/><main id="main"><Hero t={t}/><div className="mf-intro mf-container"><span className="mf-label">THE MEMBERFLOW WAY</span><div><h2>{t.intro}</h2><p>{t.introText}</p></div><ArrowDownRight size={32}/></div><CreateSection t={t}/><DistributionSection t={t}/><AcquireSection t={t}/><RetainSection t={t}/><GrowthLoop t={t}/><Solutions t={t}/><Pricing t={t} language={language}/><section id="resources" className="mf-resources mf-container"><h2>{t.resources}</h2><div>{t.resourceLinks.map((label, i) => <a key={label} href={['/about','/demo','/contacts'][i]}>{label}<ArrowRight size={17}/></a>)}</div></section><FinalCTA t={t}/></main><LandingFooter t={t}/></div>;
}
function LandingNavbar({ t }: { t: GrowthContent }) {
  return <header className="mf-header mf-container"><BrandLogo size="sm"/><nav className="mf-desktop-nav" aria-label={t.menu}>{t.nav.map((label, i) => <a href={navTargets[i]} key={label}>{label}</a>)}</nav><div className="mf-header-actions"><a href="/login">{t.login}</a><a className="mf-button" href="/onboarding/business">{t.start}<ArrowRight size={15}/></a></div><details className="mf-mobile-nav"><summary aria-label={t.menu}><Menu size={24}/></summary><nav aria-label={t.menu}>{t.nav.map((label, i) => <a href={navTargets[i]} key={label} onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}>{label}</a>)}<a href="/login">{t.login}</a><a href="/onboarding/business">{t.start} →</a></nav></details></header>;
}
function Hero({ t }: { t: GrowthContent }) {
  return <section className="mf-hero mf-container"><div className="mf-hero-copy"><p className="mf-label"><span className="mf-dot"/>{t.label}</p><h1>{t.headline.map((line, i) => <span key={line}>{line.replace(/\.$/, '')}{line.endsWith('.') ? <em>.</em> : null}{i === 0 ? <span className="mf-headline-star" aria-hidden="true">✳</span> : null}</span>)}</h1><p className="mf-description">{t.description}</p><div className="mf-hero-actions"><a className="mf-button" href="/onboarding/business">{t.start}<ArrowRight size={18}/></a><a className="mf-text-link" href="#product"><span>↘</span>{t.watch}</a></div></div><CampaignFlow t={t}/><div className="mf-hero-baseline"><span className="mf-label">ONE INPUT. MORE POSSIBILITIES.</span><span>01 — 04 <ArrowDownRight size={16}/></span></div></section>;
}
function Pricing({ t, language }: { t: GrowthContent; language: GrowthLanguage }) {
  return <section id="pricing" className="mf-pricing mf-container"><p className="mf-label">MEMBERFLOW / {t.nav[2]}</p><h2>{t.pricingTitle}</h2><p className="mf-description">{t.pricingText}</p><div className="mf-plan-grid">{legacyContent[language].pricing.plans.map((plan, i) => <article className="mf-plan" key={plan.name}><div className="mf-plan-name"><h3>{plan.name}</h3>{i === 1 ? <Plus size={20}/> : <span>0{i+1}</span>}</div><p className="mf-plan-price">{plan.price}</p><ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul><a href="/onboarding/business">{t.start}<ArrowRight size={18}/></a></article>)}</div></section>;
}
function LandingFooter({ t }: { t: GrowthContent }) {
  return <footer className="mf-footer mf-container"><div><BrandLogo size="sm"/><p>{t.footer}</p></div><LanguageSwitcher compact className="mf-language"/><div className="mf-footer-bottom"><span>© 2026 MemberFlow. {t.copyright}</span><div><a href="/privacy">{t.privacy}</a><a href="/terms">{t.terms}</a></div></div></footer>;
}
