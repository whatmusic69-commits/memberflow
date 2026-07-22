"use client";

import { BellRing, Gift, Plus, QrCode, ReceiptText, Sparkles, WalletCards } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { QrCode as QrCodeBox } from "@/components/ui/qr-code";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { useBusinessSpaceStore } from "@/store/business-space-store";
import { useDemoStore } from "@/store/demo-store";
import type { ServiceItem } from "@/types";

const inputClass = "h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-[var(--shadow-sm)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]";

export function ServicesPage() {
  const { selectedBusinessId, businesses, showToast } = useDemoStore();
  const { services, addService, updateService } = useBusinessSpaceStore();
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const list = services.filter((item) => item.businessId === selectedBusinessId).sort((a, b) => a.order - b.order);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "", price: "", duration: "30" });
  function save() {
    if (!form.name.trim()) return;
    addService(selectedBusinessId, { name: form.name.trim(), description: form.description, category: form.category || "Основное", priceCents: Math.round(Number(form.price || 0) * 100), durationMinutes: Number(form.duration) || 30, visible: true });
    setOpen(false);
    setForm({ name: "", description: "", category: "", price: "", duration: "30" });
    showToast("Услуга добавлена");
  }
  return (
    <PageShell title="Услуги" text="Одна общая сущность услуг используется на публичной странице, в клиентском кабинете, посещениях, пакетах и аналитике." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Добавить услугу</Button>}>
      <Card className="overflow-hidden">
        <CardHeader title={`Каталог ${business?.name ?? ""}`} description="Скрывайте услуги, меняйте публичную видимость и отмечайте популярные позиции." />
        <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((service) => <ServiceCard key={service.id} service={service} onToggle={() => updateService(service.id, { visible: !service.visible })} onPopular={() => updateService(service.id, { popular: !service.popular })} />)}
          {list.length === 0 ? <div className="md:col-span-2 xl:col-span-3"><EmptyState title="Услуги ещё не добавлены" text="Добавьте первые услуги, чтобы они появились на публичной странице и в клиентском кабинете." /></div> : null}
        </div>
      </Card>
      <Modal open={open} title="Новая услуга" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Название"><input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Описание"><textarea className="min-h-20 rounded-xl border border-[var(--border)] p-3 text-sm" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          <div className="grid gap-3 sm:grid-cols-3"><Field label="Категория"><input className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></Field><Field label="Цена EUR"><input className={inputClass} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></Field><Field label="Минуты"><input className={inputClass} value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} /></Field></div>
          <Button onClick={save}>Сохранить услугу</Button>
        </div>
      </Modal>
    </PageShell>
  );
}

export function VisitsPage() {
  const { selectedBusinessId, operations, customers, programs, adjustCustomer } = useDemoStore();
  const { services } = useBusinessSpaceStore();
  const [busy, setBusy] = useState(false);
  const customer = customers.find((item) => item.businessId === selectedBusinessId);
  const list = operations.filter((item) => item.businessId === selectedBusinessId);
  function recordVisit() {
    if (!customer || busy) return;
    setBusy(true);
    adjustCustomer(customer.id, "add_stamp");
    window.setTimeout(() => setBusy(false), 700);
  }
  return (
    <PageShell title="Посещения" text="Быстрый экран для стойки: найти клиента, выбрать услугу и зарегистрировать визит без доступа к критическим настройкам." action={<Button disabled={!customer || busy} onClick={recordVisit}><ReceiptText className="h-4 w-4" />Зарегистрировать визит</Button>}>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="p-5">
          <h2 className="font-semibold">Быстрое действие</h2>
          <p className="mt-2 text-sm text-slate-500">Demo использует первого клиента бизнеса и начисляет штамп. Повторное нажатие временно блокируется.</p>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm"><b>{customer?.name ?? "Нет клиентов"}</b><p className="mt-1 text-slate-500">{services.find((item) => item.businessId === selectedBusinessId)?.name ?? "Услуга не выбрана"}</p></div>
        </Card>
        <ActivityTable operations={list} customers={customers} programs={programs} />
      </div>
    </PageShell>
  );
}

export function LoyaltyPage() {
  const { selectedBusinessId, programs, customers } = useDemoStore();
  const loyalty = programs.find((item) => item.businessId === selectedBusinessId && item.type === "loyalty");
  const participants = customers.filter((item) => item.businessId === selectedBusinessId && item.loyaltyProgramId);
  return (
    <PageShell title="Программа лояльности" text="Лояльность теперь модуль клиентского кабинета, а не отдельная главная карта." action={<LinkButton href="/dashboard/programs/new" variant="secondary"><Plus className="h-4 w-4" />Настроить правила</LinkButton>}>
      {loyalty ? <div className="grid gap-6 xl:grid-cols-[1fr_360px]"><Card className="p-5"><h2 className="text-xl font-semibold">{loyalty.name}</h2><p className="mt-2 text-sm text-slate-500">{loyalty.description}</p><div className="mt-5 grid gap-3 sm:grid-cols-4"><Metric label="Участники" value={String(participants.length || loyalty.customers)} /><Metric label="До награды" value={String(loyalty.targetCount ?? 5)} /><Metric label="Выдано" value={String(loyalty.rewardsAvailable ?? 0)} /><Metric label="Использовано" value={String(loyalty.rewardsRedeemed ?? 0)} /></div><div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">Опасные изменения механики должны учитывать уже накопленный прогресс клиентов. В demo старый прогресс не обнуляется.</div></Card><Card className="bg-[#121320] p-5 text-white"><Gift className="h-6 w-6 text-violet-200" /><h3 className="mt-5 text-2xl font-semibold">Preview клиента</h3><p className="mt-2 text-sm text-slate-300">4 из {loyalty.targetCount ?? 5} посещений</p><div className="mt-4 h-2 rounded-full bg-white/10"><span className="block h-full w-2/3 rounded-full bg-[var(--primary)]" /></div><p className="mt-4 text-sm text-violet-200">{loyalty.rewardName}</p></Card></div> : <EmptyState title="Лояльность не включена" text="Можно продолжать пользоваться клиентским кабинетом без лояльности и подключить модуль позже." />}
    </PageShell>
  );
}

export function OffersPage() {
  const { selectedBusinessId, showToast } = useDemoStore();
  const { offers, addOffer } = useBusinessSpaceStore();
  const [open, setOpen] = useState(false);
  const list = offers.filter((item) => item.businessId === selectedBusinessId);
  return (
    <PageShell title="Предложения" text="Публичные акции, персональные предложения и автоматические предложения разделены по статусам." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Создать предложение</Button>}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((offer) => <Card key={offer.id} className="p-5"><span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">{offer.discountLabel}</span><h2 className="mt-4 font-semibold">{offer.title}</h2><p className="mt-2 text-sm text-slate-500">{offer.description}</p><div className="mt-4 flex items-center justify-between"><StatusBadge status={offer.status} /><span className="text-xs text-slate-500">{offer.publicVisible ? "Публичная" : "Персональная"}</span></div></Card>)}</div>
      <Modal open={open} title="Новое публичное предложение" onClose={() => setOpen(false)}><Button onClick={() => { addOffer(selectedBusinessId, { title: "Новое предложение", description: "Описание предложения для публичной страницы.", discountLabel: "-10%", status: "draft", publicVisible: true }); setOpen(false); showToast("Предложение создано"); }}>Создать draft</Button></Modal>
    </PageShell>
  );
}

export function PackagesPage() {
  const { selectedBusinessId, programs } = useDemoStore();
  const list = programs.filter((item) => item.businessId === selectedBusinessId && item.type === "subscription");
  return <PageShell title="Пакеты и подписки" text="Старые memberships и подписки отображаются как модуль повторных продаж." action={<LinkButton href="/dashboard/programs/new"><Plus className="h-4 w-4" />Создать продукт</LinkButton>}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((program) => <Card key={program.id} className="p-5"><h2 className="font-semibold">{program.name}</h2><p className="mt-2 text-sm text-slate-500">{program.description}</p><p className="mt-5 text-2xl font-semibold">{formatMoney(program.priceCents ?? 0)}</p><p className="mt-1 text-sm text-slate-500">{program.includedUses} × {program.includedService}</p><div className="mt-4"><StatusBadge status={program.status} /></div></Card>)}</div>{list.length === 0 ? <EmptyState title="Пакеты не добавлены" text="Бизнес может использовать кабинет, услуги и лояльность без платных подписок." /> : null}</PageShell>;
}

export function ClientPortalSettingsPage() {
  const { selectedBusinessId, businesses, programs } = useDemoStore();
  const { services, offers } = useBusinessSpaceStore();
  const business = businesses.find((item) => item.id === selectedBusinessId);
  return <PageShell title="Клиентский кабинет" text="Это персональное пространство существующего клиента. Оно отличается от публичной страницы для новых клиентов."><div className="grid gap-6 xl:grid-cols-[1fr_360px]"><Card className="p-5"><h2 className="font-semibold">Включённые модули</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><ModuleRow icon={Gift} title="Лояльность" enabled={programs.some((item) => item.businessId === selectedBusinessId && item.type === "loyalty")} /><ModuleRow icon={Sparkles} title="Предложения" enabled={offers.some((item) => item.businessId === selectedBusinessId)} /><ModuleRow icon={ReceiptText} title="Услуги" enabled={services.some((item) => item.businessId === selectedBusinessId)} /><ModuleRow icon={WalletCards} title="Wallet" enabled /></div></Card><Card className="bg-[#121320] p-5 text-white"><p className="text-sm text-slate-300">{business?.name}</p><h2 className="mt-4 text-2xl font-semibold">Anna, ваш кабинет</h2><p className="mt-2 text-sm text-slate-300">Награды, услуги, предложения и MemberFlow Pass.</p></Card></div></PageShell>;
}

export function WalletPage() {
  const { selectedBusinessId, businesses, programs } = useDemoStore();
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const enabled = programs.some((item) => item.businessId === selectedBusinessId);
  return <PageShell title="Wallet" text="Wallet — дополнительный канал быстрого доступа к клиентскому кабинету, а не центр продукта."><Card className="grid gap-0 overflow-hidden xl:grid-cols-[320px_1fr]"><div className="bg-[#121320] p-6 text-white"><WalletCards className="h-8 w-8 text-violet-200" /><h2 className="mt-5 text-2xl font-semibold">MemberFlow Pass</h2><p className="mt-2 text-sm text-slate-300">Один клиентский QR для всех программ.</p></div><div className="p-6"><StatusBadge status={enabled ? "active" : "paused"} label={enabled ? "Готово" : "Модуль не выбран"} /><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label="Добавлений" value={enabled ? "184" : "0"} /><Metric label="Ошибки" value="0" /><Metric label="Бизнес" value={business?.name ?? "-"} /></div><p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Ошибка Wallet не блокирует dashboard, публичную страницу, клиентский кабинет или лояльность.</p></div></Card></PageShell>;
}

export function QrMaterialsPage() {
  const { selectedBusinessId, programs } = useDemoStore();
  const { businessPages } = useBusinessSpaceStore();
  const page = businessPages.find((item) => item.businessId === selectedBusinessId);
  const program = programs.find((item) => item.businessId === selectedBusinessId);
  return <PageShell title="QR-коды и материалы" text="QR-коды разделены по назначению, чтобы не путать публичную страницу и регистрацию клиента."><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><QrCard title="Открыть страницу бизнеса" text="Для сайта, соцсетей и визиток." value={`https://memberflow.demo/b/${page?.slug ?? "business"}`} /><QrCard title="Зарегистрироваться в программе клиента" text="Для стойки и A4-плаката." value={`https://memberflow.demo/join/${program?.id ?? "program"}`} /><QrCard title="Вход в кабинет клиента" text="Персональная ссылка клиента, не публичная аналитика." value="https://memberflow.demo/customer/cards" /></div></PageShell>;
}

export function ComingSoonPage({ title, text }: { title: string; text: string }) {
  return <PageShell title={title} text={text}><Card className="p-8 text-center"><BellRing className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 text-xl font-semibold">Coming soon</h2><p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">Раздел не показан как полностью рабочий, потому что соответствующая серверная логика ещё не подключена.</p></Card></PageShell>;
}

function PageShell({ title, text, action, children }: { title: string; text: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{text}</p></div>{action}</div>{children}</div>;
}

function ServiceCard({ service, onToggle, onPopular }: { service: ServiceItem; onToggle: () => void; onPopular: () => void }) {
  return <Card className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{service.name}</h2><StatusBadge status={service.visible ? "active" : "paused"} label={service.visible ? "Публичная" : "Скрыта"} /></div><p className="mt-2 text-sm text-slate-500">{service.description}</p><p className="mt-4 text-xl font-semibold">{service.pricePrefix === "from" ? "от " : ""}{formatMoney(service.priceCents)}</p><p className="mt-1 text-xs text-slate-500">{service.durationMinutes} мин · {service.category}</p><div className="mt-4 flex gap-2"><Button variant="secondary" onClick={onToggle}>{service.visible ? "Скрыть" : "Показать"}</Button><Button variant="ghost" onClick={onPopular}>{service.popular ? "Убрать popular" : "Popular"}</Button></div></Card>;
}

function ActivityTable({ operations, customers, programs }: { operations: ReturnType<typeof useDemoStore.getState>["operations"]; customers: ReturnType<typeof useDemoStore.getState>["customers"]; programs: ReturnType<typeof useDemoStore.getState>["programs"] }) {
  return <Card className="overflow-hidden"><CardHeader title="История посещений и операций" /><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Дата</th><th className="p-4">Клиент</th><th className="p-4">Программа</th><th className="p-4">Операция</th><th className="p-4">Статус</th></tr></thead><tbody>{operations.map((op) => <tr key={op.id} className="border-t border-slate-100"><td className="p-4">{formatDateTime(op.date)}</td><td className="p-4">{customers.find((item) => item.id === op.customerId)?.name}</td><td className="p-4">{programs.find((item) => item.id === op.programId)?.name}</td><td className="p-4">{op.change}</td><td className="p-4"><StatusBadge status={op.status} /></td></tr>)}</tbody></table></div></Card>;
}

function QrCard({ title, text, value }: { title: string; text: string; value: string }) {
  return <Card className="p-5 text-center"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-slate-500">{text}</p><div className="mt-5 flex justify-center rounded-2xl bg-slate-50 p-4"><QrCodeBox label={title} value={value} size={140} /></div><div className="mt-4 flex gap-2"><Button variant="secondary" className="flex-1"><QrCode className="h-4 w-4" />PNG</Button><Button variant="secondary" className="flex-1">Печать</Button></div></Card>;
}

function ModuleRow({ icon: Icon, title, enabled }: { icon: typeof Gift; title: string; enabled: boolean }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4"><span className="flex items-center gap-3"><Icon className="h-5 w-5 text-[var(--primary)]" /><b>{title}</b></span><span className={enabled ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-slate-400"}>{enabled ? "Включено" : "Отключено"}</span></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-sm font-medium">{label}{children}</label>;
}
