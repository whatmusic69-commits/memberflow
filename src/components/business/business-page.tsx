"use client";

import { ArrowDown, ArrowUp, Check, Copy, ExternalLink, Eye, Globe2, Save } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { QrCode as QrCodeBox } from "@/components/ui/qr-code";
import { formatMoney } from "@/lib/utils";
import { sanitizeSlug, useBusinessSpaceStore } from "@/store/business-space-store";
import { useDemoStore } from "@/store/demo-store";
import type { Business, BusinessPageBlock, BusinessPageContent, BusinessPageSettings, Offer, Program, ServiceItem } from "@/types";

const inputClass = "h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-[var(--shadow-sm)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]";

export function BusinessPageBuilder() {
  const { businesses, selectedBusinessId, programs, showToast } = useDemoStore();
  const { services, offers, businessPages, updateBusinessPageDraft, updateBusinessPageBlock, moveBusinessPageBlock, updateBusinessPageSlug, publishBusinessPage, revertBusinessPageDraft } = useBusinessSpaceStore();
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const page = businessPages.find((item) => item.businessId === selectedBusinessId);
  const [tab, setTab] = useState<"settings" | "blocks" | "seo">("settings");
  const [slugMessage, setSlugMessage] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  if (!business || !page) return <EmptyBusinessPage />;
  const bizServices = services.filter((item) => item.businessId === business.id);
  const bizOffers = offers.filter((item) => item.businessId === business.id);
  const bizPrograms = programs.filter((item) => item.businessId === business.id);
  const publicUrl = `/b/${page.slug}`;

  function setSlug(value: string) {
    const result = updateBusinessPageSlug(selectedBusinessId, value);
    setSlugMessage(result.message);
  }

  function copy(value: string) {
    navigator.clipboard?.writeText(value);
    showToast("Ссылка скопирована");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Business page</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Конструктор публичной страницы</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Страница использует тот же бизнес, услуги, предложения, лояльность и контакты, что dashboard и клиентский кабинет.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setPreviewMode((value) => !value)}><Eye className="h-4 w-4" />{previewMode ? "Редактор" : "Preview"}</Button>
          <LinkButton href={publicUrl} variant="secondary"><ExternalLink className="h-4 w-4" />Открыть</LinkButton>
          <Button onClick={() => { publishBusinessPage(business.id); showToast("Страница опубликована"); }}><Check className="h-4 w-4" />Опубликовать</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="overflow-hidden shadow-[var(--shadow-md)]">
            <CardHeader title="Статус и ссылка" description="Draft не меняет опубликованную страницу до публикации." />
            <div className="space-y-4 p-5">
              <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Публичный URL</span>
                <div className="flex items-center gap-2">
                  <input className={inputClass} value={page.slug} onChange={(event) => setSlug(event.target.value)} />
                  <Button variant="secondary" onClick={() => copy(`${window.location.origin}${publicUrl}`)}><Copy className="h-4 w-4" /></Button>
                </div>
                {slugMessage ? <p className={slugMessage.includes("доступен") ? "text-xs font-semibold text-emerald-700" : "text-xs font-semibold text-red-700"}>{slugMessage}</p> : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Info label="Статус" value={page.status === "published" ? "Опубликована" : "Черновик"} />
                <Info label="Публикация" value={page.lastPublishedAt ? new Date(page.lastPublishedAt).toLocaleDateString("ru-RU") : "Не опубликована"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" onClick={() => revertBusinessPageDraft(business.id)}><Save className="h-4 w-4" />Вернуть</Button>
                <Button onClick={() => { publishBusinessPage(business.id); showToast("Страница опубликована"); }}><Globe2 className="h-4 w-4" />Publish</Button>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {(["settings", "blocks", "seo"] as const).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={tab === item ? "rounded-2xl bg-[#121320] px-3 py-2 text-sm font-semibold text-white" : "rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"}>{item === "settings" ? "Вид" : item === "blocks" ? "Блоки" : "SEO"}</button>)}
            </div>
          </Card>

          {tab === "settings" ? <AppearanceEditor page={page} onChange={(patch) => updateBusinessPageDraft(business.id, { appearance: { ...page.draft.appearance, ...patch } })} /> : null}
          {tab === "blocks" ? <BlocksEditor page={page} onChange={(blockId, patch) => updateBusinessPageBlock(business.id, blockId, patch)} onMove={(blockId, direction) => moveBusinessPageBlock(business.id, blockId, direction)} /> : null}
          {tab === "seo" ? <SeoEditor page={page} onChange={(patch) => updateBusinessPageDraft(business.id, { seo: { ...page.draft.seo, ...patch } })} /> : null}

          <Card className="p-5">
            <h2 className="text-base font-semibold">QR-коды</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <QrPurpose title="Открыть страницу бизнеса" value={`https://memberflow.demo${publicUrl}`} />
              <QrPurpose title="Зарегистрироваться в программе клиента" value={`https://memberflow.demo/join/${bizPrograms[0]?.id ?? business.id}`} />
            </div>
          </Card>
        </div>

        <BusinessPagePreview business={business} page={page} content={page.draft} services={bizServices} offers={bizOffers} programs={bizPrograms} framed={!previewMode} />
      </div>
    </div>
  );
}

export function PublicBusinessPage({ slug }: { slug: string }) {
  const { businesses, programs } = useDemoStore();
  const { services, offers, businessPages } = useBusinessSpaceStore();
  const safeSlug = sanitizeSlug(slug);
  const page = businessPages.find((item) => item.slug === safeSlug && item.status === "published" && item.published);
  if (!page?.published) return <PublicNotFound />;
  const business = businesses.find((item) => item.id === page.businessId);
  if (!business) return <PublicNotFound />;
  return <BusinessPagePreview business={business} page={page} content={page.published} services={services.filter((item) => item.businessId === business.id && item.visible)} offers={offers.filter((item) => item.businessId === business.id && item.publicVisible && item.status === "active")} programs={programs.filter((item) => item.businessId === business.id)} framed={false} />;
}

function BusinessPagePreview({ business, page, content, services, offers, programs, framed }: { business: Business; page: BusinessPageSettings; content: BusinessPageContent; services: ServiceItem[]; offers: Offer[]; programs: Program[]; framed: boolean }) {
  const sorted = useMemo(() => content.blocks.filter((block) => block.enabled).sort((a, b) => a.order - b.order), [content.blocks]);
  const wrapperStyle = { backgroundColor: content.appearance.backgroundColor, color: content.appearance.textColor } as React.CSSProperties;
  return (
    <div className={framed ? "rounded-[32px] border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-lg)]" : ""}>
      <main className="overflow-hidden rounded-[26px]" style={wrapperStyle}>
        {framed ? <div className="flex h-10 items-center gap-2 border-b border-slate-100 px-4"><span className="h-3 w-3 rounded-full bg-red-300" /><span className="h-3 w-3 rounded-full bg-amber-300" /><span className="h-3 w-3 rounded-full bg-emerald-300" /><span className="ml-3 truncate text-xs text-slate-400">memberflow.demo/b/{page.slug}</span></div> : null}
        {sorted.map((block) => {
          if (block.type === "hero") return <HeroBlock key={block.id} business={business} block={block} content={content} programs={programs} />;
          if (block.type === "about") return <TextBlock key={block.id} block={block} />;
          if (block.type === "services") return <ServicesBlock key={block.id} block={block} services={services} />;
          if (block.type === "offers") return <OffersBlock key={block.id} block={block} offers={offers} />;
          if (block.type === "loyalty") return <LoyaltyBlock key={block.id} block={block} programs={programs} />;
          if (block.type === "contacts") return <ContactsBlock key={block.id} block={block} business={business} />;
          if (block.type === "packages") return <PackagesBlock key={block.id} block={block} programs={programs} />;
          if (block.type === "cta") return <FinalCtaBlock key={block.id} block={block} color={content.appearance.primaryColor} />;
          return <PlaceholderBlock key={block.id} block={block} />;
        })}
      </main>
    </div>
  );
}

function AppearanceEditor({ page, onChange }: { page: BusinessPageSettings; onChange: (patch: Partial<BusinessPageContent["appearance"]>) => void }) {
  const appearance = page.draft.appearance;
  return (
    <Card className="p-5">
      <h2 className="font-semibold">Внешний вид</h2>
      <div className="mt-4 grid gap-3">
        <Color label="Основной цвет" value={appearance.primaryColor} onChange={(value) => onChange({ primaryColor: value })} />
        <Color label="Дополнительный цвет" value={appearance.secondaryColor} onChange={(value) => onChange({ secondaryColor: value })} />
        <Color label="Фон" value={appearance.backgroundColor} onChange={(value) => onChange({ backgroundColor: value })} />
        <Color label="Текст" value={appearance.textColor} onChange={(value) => onChange({ textColor: value })} />
        <Select label="Тема" value={appearance.theme} options={["light", "dark"]} onChange={(value) => onChange({ theme: value as "light" | "dark" })} />
        <Select label="Форма кнопок" value={appearance.buttonShape} options={["soft", "round", "sharp"]} onChange={(value) => onChange({ buttonShape: value as "soft" | "round" | "sharp" })} />
      </div>
    </Card>
  );
}

function BlocksEditor({ page, onChange, onMove }: { page: BusinessPageSettings; onChange: (blockId: string, patch: Partial<BusinessPageBlock>) => void; onMove: (blockId: string, direction: "up" | "down") => void }) {
  const blocks = [...page.draft.blocks].sort((a, b) => a.order - b.order);
  return (
    <Card className="p-5">
      <h2 className="font-semibold">Блоки страницы</h2>
      <div className="mt-4 space-y-3">
        {blocks.map((block) => (
          <div key={block.id} className="rounded-2xl border border-[var(--border)] bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={block.enabled} onChange={(event) => onChange(block.id, { enabled: event.target.checked })} />{blockTitle(block.type)}</label>
              <div className="flex gap-1">
                <Button variant="ghost" className="h-8 min-h-8 px-2" onClick={() => onMove(block.id, "up")}><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="ghost" className="h-8 min-h-8 px-2" onClick={() => onMove(block.id, "down")}><ArrowDown className="h-4 w-4" /></Button>
              </div>
            </div>
            <input className={`${inputClass} mt-3`} value={block.title} maxLength={80} onChange={(event) => onChange(block.id, { title: event.target.value })} />
            <textarea className="mt-2 min-h-20 w-full rounded-xl border border-[var(--border)] p-3 text-sm" value={block.text} maxLength={260} onChange={(event) => onChange(block.id, { text: event.target.value })} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function SeoEditor({ page, onChange }: { page: BusinessPageSettings; onChange: (patch: Partial<BusinessPageContent["seo"]>) => void }) {
  return <Card className="p-5"><h2 className="font-semibold">SEO</h2><div className="mt-4 space-y-3"><Field label="SEO title"><input className={inputClass} value={page.draft.seo.title} maxLength={70} onChange={(event) => onChange({ title: event.target.value })} /></Field><Field label="Meta description"><textarea className="min-h-24 w-full rounded-xl border border-[var(--border)] p-3 text-sm" value={page.draft.seo.description} maxLength={160} onChange={(event) => onChange({ description: event.target.value })} /></Field></div></Card>;
}

function HeroBlock({ business, block, content, programs }: { business: Business; block: BusinessPageBlock; content: BusinessPageContent; programs: Program[] }) {
  const radius = content.appearance.buttonShape === "round" ? "999px" : content.appearance.buttonShape === "sharp" ? "10px" : "18px";
  return <section className="relative overflow-hidden px-5 py-16 sm:px-8 lg:px-12"><div className="absolute -right-20 top-0 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: `${content.appearance.primaryColor}33` }} /><div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: content.appearance.primaryColor }}>{business.category}</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{block.title}</h1><p className="mt-5 max-w-2xl text-base leading-7 opacity-75">{block.text}</p><div className="mt-7 flex flex-wrap gap-3"><Link href={`/join/${programs[0]?.id ?? business.id}`} className="inline-flex min-h-11 items-center justify-center px-5 text-sm font-bold text-white" style={{ backgroundColor: content.appearance.primaryColor, borderRadius: radius }}>{block.ctaLabel ?? "Присоединиться"}</Link><a href="#services" className="inline-flex min-h-11 items-center justify-center bg-white px-5 text-sm font-bold text-[#121320] ring-1 ring-slate-200" style={{ borderRadius: radius }}>{block.secondaryCtaLabel ?? "Услуги"}</a></div></div><div className="rounded-[28px] bg-[#121320] p-5 text-white shadow-[var(--shadow-lg)]"><p className="text-sm text-slate-300">{business.name}</p><h2 className="mt-4 text-2xl font-semibold">Клиентский кабинет</h2><div className="mt-5 rounded-2xl bg-white/10 p-4"><p className="text-sm">Награды, услуги и предложения без установки приложения.</p></div></div></div></section>;
}

function TextBlock({ block }: { block: BusinessPageBlock }) {
  return <section className="px-5 py-10 sm:px-8 lg:px-12"><div className="max-w-3xl"><h2 className="text-3xl font-semibold">{block.title}</h2><p className="mt-4 whitespace-pre-line leading-7 opacity-75">{block.text}</p></div></section>;
}

function ServicesBlock({ block, services }: { block: BusinessPageBlock; services: ServiceItem[] }) {
  return <section id="services" className="px-5 py-10 sm:px-8 lg:px-12"><SectionTitle block={block} /><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{services.sort((a, b) => a.order - b.order).map((service) => <div key={service.id} className="rounded-[24px] bg-white p-5 text-[#121320] shadow-[var(--shadow-sm)] ring-1 ring-slate-100"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{service.name}</h3>{service.popular ? <span className="rounded-full bg-[var(--primary-soft)] px-2 py-1 text-[10px] font-bold text-[var(--primary)]">popular</span> : null}</div><p className="mt-2 text-sm leading-6 text-slate-500">{service.description}</p><p className="mt-4 text-lg font-semibold">{service.pricePrefix === "from" ? "от " : ""}{formatMoney(service.priceCents)}</p><p className="text-xs text-slate-500">{service.durationMinutes} мин · {service.category}</p></div>)}</div>{services.length === 0 ? <EmptyPublic text="Услуги появятся после добавления в dashboard." /> : null}</section>;
}

function OffersBlock({ block, offers }: { block: BusinessPageBlock; offers: Offer[] }) {
  return <section className="px-5 py-10 sm:px-8 lg:px-12"><SectionTitle block={block} /><div className="mt-6 grid gap-4 md:grid-cols-2">{offers.map((offer) => <div key={offer.id} className="rounded-[24px] bg-[#FBF8F1] p-5 text-[#121320]"><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700">{offer.discountLabel}</span><h3 className="mt-4 text-xl font-semibold">{offer.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{offer.description}</p>{offer.promoCode ? <p className="mt-4 text-sm font-bold">Промокод: {offer.promoCode}</p> : null}</div>)}</div>{offers.length === 0 ? <EmptyPublic text="Публичных акций пока нет." /> : null}</section>;
}

function LoyaltyBlock({ block, programs }: { block: BusinessPageBlock; programs: Program[] }) {
  const loyalty = programs.find((program) => program.type === "loyalty");
  return <section className="px-5 py-10 sm:px-8 lg:px-12"><div className="rounded-[30px] bg-[#121320] p-6 text-white lg:p-8"><SectionTitle block={block} dark /><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_220px] lg:items-center"><div><p className="text-2xl font-semibold">{loyalty?.name ?? "Программа лояльности"}</p><p className="mt-2 text-slate-300">{loyalty?.description ?? block.text}</p><p className="mt-4 text-sm text-violet-200">Приложение устанавливать не нужно. Клиент получает персональный кабинет по ссылке или QR.</p></div><QrCodeBox label="QR регистрации" value={`https://memberflow.demo/join/${loyalty?.id ?? "program"}`} size={130} /></div></div></section>;
}

function PackagesBlock({ block, programs }: { block: BusinessPageBlock; programs: Program[] }) {
  const subscriptions = programs.filter((program) => program.type === "subscription");
  return <section className="px-5 py-10 sm:px-8 lg:px-12"><SectionTitle block={block} /><div className="mt-6 grid gap-4 md:grid-cols-2">{subscriptions.map((program) => <div key={program.id} className="rounded-[24px] bg-white p-5 text-[#121320] shadow-[var(--shadow-sm)]"><h3 className="font-semibold">{program.name}</h3><p className="mt-2 text-sm text-slate-500">{program.description}</p><p className="mt-4 text-2xl font-semibold">{formatMoney(program.priceCents ?? 0)} <span className="text-sm text-slate-500">/ месяц</span></p><p className="mt-2 text-sm">{program.includedUses} × {program.includedService}</p></div>)}</div>{subscriptions.length === 0 ? <EmptyPublic text="Пакеты и подписки не опубликованы." /> : null}</section>;
}

function ContactsBlock({ business, block }: { business: Business; block: BusinessPageBlock }) {
  return <section className="px-5 py-10 sm:px-8 lg:px-12"><SectionTitle block={block} /><div className="mt-6 grid gap-4 md:grid-cols-3"><Info label="Адрес" value={`${business.address}, ${business.city}`} /><Info label="Телефон" value={business.phone} /><Info label="Email" value={business.email} /></div></section>;
}

function FinalCtaBlock({ block, color }: { block: BusinessPageBlock; color: string }) {
  return <section className="px-5 py-12 sm:px-8 lg:px-12"><div className="rounded-[30px] p-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${color}, #121320)` }}><h2 className="text-3xl font-semibold">{block.title}</h2><p className="mx-auto mt-3 max-w-2xl text-sm text-white/75">{block.text}</p><Link href="/customer/cards" className="mt-6 inline-flex min-h-11 items-center rounded-2xl bg-white px-5 text-sm font-bold text-[#121320]">{block.ctaLabel ?? "Открыть кабинет"}</Link></div></section>;
}

function PlaceholderBlock({ block }: { block: BusinessPageBlock }) {
  return <section className="px-5 py-8 sm:px-8 lg:px-12"><div className="rounded-[24px] border border-dashed border-slate-300 p-6 text-sm text-slate-500">{blockTitle(block.type)}: Coming soon</div></section>;
}

function SectionTitle({ block, dark = false }: { block: BusinessPageBlock; dark?: boolean }) {
  return <div><h2 className={dark ? "text-3xl font-semibold text-white" : "text-3xl font-semibold"}>{block.title}</h2><p className={dark ? "mt-2 max-w-2xl text-sm leading-6 text-slate-300" : "mt-2 max-w-2xl text-sm leading-6 opacity-70"}>{block.text}</p></div>;
}

function QrPurpose({ title, value }: { title: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4 text-center"><QrCodeBox label={title} value={value} size={120} /></div>;
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label}><div className="flex gap-2"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-16 rounded-xl border border-slate-200 bg-white" /><input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} /></div></Field>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <Field label={label}><select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></Field>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-sm font-medium">{label}{children}</label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white p-4 text-sm shadow-[var(--shadow-sm)] ring-1 ring-slate-100"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-[#121320]">{value}</p></div>;
}

function EmptyPublic({ text }: { text: string }) {
  return <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-sm opacity-60">{text}</div>;
}

function EmptyBusinessPage() {
  return <Card className="p-8 text-center"><Globe2 className="mx-auto h-10 w-10 text-slate-300" /><h1 className="mt-4 text-xl font-semibold">Страница бизнеса не найдена</h1><p className="mt-2 text-sm text-slate-500">Для старых аккаунтов будут использованы безопасные настройки по умолчанию.</p></Card>;
}

function PublicNotFound() {
  return <main className="grid min-h-screen place-items-center bg-[var(--background)] p-6"><Card className="max-w-md p-8 text-center"><Globe2 className="mx-auto h-10 w-10 text-slate-300" /><h1 className="mt-4 text-xl font-semibold">Страница не опубликована</h1><p className="mt-2 text-sm text-slate-500">Проверьте ссылку или попросите бизнес прислать актуальную страницу.</p><LinkButton href="/" className="mt-5" variant="secondary">На главную</LinkButton></Card></main>;
}

function blockTitle(type: BusinessPageBlock["type"]) {
  const labels = {
    hero: "Обложка",
    about: "О бизнесе",
    services: "Услуги и цены",
    offers: "Акции и предложения",
    gallery: "Галерея",
    team: "Команда",
    contacts: "Контакты",
    loyalty: "Лояльность",
    packages: "Пакеты и подписки",
    faq: "FAQ",
    cta: "Финальный CTA",
  };
  return labels[type];
}
