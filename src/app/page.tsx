import { LinkButton } from "@/components/ui/button";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { BrowserMockup, HeroContent, HeroProductPreview, IndustryStrip, ProcessDemo, ProgramShowcase, SectionHeading, SiteFooter, SiteNavbar } from "@/components/ui/marketing";
import { PricingPlans } from "@/components/ui/pricing-plans";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function Home() {
  return (
    <main className="overflow-hidden bg-[var(--background)]">
      <SiteNavbar />
      <section className="grain relative min-h-[calc(100vh-4rem)]">
        <div className="hero-grid-bg" />
        <div className="absolute -right-32 top-20 h-[560px] w-[560px] rounded-full bg-[var(--primary-glow)] blur-3xl" />
        <div className="absolute -bottom-28 left-0 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.86fr] lg:py-12">
          <HeroContent />
          <HeroProductPreview />
        </div>
        <div className="hero-transition-bg" />
      </section>

      <section id="features" className="relative mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <ScrollReveal>
          <SectionHeading title="Два способа возвращать клиентов" text="Запустите платную подписку, бесплатную карту лояльности или используйте обе программы одновременно." />
          <ProgramShowcase />
        </ScrollReveal>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <ScrollReveal>
          <SectionHeading eyebrow="Product flow" title="От настройки до сканирования" text="Путь запуска: программа, QR-карта клиента, операция у сотрудника." />
          <ProcessDemo />
        </ScrollReveal>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <ScrollReveal>
          <SectionHeading eyebrow="Business cockpit" title="Кабинет, который показывает деньги и действия" text="Dashboard, программы, клиенты и scanner выглядят как единый операционный центр." />
          <BrowserMockup />
        </ScrollReveal>
      </section>

      <ScrollReveal>
        <IndustryStrip />
      </ScrollReveal>

      <section id="pricing" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <ScrollReveal>
          <SectionHeading title="Тарифы для любого масштаба" text="Начните с €25 в месяц. Стоимость зависит от количества точек, сотрудников и активных клиентов." />
          <PricingPlans />
        </ScrollReveal>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <ScrollReveal>
          <SectionHeading title="Частые вопросы" text="Всё, что нужно знать перед запуском программы." />
          <FaqAccordion />
        </ScrollReveal>
      </section>

      <section className="relative overflow-hidden bg-[#0C0D16] px-4 py-16 text-center text-white">
        <ScrollReveal>
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--primary)]/30 blur-3xl" />
          <div className="relative"><h2 className="text-3xl font-semibold">Запустите программу за один вечер</h2><p className="mt-3 text-slate-300">Настройте условия, пригласите сотрудников и выдайте клиентам цифровые карты.</p><LinkButton href="/onboarding/business" className="mt-6">Начать</LinkButton></div>
        </ScrollReveal>
      </section>
      <SiteFooter />
    </main>
  );
}
