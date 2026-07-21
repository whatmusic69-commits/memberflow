import { ArrowUpRight, Check, Coffee, CreditCard, Gift, Menu, MousePointerClick, QrCode, ScanLine, Stamp } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { QrCode as RealQrCode } from "@/components/ui/qr-code";
import { cn } from "@/lib/utils";

export function SectionBadge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] shadow-[var(--shadow-sm)] backdrop-blur"><span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_0_5px_rgba(32,180,134,0.14)]" />{children}</span>;
}

export function SectionHeading({ eyebrow, title, text, dark = false }: { eyebrow?: string; title: string; text?: string; dark?: boolean }) {
  return <div className="mx-auto mb-8 max-w-3xl text-center">{eyebrow ? <p className={cn("mb-3 text-xs font-bold uppercase tracking-[0.18em]", dark ? "text-violet-200" : "text-[var(--primary)]")}>{eyebrow}</p> : null}<h2 className={cn("text-3xl font-semibold tracking-tight sm:text-4xl", dark && "text-white")}>{title}</h2>{text ? <p className={cn("mt-3 text-base", dark ? "text-slate-300" : "text-[var(--muted-foreground)]")}>{text}</p> : null}</div>;
}

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-[#F4F5F9]/78 shadow-[0_1px_0_rgba(18,19,32,0.03)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BrandLogo />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
          <a href="#features" className="hover:text-[var(--foreground)]">Возможности</a>
          <a href="#how" className="hover:text-[var(--foreground)]">Как это работает</a>
          <a href="#business" className="hover:text-[var(--foreground)]">Для бизнеса</a>
          <a href="#pricing" className="hover:text-[var(--foreground)]">Тарифы</a>
        </nav>
        <div className="hidden items-center gap-2 sm:flex"><LanguageSwitcher /><LinkButton href="/login" variant="secondary">Войти</LinkButton><LinkButton href="/onboarding/business">Получить скидку</LinkButton></div>
        <details className="relative sm:hidden">
          <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-xl bg-white shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)] [&::-webkit-details-marker]:hidden"><Menu className="h-5 w-5" /></summary>
          <div className="absolute right-0 top-12 z-50 w-72 rounded-3xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-lg)]">
            {["Возможности", "Как это работает", "Для бизнеса", "Тарифы"].map((item, index) => <a key={item} href={["#features", "#how", "#business", "#pricing"][index]} className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{item}</a>)}
            <div className="mt-2 grid gap-2"><LanguageSwitcher /><LinkButton href="/login" variant="secondary">Войти</LinkButton><LinkButton href="/onboarding/business">Получить скидку</LinkButton></div>
          </div>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-white/75 px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">MemberFlow помогает сервисному бизнесу запускать платные подписки, карты лояльности, QR-обслуживание и клиентские цифровые карты без собственного приложения.</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Riga · European SaaS for local services</p>
        </div>
        <FooterColumn title="Продукт" links={[["Возможности", "/#features"], ["Как это работает", "/#how"], ["Тарифы", "/#pricing"], ["FAQ", "/#faq"]]} />
        <FooterColumn title="Компания" links={[["О нас", "/about"], ["Контакты", "/contacts"], ["Demo", "/demo"], ["Войти", "/login"]]} />
        <FooterColumn title="Документы" links={[["Privacy", "/privacy"], ["Terms", "/terms"], ["Обработка платежей", "/dashboard/stripe"], ["Кабинет бизнеса", "/dashboard"]]} />
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-3 border-t border-slate-100 pt-5 text-xs text-slate-500 sm:flex-row">
        <span>© 2026 MemberFlow. All rights reserved.</span>
        <span>Подписки и цифровые карты лояльности для сервисного бизнеса.</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
      <div className="mt-3 space-y-2">
        {links.map(([label, href]) => <a key={href} href={href} className="block text-sm text-slate-500 transition hover:text-[var(--primary)]">{label}</a>)}
      </div>
    </div>
  );
}

export function HeroContent() {
  return (
    <div className="animate-fade-up max-w-3xl">
      <SectionBadge>Подписки и лояльность без приложения</SectionBadge>
      <h1 className="mt-6 text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
        Превратите постоянных клиентов в <span className="relative whitespace-nowrap text-[var(--primary)]">регулярную выручку<span className="absolute -bottom-2 left-0 h-2 w-full rounded-full bg-[var(--primary)]/14" /></span>
      </h1>
      <p className="mt-6 max-w-[620px] text-lg leading-8 text-[var(--muted-foreground)]">Создавайте платные подписки и цифровые карты лояльности без разработки собственного приложения.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/onboarding/business" className="h-12 px-6">Получить скидку на первый месяц<ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></LinkButton>
        <LinkButton href="/demo" variant="secondary" className="h-12 px-6"><MousePointerClick className="h-4 w-4" />Посмотреть продукт</LinkButton>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium text-slate-600">{["Скидка на первый месяц", "Оплата картой", "Настройка за 10 минут"].map((item) => <span key={item} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[var(--success)]" />{item}</span>)}</div>
    </div>
  );
}

export function SubscriptionPassPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[30px] border border-violet-300/20 bg-[#121320] p-6 text-white", className)}>
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[var(--primary)]/28 blur-3xl" />
      <div className="relative grid gap-7">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-sm font-bold ring-1 ring-white/10">W</span>
            <span><b className="text-lg">Wash Club</b><p className="text-xs text-slate-300">Digital membership</p></span>
          </span>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/15">Active</span>
        </div>
        <div>
          <p className="text-sm text-slate-300">Комплексная подписка</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">€29,99<span className="text-base font-medium text-slate-300"> / месяц</span></p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">Две комплексные мойки каждый месяц. QR-карта обновляется автоматически.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_124px]">
          <div className="rounded-2xl bg-white/9 p-4 ring-1 ring-white/10">
            <div className="flex items-end justify-between gap-3"><span><p className="text-xs text-slate-300">Прогресс месяца</p><p className="mt-2 text-2xl font-semibold">2 из 2</p></span><span className="text-xs font-semibold text-violet-200">100%</span></div>
            <div className="mt-4 h-2 rounded-full bg-white/12"><div className="h-2 w-full rounded-full bg-[var(--primary-bright)]" /></div>
          </div>
          <RealQrCode className="justify-self-start sm:justify-self-end" label="QR" value="https://memberflow.demo/card/demo-washclub" size={88} />
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
          <HeroStat value="84" label="участника" />
          <HeroStat value="€2 518" label="MRR" />
          <HeroStat value="+12%" label="за месяц" />
        </div>
      </div>
    </div>
  );
}

export function LoyaltyPassPreview({ className }: { className?: string }) {
  return (
    <div className={cn("box-border h-[132px] w-[520px] overflow-hidden rounded-[24px] border border-amber-200/70 bg-[#FBF8F1] px-7 py-5", className)}>
      <div className="flex flex-col items-start justify-start gap-1 leading-tight">
        <div className="flex w-full items-start justify-between gap-4">
          <span><b className="leading-none">Coffee Regular</b><p className="mt-1 text-xs leading-none text-slate-500">5 кофе → 1 бесплатно</p></span>
          <Gift className="h-5 w-5 shrink-0 text-amber-500" />
        </div>
        <div className="mt-3 flex gap-2.5">{Array.from({ length: 5 }, (_, i) => <span key={i} className={cn("h-8 w-8 shrink-0 rounded-full border", i < 4 ? "border-[var(--primary)] bg-[var(--primary)]" : "border-slate-300 bg-white")} />)}</div>
      </div>
    </div>
  );
}

export function FloatingMetric({ value, label, className }: { value: string; label: string; className?: string }) {
  return <div className={cn("animate-float-soft absolute hidden rounded-2xl border border-white/70 bg-white/86 px-4 py-3 text-sm shadow-[var(--shadow-md)] backdrop-blur md:block", className)}><p className="font-semibold text-[var(--foreground)]">{value}</p><p className="text-xs text-[var(--muted-foreground)]">{label}</p></div>;
}

export function HeroProductPreview() {
  return (
    <div className="relative z-10 mx-auto mt-8 w-full max-w-[620px] overflow-visible lg:mt-0 lg:h-[620px] lg:origin-center lg:scale-[0.86] xl:scale-100">
      <div className="preview-stage group relative mx-auto h-auto w-full transition duration-300 hover:-translate-y-1 lg:h-[620px] lg:w-[620px]">
        <div className="absolute bottom-12 left-1/2 hidden h-20 w-[460px] -translate-x-1/2 rounded-full bg-[#090A12]/30 blur-2xl lg:block" />
        <div className="absolute left-1/2 top-28 hidden h-[360px] w-[480px] -translate-x-1/2 rounded-full bg-[var(--primary-glow)] blur-3xl lg:block" />
        <LoyaltyPassPreview className="absolute right-[-12px] top-[44px] z-[1] hidden rotate-1 opacity-95 shadow-none lg:block" />
        <div className="relative z-10 mx-auto w-full max-w-[520px] lg:absolute lg:left-1/2 lg:top-[205px] lg:-translate-x-1/2 lg:-rotate-2">
          <SubscriptionPassPreview className="shadow-[0_38px_90px_rgba(12,13,22,0.28),0_0_0_1px_rgba(124,108,255,0.16)]" />
        </div>
      </div>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return <div><p className="text-sm font-semibold sm:text-base">{value}</p><p className="mt-0.5 text-[11px] text-slate-400">{label}</p></div>;
}

export function BrowserMockup() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute inset-8 rounded-[40px] bg-[var(--primary-glow)] blur-3xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[var(--shadow-lg)] lg:-rotate-1">
        <div className="flex h-11 items-center gap-2 border-b border-slate-100 bg-slate-50 px-4"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" /><span className="ml-4 rounded-full bg-white px-4 py-1 text-xs text-slate-500">memberflow.app/dashboard</span></div>
        <div className="grid min-h-[360px] grid-cols-[170px_1fr] bg-[#F4F5F9]">
          <div className="bg-[#0C0D16] p-4 text-white"><BrandLogo compact className="text-white" /><div className="mt-8 space-y-2">{["Обзор","Программы","Клиенты","Scanner"].map((item, i) => <div key={item} className={cn("rounded-xl px-3 py-2 text-sm", i === 0 ? "bg-white text-[#121320]" : "text-slate-400")}>{item}</div>)}</div></div>
          <div className="p-5"><div className="grid gap-3 md:grid-cols-3"><Mini label="MRR" value="€5 518" /><Mini label="Клиенты" value="596" /><Mini label="Награды" value="34" /></div><div className="mt-4 grid gap-4 md:grid-cols-[1.3fr_0.7fr]"><div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]"><PreviewBars /></div><div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]"><p className="font-semibold">QR scanner</p><div className="mt-4 rounded-2xl border border-dashed border-violet-200 bg-[var(--primary-soft)] p-4 text-center"><ScanLine className="mx-auto h-10 w-10 text-[var(--primary)]" /><p className="mt-2 text-sm">Ready to scan</p></div></div></div></div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>; }
function PreviewBars() { return <div><p className="font-semibold">Revenue flow</p><div className="mt-8 flex h-32 items-end gap-2">{[42, 58, 49, 76, 84, 100].map((h, i) => <span key={i} className="flex-1 rounded-t-xl bg-[var(--primary)]/80" style={{ height: `${h}%` }} />)}</div></div>; }

export function ProgramShowcase() {
  return (
    <div className="grid gap-6 lg:grid-cols-2 max-[900px]:grid-cols-1">
      <ProductCard
        icon={<CreditCard className="h-5 w-5" />}
        title="Платная подписка"
        description="Регулярные платежи и автоматическое обновление лимитов."
        benefits={["Регулярная выручка", "Автопродление", "MRR-аналитика"]}
        href="/onboarding/subscription"
        cta="Создать подписку"
        dark
      >
        <SubscriptionProductPreview />
      </ProductCard>
      <ProductCard
        icon={<Stamp className="h-5 w-5" />}
        title="Карта лояльности"
        description="Штампы, награды и повторные визиты без оплаты клиента."
        benefits={["Больше возвратов", "Гибкие награды", "Без комиссии"]}
        href="/onboarding/loyalty"
        cta="Создать карту"
      >
        <LoyaltyProductPreview />
      </ProductCard>
    </div>
  );
}

function ProductCard({ icon, title, description, benefits, href, cta, children, dark = false }: { icon: React.ReactNode; title: string; description: string; benefits: string[]; href: string; cta: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Card className={cn("flex h-[620px] flex-col overflow-hidden rounded-[28px] p-10 shadow-[var(--shadow-md)] max-[900px]:h-auto max-[600px]:p-6", dark ? "border-violet-400/20 bg-[#121320] text-white" : "bg-white")}>
      <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", dark ? "bg-white/10 text-violet-200 ring-1 ring-white/10" : "bg-[var(--primary-soft)] text-[var(--primary)]")}>{icon}</div>
      <h3 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h3>
      <p className={cn("mt-3 max-w-md text-sm leading-6", dark ? "text-slate-300" : "text-[var(--muted-foreground)]")}>{description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {benefits.map((benefit) => <span key={benefit} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold", dark ? "bg-white/8 text-slate-200 ring-1 ring-white/10" : "bg-slate-50 text-slate-700 ring-1 ring-[var(--border)]")}>{benefit}</span>)}
      </div>
      <div className="mt-6">
        <LinkButton href={href} variant={dark ? "primary" : "secondary"}>{cta}</LinkButton>
      </div>
      <div className="mt-auto pt-8">{children}</div>
    </Card>
  );
}

function SubscriptionProductPreview() {
  return (
    <div className="flex h-[270px] flex-col rounded-[24px] border border-violet-300/18 bg-[#0C0D16] p-6 text-white max-[600px]:h-auto max-[600px]:p-5">
      <div className="grid flex-1 gap-5 min-[601px]:grid-cols-[1fr_170px]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-sm font-bold ring-1 ring-white/10">W</span>
            <div><p className="font-semibold">Wash Club</p><p className="mt-1 inline-flex rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-200 ring-1 ring-emerald-300/15">Active</p></div>
          </div>
          <div className="mt-7 flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-3xl font-semibold tracking-tight">€29,99</span>
            <span className="text-sm font-medium text-slate-300">/ месяц</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">Две комплексные мойки каждый месяц.</p>
        </div>
        <div className="grid content-start gap-4 max-[600px]:grid-cols-[auto_1fr] max-[600px]:items-center">
          <RealQrCode label="QR" value="https://memberflow.demo/card/demo-washclub" size={76} />
          <div className="rounded-2xl bg-white/9 p-4 ring-1 ring-white/10">
            <div className="flex items-baseline justify-between gap-3"><p className="text-xs text-slate-300">Прогресс</p><p className="whitespace-nowrap text-lg font-semibold">2 из 2</p></div>
            <div className="mt-3 h-2 rounded-full bg-white/12"><div className="h-2 w-full rounded-full bg-[var(--primary-bright)]" /></div>
          </div>
        </div>
      </div>
      <ProductStats items={["84 участника", "€2 518 MRR", "+12% за месяц"]} dark />
    </div>
  );
}

function LoyaltyProductPreview() {
  return (
    <div className="flex h-[270px] flex-col rounded-[24px] border border-amber-200/70 bg-[#FBF8F1] p-6 text-[#121320] max-[600px]:h-auto max-[600px]:p-5">
      <div className="grid flex-1 gap-5 min-[601px]:grid-cols-[1fr_150px]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-amber-500 ring-1 ring-amber-200"><Coffee className="h-5 w-5" /></span>
            <div><p className="font-semibold">Coffee Regular</p><p className="text-xs text-slate-500">5 кофе — шестой бесплатно</p></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {Array.from({ length: 5 }, (_, index) => <span key={index} className={cn("h-11 w-11 rounded-full border", index < 4 ? "border-[var(--primary)] bg-[var(--primary)] shadow-[0_0_0_5px_rgba(109,93,251,0.1)]" : "border-amber-200 bg-white")} />)}
          </div>
        </div>
        <div className="grid place-items-center rounded-[22px] bg-white/75 ring-1 ring-amber-200/70 max-[600px]:min-h-28">
          <div className="text-center text-amber-500">
            <Gift className="mx-auto h-12 w-12" />
            <p className="mt-2 text-xs font-semibold text-slate-600">Reward</p>
          </div>
        </div>
      </div>
      <ProductStats items={["128 участников", "346 визитов", "68 наград выдано"]} />
    </div>
  );
}

function ProductStats({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <div className={cn("mt-5 flex flex-wrap gap-x-3 gap-y-1 border-t pt-4 text-xs font-semibold", dark ? "border-white/10 text-slate-300" : "border-amber-200/70 text-slate-600")}>
      {items.map((item, index) => <span key={item} className="whitespace-nowrap">{index > 0 ? <span className="mr-3 opacity-40">·</span> : null}{item}</span>)}
    </div>
  );
}

export function ProcessDemo() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-3">{[["1","Создайте программу"],["2","Клиент получает QR-карту"],["3","Сотрудник сканирует прогресс"]].map(([n, t]) => <div key={n} className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"><p className="text-sm font-bold text-[var(--primary)]">Шаг {n}</p><h3 className="mt-1 font-semibold">{t}</h3></div>)}</div>
      <Card className="overflow-hidden bg-[#121320] p-6 text-white"><div className="grid gap-5 md:grid-cols-[1fr_150px]"><div><p className="text-sm text-violet-200">Live flow</p><h3 className="mt-2 text-2xl font-semibold">Сканирование обновляет карту и операцию в истории</h3><div className="mt-6 rounded-2xl bg-white/8 p-4"><p className="flex items-center gap-2"><QrCode className="h-5 w-5 text-violet-200" />Robert Kalniņš</p><p className="mt-2 text-sm text-slate-300">+1 штамп · Награда доступна</p></div></div><RealQrCode label="Client QR" value="https://memberflow.demo/card/demo-washclub" /></div></Card>
    </div>
  );
}

export function IndustryStrip() {
  const items = "Автомойки · Барбершопы · Кофейни · Beauty · Груминг · Массаж · Фитнес · Солярии";
  return <div id="business" className="overflow-hidden border-y border-[var(--border)] bg-white/70 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500"><div className="mx-auto max-w-7xl px-4">{items}</div></div>;
}
