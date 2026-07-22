"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Copy, Gift, Globe2, QrCode, ReceiptText, Sparkles, Users, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { PlanUpgradeModal } from "@/components/billing/plan-upgrade-modal";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { QrCode as QrCodeBox } from "@/components/ui/qr-code";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { useBusinessSpaceStore } from "@/store/business-space-store";
import { staticData, useDemoStore } from "@/store/demo-store";

export function BusinessDashboard() {
  const { selectedBusinessId, businesses, programs, customers, operations, workers, updateBusinessPlan, showToast } = useDemoStore();
  const { services, offers, businessPages } = useBusinessSpaceStore();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const page = businessPages.find((item) => item.businessId === selectedBusinessId);
  const bizPrograms = programs.filter((program) => program.businessId === selectedBusinessId);
  const bizCustomers = customers.filter((customer) => customer.businessId === selectedBusinessId);
  const bizWorkers = workers.filter((worker) => worker.businessId === selectedBusinessId);
  const bizServices = services.filter((service) => service.businessId === selectedBusinessId);
  const bizOffers = offers.filter((offer) => offer.businessId === selectedBusinessId);
  const recent = operations.filter((op) => op.businessId === selectedBusinessId).slice(0, 6);
  const publicUrl = page ? `/b/${page.slug}` : "/dashboard/business-page";
  const attention = useMemo(() => getAttentionItems({
    hasLogo: Boolean(business?.logoDataUrl),
    services: bizServices.length,
    pagePublished: page?.status === "published",
    loyaltyEnabled: bizPrograms.some((program) => program.type === "loyalty"),
    workers: bizWorkers.length,
    branches: business?.branches.length ?? 0,
    walletEnabled: bizPrograms.length > 0,
  }), [business?.logoDataUrl, business?.branches.length, bizPrograms, bizServices.length, bizWorkers.length, page?.status]);
  const planUsage = getPlanUsage({
    plan: business?.plan ?? "Complete",
    activeClients: Math.max(bizCustomers.length, bizPrograms.reduce((sum, item) => sum + item.customers, 0)),
    programs: bizPrograms.length,
    branches: business?.branches.length ?? 1,
    workers: bizWorkers.length,
  });
  const visitsThisMonth = recent.length;
  const rewardsAvailable = bizCustomers.reduce((sum, customer) => sum + customer.rewards, 0);
  const activeSubscriptions = bizCustomers.filter((customer) => customer.subscriptionProgramId).length;
  const repeatedCustomers = bizCustomers.filter((customer) => customer.stamps > 1 || customer.remainingUses < customer.includedUses).length;
  const revenue = staticData.payments.filter((payment) => payment.businessId === selectedBusinessId && payment.status === "paid").reduce((sum, payment) => sum + payment.amountCents, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="relative overflow-hidden bg-[#121320] p-6 text-white shadow-[var(--shadow-lg)]">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[var(--primary)]/35 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Business space</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{business?.name ?? "Business"}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Управляйте клиентами, услугами, публичной страницей, лояльностью и повторными продажами из одного пространства.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge status={business?.status ?? "trial"} />
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-violet-100">{page?.status === "published" ? "Страница опубликована" : "Черновик страницы"}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <LinkButton href={publicUrl} variant="secondary"><Globe2 className="h-4 w-4" />Открыть страницу</LinkButton>
              <LinkButton href={attention[0]?.href ?? "/dashboard/services"}><ArrowRight className="h-4 w-4" />{attention[0]?.cta ?? "Добавить услугу"}</LinkButton>
            </div>
          </div>
        </Card>
        <ClientPortalMiniPreview businessName={business?.name ?? "Business"} brandColor={business?.brandColor ?? "#6D5DFB"} services={bizServices.length} offers={bizOffers.length} rewards={rewardsAvailable} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Всего клиентов" value={String(bizCustomers.length)} helper={`${repeatedCustomers} повторных`} />
        <StatCard label="Активные клиенты" value={String(bizCustomers.filter((customer) => customer.status === "active").length)} helper="по текущему бизнесу" />
        <StatCard label="Посещения" value={String(visitsThisMonth)} helper="по последним операциям" />
        <StatCard label="Повторные продажи" value={revenue > 0 ? formatMoney(revenue) : "Нет платежей"} helper={activeSubscriptions ? `${activeSubscriptions} подписок` : "платежи не подключены"} />
      </div>

      <PlanLimitsCard planName={business?.plan ?? "Complete"} usage={planUsage} onChangePlan={() => setUpgradeOpen(true)} />
      {business ? <PlanUpgradeModal open={upgradeOpen} currentPlan={business.plan} usage={{ clients: planUsage[0]?.value ?? 0, programs: planUsage[1]?.value ?? 0, branches: planUsage[2]?.value ?? 0, workers: planUsage[3]?.value ?? 0 }} onClose={() => setUpgradeOpen(false)} onConfirm={(plan) => updateBusinessPlan(business.id, plan)} /> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden shadow-[var(--shadow-md)]">
          <CardHeader title="Требует внимания" description="Ненавязчивый checklist настройки бизнес-пространства." />
          <div className="space-y-2 p-4">
            {attention.map((item) => <SetupTask key={item.title} {...item} />)}
            {attention.length === 0 ? <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Базовая настройка завершена. Checklist скрывается, когда все пункты выполнены.</div> : null}
          </div>
        </Card>
        <Card className="overflow-hidden shadow-[var(--shadow-md)]">
          <CardHeader title="Быстрые действия" description="Действия для стойки, роста и публичной страницы." />
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <QuickAction href="/dashboard/customers" icon={Users} title="Добавить или найти клиента" />
            <QuickAction href="/dashboard/visits" icon={ReceiptText} title="Зарегистрировать посещение" />
            <QuickAction href="/dashboard/loyalty" icon={Gift} title="Начислить штамп или награду" />
            <QuickAction href="/dashboard/offers" icon={Sparkles} title="Создать предложение" />
            <button type="button" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}${publicUrl}`); showToast("Публичная ссылка скопирована"); }} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"><Copy className="h-5 w-5 text-[var(--primary)]" />Скопировать публичную ссылку</button>
            <QuickAction href="/dashboard/qr" icon={QrCode} title="Показать QR-коды" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Последняя активность" description="События собраны из существующей истории операций." />
          <div className="space-y-0 p-3">
            {recent.map((op) => {
              const customer = bizCustomers.find((item) => item.id === op.customerId);
              const program = bizPrograms.find((item) => item.id === op.programId);
              return <div key={op.id} className="grid gap-2 rounded-2xl p-3 text-sm transition hover:bg-slate-50 sm:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] sm:items-center"><div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_0_5px_rgba(109,93,251,0.12)]" /><b>{customer?.name ?? "Клиент"}</b></div><span className="text-slate-500">{program?.name ?? "Business space"}</span><span>{op.change}</span><span className="text-slate-500">{formatDateTime(op.date)}</span><StatusBadge status={op.status} /></div>;
            })}
            {recent.length === 0 ? <div className="p-6 text-center text-sm text-slate-500">Первые посещения и начисления появятся здесь.</div> : null}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-semibold">QR регистрации</h2>
          <p className="mt-1 text-sm text-slate-500">Клиенты сканируют QR, чтобы попасть в клиентский кабинет бизнеса.</p>
          <div className="mt-5 flex justify-center rounded-[28px] bg-slate-50 p-6"><QrCodeBox label="QR регистрации клиента" value={`https://memberflow.demo/join/${bizPrograms[0]?.id ?? selectedBusinessId}`} size={170} /></div>
          <LinkButton href="/dashboard/qr" className="mt-5 w-full" variant="secondary"><QrCode className="h-4 w-4" />Открыть материалы</LinkButton>
        </Card>
      </div>
    </div>
  );
}

function ClientPortalMiniPreview({ businessName, brandColor, services, offers, rewards }: { businessName: string; brandColor: string; services: number; offers: number; rewards: number }) {
  return (
    <Card className="h-fit overflow-hidden p-4 shadow-[var(--shadow-md)]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Preview клиентского кабинета</p>
      <div className="mt-4 rounded-[28px] bg-[#121320] p-4 text-white">
        <div className="rounded-[22px] p-4" style={{ background: `linear-gradient(135deg, ${brandColor}, #121320)` }}>
          <p className="text-sm text-white/70">{businessName}</p>
          <h3 className="mt-2 text-xl font-semibold">Anna, добро пожаловать</h3>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <span className="rounded-2xl bg-white/10 p-3"><b className="block text-lg">{services}</b>услуг</span>
          <span className="rounded-2xl bg-white/10 p-3"><b className="block text-lg">{offers}</b>акций</span>
          <span className="rounded-2xl bg-white/10 p-3"><b className="block text-lg">{rewards}</b>наград</span>
        </div>
      </div>
    </Card>
  );
}

function SetupTask({ title, href, cta, done }: { title: string; href: string; cta: string; done: boolean }) {
  return <LinkButton href={href} variant="secondary" className="w-full justify-start bg-white text-left"><span className={done ? "grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600" : "grid h-8 w-8 place-items-center rounded-full bg-amber-50 text-amber-600"}>{done ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><span className="block truncate">{title}</span><span className="block text-xs font-medium text-slate-500">{cta}</span></span></LinkButton>;
}

function QuickAction({ href, icon: Icon, title }: { href: string; icon: typeof Users; title: string }) {
  return <LinkButton href={href} variant="secondary" className="justify-start bg-white text-left"><Icon className="h-5 w-5 text-[var(--primary)]" />{title}</LinkButton>;
}

type LimitItem = { label: string; value: number; limit: number | null; icon: typeof Users };

function PlanLimitsCard({ planName, usage, onChangePlan }: { planName: string; usage: LimitItem[]; onChangePlan: () => void }) {
  const highestUsage = Math.max(...usage.map((item) => getLimitPercent(item)));
  const stateLabel = highestUsage >= 100 ? "Лимит превышен" : highestUsage >= 80 ? "Скоро нужен апгрейд" : "В пределах тарифа";
  return (
    <Card className="overflow-hidden shadow-[var(--shadow-md)]">
      <div className="grid gap-0 xl:grid-cols-[300px_1fr]">
        <div className="relative overflow-hidden bg-[#121320] p-5 text-white">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--primary)]/35 blur-3xl" />
          <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Текущий тариф</p>
          <h2 className="relative mt-3 text-3xl font-semibold tracking-tight">{planName}</h2>
          <p className="relative mt-2 text-sm text-slate-300">{stateLabel}</p>
          <Button variant="secondary" className="relative mt-4 min-h-9 rounded-full px-3 py-1.5 text-xs" onClick={onChangePlan}>Сменить тариф</Button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">{usage.map((item) => <LimitProgress key={item.label} item={item} />)}</div>
      </div>
    </Card>
  );
}

function LimitProgress({ item }: { item: LimitItem }) {
  const percent = getLimitPercent(item);
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-sm font-semibold">{item.label}</p>
      <p className="mt-1 text-xs text-slate-500">{item.limit === null ? `${item.value} / без лимита` : `${item.value.toLocaleString("ru-RU")} / ${item.limit.toLocaleString("ru-RU")}`}</p>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white"><span className="block h-full rounded-full bg-[var(--primary)]" style={{ width: `${item.limit === null ? 18 : Math.min(100, percent)}%` }} /></div>
    </div>
  );
}

function getLimitPercent(item: LimitItem) {
  if (!item.limit) return 0;
  return (item.value / item.limit) * 100;
}

function getPlanUsage({ plan, activeClients, programs, branches, workers }: { plan: string; activeClients: number; programs: number; branches: number; workers: number }): LimitItem[] {
  const limits = {
    Loyalty: { clients: 300, programs: 1, branches: 1, workers: 2 },
    Membership: { clients: 1500, programs: 5, branches: 3, workers: 10 },
    Complete: { clients: 5000, programs: 15, branches: 10, workers: null },
  }[plan] ?? { clients: 300, programs: 1, branches: 1, workers: 2 };
  return [
    { label: "Клиенты", value: activeClients, limit: limits.clients, icon: Users },
    { label: "Модули", value: programs, limit: limits.programs, icon: WalletCards },
    { label: "Точки", value: branches, limit: limits.branches, icon: Globe2 },
    { label: "Сотрудники", value: workers, limit: limits.workers, icon: Users },
  ];
}

function getAttentionItems(input: { hasLogo: boolean; services: number; pagePublished: boolean; loyaltyEnabled: boolean; workers: number; branches: number; walletEnabled: boolean }) {
  return [
    { title: "Загрузите логотип", href: "/dashboard/settings", cta: "Оформить бренд бизнеса", done: input.hasLogo },
    { title: "Добавьте первую услугу", href: "/dashboard/services", cta: "Услуги появятся на странице и в кабинете", done: input.services > 0 },
    { title: "Опубликуйте страницу бизнеса", href: "/dashboard/business-page", cta: "Получить публичную ссылку", done: input.pagePublished },
    { title: "Настройте лояльность", href: "/dashboard/loyalty", cta: "Возвращать клиентов наградами", done: input.loyaltyEnabled },
    { title: "Добавьте сотрудника", href: "/dashboard/team", cta: "Дать доступ стойке", done: input.workers > 0 },
    { title: "Проверьте точки бизнеса", href: "/dashboard/settings", cta: "Филиалы и адреса", done: input.branches > 0 },
    { title: "Проверьте Wallet", href: "/dashboard/wallet", cta: "Дополнительный канал доступа", done: input.walletEnabled },
  ].filter((item) => !item.done);
}
