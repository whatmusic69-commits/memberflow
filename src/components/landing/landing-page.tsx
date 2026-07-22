"use client";

import { ArrowRight, BarChart3, BellRing, CalendarCheck, Check, ChevronRight, Clock, Gift, History, Menu, MousePointerClick, QrCode, Repeat2, Sparkles, Tag, UserRound, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import content from "@/data/landing-content.json";
import { BrandLogo } from "@/components/ui/brand-logo";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { QrCode as RealQrCode } from "@/components/ui/qr-code";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

type LanguageCode = keyof typeof content;
type LandingContent = (typeof content)["ru"];

const moduleIcons = [Gift, Tag, CalendarCheck, WalletCards, History, QrCode];
const salesIcons = [Tag, Sparkles, WalletCards, Repeat2, Clock, CalendarCheck, Gift, BellRing];

export function LandingPage() {
  const [language, setLanguage] = useState<LanguageCode>("ru");
  const t = content[language] as LandingContent;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = window.localStorage.getItem("memberflow-language") as LanguageCode | null;
      if (saved && saved in content) setLanguage(saved);
    }, 0);
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<LanguageCode>).detail;
      if (next && next in content) setLanguage(next);
    };
    window.addEventListener("memberflow-language-change", onChange);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("memberflow-language-change", onChange);
    };
  }, []);

  return (
    <main className="overflow-hidden bg-[var(--background)]">
      <LandingNavbar t={t} />
      <HeroSection t={t} />
      <Section id="product">
        <ScrollReveal>
          <SectionHeading title={t.modules.title} text={t.modules.text} />
          <ModuleGrid t={t} />
        </ScrollReveal>
      </Section>
      <Section id="journey">
        <ScrollReveal>
          <JourneySection t={t} />
        </ScrollReveal>
      </Section>
      <Section>
        <ScrollReveal>
          <ClientAppSection t={t} />
        </ScrollReveal>
      </Section>
      <Section id="automations">
        <ScrollReveal>
          <AutomationsSection t={t} />
        </ScrollReveal>
      </Section>
      <Section>
        <ScrollReveal>
          <SalesSection t={t} />
        </ScrollReveal>
      </Section>
      <Section id="analytics" className="px-4 sm:px-6">
        <ScrollReveal>
          <AnalyticsSection t={t} />
        </ScrollReveal>
      </Section>
      <Section id="business">
        <ScrollReveal>
          <UseCasesSection t={t} />
        </ScrollReveal>
      </Section>
      <Section id="pricing">
        <ScrollReveal>
          <PricingSection t={t} />
        </ScrollReveal>
      </Section>
      <Section id="faq">
        <ScrollReveal>
          <FaqSection t={t} />
        </ScrollReveal>
      </Section>
      <FinalCta t={t} />
      <LandingFooter t={t} />
    </main>
  );
}

function LandingNavbar({ t }: { t: LandingContent }) {
  const links = [
    ["#product", t.nav.product],
    ["#journey", t.nav.clientJourney],
    ["#automations", t.nav.automations],
    ["#pricing", t.nav.pricing],
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-[#F4F5F9]/78 shadow-[0_1px_0_rgba(18,19,32,0.03)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BrandLogo size="sm" />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
          {links.map(([href, label]) => <a key={href} href={href} className="transition hover:text-[var(--foreground)]">{label}</a>)}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <LanguageSwitcher />
          <LinkButton href="/login" variant="secondary">{t.nav.login}</LinkButton>
          <LinkButton href="/onboarding/business">{t.nav.cta}</LinkButton>
        </div>
        <details className="relative sm:hidden">
          <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-xl bg-white shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)] [&::-webkit-details-marker]:hidden"><Menu className="h-5 w-5" /></summary>
          <div className="absolute right-0 top-12 z-50 w-72 rounded-3xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-lg)]">
            {links.map(([href, label]) => <a key={href} href={href} className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{label}</a>)}
            <div className="mt-2 grid gap-2"><LanguageSwitcher /><LinkButton href="/login" variant="secondary">{t.nav.login}</LinkButton><LinkButton href="/onboarding/business">{t.nav.cta}</LinkButton></div>
          </div>
        </details>
      </div>
    </header>
  );
}

function HeroSection({ t }: { t: LandingContent }) {
  return (
    <section className="grain relative min-h-[calc(100vh-4rem)]">
      <div className="hero-grid-bg" />
      <div className="absolute -right-32 top-20 h-[560px] w-[560px] rounded-full bg-[var(--primary-glow)] blur-3xl" />
      <div className="absolute -bottom-28 left-0 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.88fr] lg:py-12">
        <div className="animate-fade-up max-w-3xl">
          <SectionBadge>{t.hero.badge}</SectionBadge>
          <h1 className="mt-6 text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">{t.hero.title}</h1>
          <p className="mt-6 max-w-[640px] text-lg leading-8 text-[var(--muted-foreground)]">{t.hero.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/onboarding/business" className="h-12 px-6">{t.hero.primaryCta}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></LinkButton>
            <LinkButton href="/customer/cards" variant="secondary" className="h-12 px-6"><MousePointerClick className="h-4 w-4" />{t.hero.secondaryCta}</LinkButton>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium text-slate-600">{t.hero.benefits.map((item) => <span key={item} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[var(--success)]" />{item}</span>)}</div>
        </div>
        <CustomerPortalPreview t={t} />
      </div>
      <div className="hero-transition-bg" />
    </section>
  );
}

function CustomerPortalPreview({ t }: { t: LandingContent }) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[420px] lg:max-w-[500px]">
      <div className="absolute inset-8 rounded-[44px] bg-[var(--primary-glow)] blur-3xl" />
      <div className="relative mx-auto overflow-hidden rounded-[42px] border border-white/70 bg-[#111320] p-3 shadow-[0_38px_100px_rgba(12,13,22,0.3)]">
        <div className="rounded-[34px] bg-[#F7F7FB] p-4">
          <div className="rounded-[28px] p-4 text-white shadow-[var(--shadow-md)]" style={{ background: "linear-gradient(145deg,#121320,#6D5DFB)" }}>
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 font-bold">W</span>
              <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold">Powered by MemberFlow</span>
            </div>
            <p className="mt-7 text-sm text-violet-100">{t.hero.preview.business}</p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight">{t.hero.preview.greeting}</h2>
          </div>
          <div className="mt-4 rounded-[24px] bg-white p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Loyalty</p><p className="mt-1 text-xl font-semibold">{t.hero.preview.progress}</p></div>
              <Gift className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-2 w-2/3 rounded-full bg-[var(--primary)]" /></div>
            <p className="mt-3 text-sm font-semibold text-slate-600">{t.hero.preview.reward}</p>
          </div>
          <div className="mt-3 rounded-[24px] bg-[#FBF8F1] p-4 shadow-[var(--shadow-sm)]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-600">{t.hero.preview.offer}</p>
            <p className="mt-1 text-sm font-semibold text-[#121320]">{t.hero.preview.offerText}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button className="rounded-2xl bg-[var(--primary)] px-3 py-3 text-sm font-bold text-white">{t.hero.preview.booking}</button>
            <button className="rounded-2xl bg-[#121320] px-3 py-3 text-sm font-bold text-white">{t.hero.preview.wallet}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) {
  return <section id={id} className={cn("mx-auto max-w-7xl px-4 py-14 sm:px-6", className)}>{children}</section>;
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] shadow-[var(--shadow-sm)] backdrop-blur"><span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_0_5px_rgba(32,180,134,0.14)]" />{children}</span>;
}

function SectionHeading({ eyebrow, title, text, dark = false }: { eyebrow?: string; title: string; text?: string; dark?: boolean }) {
  return <div className="mx-auto mb-8 max-w-3xl text-center">{eyebrow ? <p className={cn("mb-3 text-xs font-bold uppercase tracking-[0.18em]", dark ? "text-violet-200" : "text-[var(--primary)]")}>{eyebrow}</p> : null}<h2 className={cn("text-3xl font-semibold tracking-tight sm:text-4xl", dark && "text-white")}>{title}</h2>{text ? <p className={cn("mt-3 text-base", dark ? "text-slate-300" : "text-[var(--muted-foreground)]")}>{text}</p> : null}</div>;
}

function ModuleGrid({ t }: { t: LandingContent }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{t.modules.items.map((item, index) => {
    const Icon = moduleIcons[index] ?? Sparkles;
    return <Card key={item.title} className="group p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.text}</p></Card>;
  })}</div>;
}

function JourneySection({ t }: { t: LandingContent }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div><SectionHeading title={t.journey.title} text={t.journey.text} /></div>
      <div className="space-y-3">{t.journey.steps.map((step, index) => <div key={step} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#121320] text-sm font-bold text-white">{index + 1}</span><p className="text-sm font-semibold leading-6 text-slate-700">{step}</p></div>)}</div>
    </div>
  );
}

function ClientAppSection({ t }: { t: LandingContent }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <SectionHeading eyebrow={t.clientApp.eyebrow} title={t.clientApp.title} text={t.clientApp.text} />
        <div className="flex flex-wrap justify-center gap-2 lg:justify-start">{t.clientApp.tabs.map((tab) => <span key={tab} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)]">{tab}</span>)}</div>
      </div>
      <Card className="overflow-hidden bg-white p-4 shadow-[var(--shadow-lg)]">
        <div className="rounded-[28px] bg-[#121320] p-5 text-white">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-200">{t.clientApp.screen.status}</p><h3 className="mt-1 text-2xl font-semibold">{t.clientApp.screen.name}</h3></div><RealQrCode label="" value="memberflow:customer:mfp_c_8f3k29x7" size={76} /></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ClientMetric label={t.clientApp.screen.visit} value={t.clientApp.screen.visitValue} />
            <ClientMetric label={t.clientApp.screen.reward} value={t.clientApp.screen.rewardValue} />
            <ClientMetric label={t.clientApp.screen.membership} value={t.clientApp.screen.membershipValue} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ClientMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><p className="text-xs text-violet-100">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}

function AutomationsSection({ t }: { t: LandingContent }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
      <div>
        <SectionHeading title={t.automations.title} text={t.automations.text} />
        <div className="grid gap-3 sm:grid-cols-2">{t.automations.scenarios.map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm font-semibold shadow-[var(--shadow-sm)]"><BellRing className="h-4 w-4 text-[var(--primary)]" />{item}</div>)}</div>
      </div>
      <Card className="relative overflow-hidden bg-[#121320] p-6 text-white shadow-[var(--shadow-lg)]">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[var(--primary)]/35 blur-3xl" />
        <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Automation result</p>
        <h3 className="relative mt-4 text-3xl font-semibold tracking-tight">{t.automations.example.title}</h3>
        <p className="relative mt-3 text-sm leading-6 text-slate-300">{t.automations.example.text}</p>
        <p className="relative mt-6 inline-flex rounded-full bg-emerald-400/14 px-4 py-2 text-sm font-bold text-emerald-200">{t.automations.example.metric}</p>
      </Card>
    </div>
  );
}

function SalesSection({ t }: { t: LandingContent }) {
  return <div><SectionHeading title={t.sales.title} text={t.sales.text} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{t.sales.items.map((item, index) => {
    const Icon = salesIcons[index] ?? Sparkles;
    return <div key={item} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)]"><Icon className="h-5 w-5 text-[var(--primary)]" /><p className="mt-3 text-sm font-semibold">{item}</p></div>;
  })}</div></div>;
}

function AnalyticsSection({ t }: { t: LandingContent }) {
  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="absolute inset-8 rounded-[40px] bg-[var(--primary-glow)] blur-3xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[var(--shadow-lg)] lg:-rotate-1">
        <div className="flex h-11 items-center gap-2 border-b border-slate-100 bg-slate-50 px-4"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" /><span className="ml-4 rounded-full bg-white px-4 py-1 text-xs text-slate-500">memberflow.app/dashboard</span></div>
        <div className="grid min-h-[380px] bg-[#F4F5F9] md:grid-cols-[190px_1fr]">
          <div className="hidden bg-[#0C0D16] p-4 text-white md:block"><BrandLogo compact className="text-white" /><div className="mt-8 space-y-2">{["Overview","Customers","Automations","Analytics"].map((item, i) => <div key={item} className={cn("rounded-xl px-3 py-2 text-sm", i === 0 ? "bg-white text-[#121320]" : "text-slate-400")}>{item}</div>)}</div></div>
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">{t.analytics.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{t.analytics.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{t.analytics.text}</p>
            <div className="mt-5 rounded-[26px] bg-[#121320] p-5 text-white"><p className="text-2xl font-semibold">{t.analytics.mainMetric}</p><p className="mt-2 text-emerald-300">{t.analytics.revenue}</p></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{t.analytics.metrics.map((metric) => <div key={metric} className="rounded-2xl bg-white p-4 text-sm font-semibold shadow-[var(--shadow-sm)]"><BarChart3 className="mb-3 h-5 w-5 text-[var(--primary)]" />{metric}</div>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UseCasesSection({ t }: { t: LandingContent }) {
  return <div><SectionHeading title={t.useCases.title} text={t.useCases.text} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{t.useCases.items.map((item) => <Card key={item.business} className="p-5"><UserRound className="h-5 w-5 text-[var(--primary)]" /><h3 className="mt-4 text-lg font-semibold">{item.business}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p></Card>)}</div></div>;
}

function PricingSection({ t }: { t: LandingContent }) {
  return (
    <div>
      <SectionHeading title={t.pricing.title} text={t.pricing.text} />
      <div className="grid gap-5 lg:grid-cols-3">{t.pricing.plans.map((plan, index) => <Card key={plan.name} className={cn("flex min-h-[430px] flex-col rounded-[28px] p-6 shadow-[var(--shadow-md)]", index === 1 && "bg-[#121320] text-white")}>
        <p className={cn("text-xs font-bold uppercase tracking-[0.18em]", index === 1 ? "text-violet-200" : "text-[var(--primary)]")}>{plan.label}</p>
        <h3 className="mt-3 text-2xl font-semibold">{plan.name}</h3>
        <p className="mt-4 text-3xl font-semibold tracking-tight">{plan.price}</p>
        <ul className={cn("mt-6 space-y-3 text-sm", index === 1 ? "text-slate-300" : "text-slate-700")}>{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />{feature}</li>)}</ul>
        <LinkButton href={`/register?product=complete&plan=${index === 0 ? "solo" : index === 1 ? "business" : "network"}`} variant={index === 1 ? "primary" : "secondary"} className="mt-auto w-full">{plan.name}</LinkButton>
      </Card>)}</div>
      <p className="mt-5 rounded-2xl bg-white/80 p-4 text-sm text-slate-500 shadow-[var(--shadow-sm)]">{t.pricing.note}</p>
    </div>
  );
}

function FaqSection({ t }: { t: LandingContent }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? t.faq.items : t.faq.items.slice(0, 7);
  return (
    <div>
      <SectionHeading title={t.faq.title} text={t.faq.text} />
      <div className="mx-auto max-w-4xl divide-y divide-slate-200 overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        {visibleItems.map((item, index) => {
          const isOpen = openIndex === index;
          return <div key={item.question}><button className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-[var(--foreground)] transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[var(--primary)] sm:px-6 sm:py-5 sm:text-base" onClick={() => setOpenIndex(isOpen ? -1 : index)}><span>{item.question}</span><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">{isOpen ? "−" : "+"}</span></button><div className={cn("grid transition-all duration-200", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}><div className="overflow-hidden"><p className="px-4 pb-4 text-sm leading-6 text-[var(--muted-foreground)] sm:px-6 sm:pb-5">{item.answer}</p></div></div></div>;
        })}
      </div>
      {!showAll ? <div className="mt-5 text-center"><button className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[var(--foreground)] ring-1 ring-[var(--border)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]" onClick={() => setShowAll(true)}>{t.faq.more}</button></div> : null}
    </div>
  );
}

function FinalCta({ t }: { t: LandingContent }) {
  return (
    <section className="relative overflow-hidden bg-[#0C0D16] px-4 py-16 text-center text-white">
      <ScrollReveal>
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--primary)]/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl"><h2 className="text-3xl font-semibold">{t.cta.title}</h2><p className="mt-3 text-slate-300">{t.cta.text}</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><LinkButton href="/onboarding/business">{t.cta.primary}<ChevronRight className="h-4 w-4" /></LinkButton><LinkButton href="/customer/cards" variant="secondary">{t.cta.secondary}</LinkButton></div></div>
      </ScrollReveal>
    </section>
  );
}

function LandingFooter({ t }: { t: LandingContent }) {
  return (
    <footer className="border-t border-[var(--border)] bg-white/75 px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div><BrandLogo /><p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">{t.footer.text}</p><p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{t.footer.tagline}</p></div>
        <FooterColumn title={t.nav.product} links={[[t.nav.product, "/#product"], [t.nav.clientJourney, "/#journey"], [t.nav.automations, "/#automations"], [t.nav.pricing, "/#pricing"]]} />
        <FooterColumn title="Company" links={[["About", "/about"], ["Contacts", "/contacts"], ["Demo", "/demo"], [t.nav.login, "/login"]]} />
        <FooterColumn title="Docs" links={[["Privacy", "/privacy"], ["Terms", "/terms"], ["Stripe", "/dashboard/stripe"], ["Dashboard", "/dashboard"]]} />
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-3 border-t border-slate-100 pt-5 text-xs text-slate-500 sm:flex-row"><span>© 2026 MemberFlow. All rights reserved.</span><span>{t.footer.bottom}</span></div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return <div><h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3><div className="mt-3 space-y-2">{links.map(([label, href]) => <a key={href} href={href} className="block text-sm text-slate-500 transition hover:text-[var(--primary)]">{label}</a>)}</div></div>;
}
