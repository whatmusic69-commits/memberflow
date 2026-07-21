"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, BadgeEuro, Building2, Gift, Layers3, MapPin, Plus, QrCode, RefreshCcw, Users } from "lucide-react";
import { useState } from "react";
import { PlanUpgradeModal } from "@/components/billing/plan-upgrade-modal";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { staticData, useDemoStore } from "@/store/demo-store";

export function BusinessDashboard() {
  const { selectedBusinessId, businesses, programs, customers, operations, workers, updateBusinessPlan } = useDemoStore();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const bizPrograms = programs.filter((program) => program.businessId === selectedBusinessId);
  const bizCustomers = customers.filter((customer) => customer.businessId === selectedBusinessId);
  const bizWorkers = workers.filter((worker) => worker.businessId === selectedBusinessId);
  const recent = operations.filter((op) => op.businessId === selectedBusinessId).slice(0, 6);
  const mrr = bizPrograms.reduce((sum, item) => sum + item.mrrCents, 0);
  const loyalty = bizPrograms.filter((item) => item.type === "loyalty");
  const planUsage = getPlanUsage({
    plan: business?.plan ?? "Complete",
    activeClients: Math.max(bizCustomers.length, bizPrograms.reduce((sum, item) => sum + item.customers, 0)),
    programs: bizPrograms.length,
    branches: business?.branches.length ?? 1,
    workers: bizWorkers.length,
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
        <h1 className="text-2xl font-semibold tracking-tight">Обзор бизнеса</h1>
        <p className="text-sm text-slate-500">Подписки, цифровые карты, операции и доход в одном demo-кабинете.</p>
        </div>
        <div className="flex flex-wrap gap-2"><LinkButton href="/dashboard/scanner"><QrCode className="h-4 w-4" />Сканировать QR</LinkButton><LinkButton href="/dashboard/programs/new" variant="secondary"><Plus className="h-4 w-4" />Создать программу</LinkButton></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="relative overflow-hidden bg-[#121320] p-5 text-white shadow-[var(--shadow-lg)] xl:col-span-1">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--primary)]/35 blur-3xl" />
          <p className="relative text-sm text-slate-300">MRR</p>
          <p className="relative mt-2 text-3xl font-semibold tracking-tight">{formatMoney(mrr)}</p>
          <p className="relative mt-2 text-xs font-semibold text-emerald-300">+14% к прошлому месяцу</p>
        </Card>
        <StatCard label="Активные программы" value={String(bizPrograms.filter((item) => item.status === "active").length)} helper="+12% к прошлому месяцу" />
        <StatCard label="Активные подписчики" value={String(bizCustomers.filter((item) => item.subscriptionProgramId).length)} helper="+8%" />
        <StatCard label="Карты лояльности" value={String(bizCustomers.filter((item) => item.loyaltyProgramId).length)} helper="+19%" />
      </div>
      <PlanLimitsCard planName={business?.plan ?? "Complete"} usage={planUsage} onChangePlan={() => setUpgradeOpen(true)} />
      {business ? (
        <PlanUpgradeModal
          open={upgradeOpen}
          currentPlan={business.plan}
          usage={{
            clients: planUsage[0]?.value ?? 0,
            programs: planUsage[1]?.value ?? 0,
            branches: planUsage[2]?.value ?? 0,
            workers: planUsage[3]?.value ?? 0,
          }}
          onClose={() => setUpgradeOpen(false)}
          onConfirm={(plan) => updateBusinessPlan(business.id, plan)}
        />
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-[var(--shadow-md)]">
          <CardHeader title="Доход за 6 месяцев" description="Демо-динамика выручки и аудитории" />
          <div className="h-80 p-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={staticData.chartData}>
                <defs><linearGradient id="rev" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#6D5DFB" stopOpacity={0.3}/><stop offset="95%" stopColor="#6D5DFB" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `€${Number(value) / 1000}`} />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Area dataKey="revenueCents" stroke="#6D5DFB" fill="url(#rev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="shadow-[var(--shadow-md)]">
          <CardHeader title="Участники" description="Подписчики и loyalty-карты" />
          <div className="h-80 p-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={staticData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="subscribers" stroke="#6D5DFB" strokeWidth={3} />
                <Line type="monotone" dataKey="loyalty" stroke="#20B486" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric icon={BadgeEuro} label="Доход за месяц" value={formatMoney(964200)} />
        <MiniMetric icon={Activity} label="Посещения" value="1 284" />
        <MiniMetric icon={Gift} label="Доступные награды" value={String(loyalty.reduce((sum, item) => sum + (item.rewardsAvailable ?? 0), 0))} />
        <MiniMetric icon={RefreshCcw} label="Рост" value="+14,8%" />
      </div>
      <Card className="overflow-hidden">
        <CardHeader title="Последние операции" />
        <div className="space-y-0 p-3">
              {recent.map((op) => {
                const customer = bizCustomers.find((item) => item.id === op.customerId);
                const program = bizPrograms.find((item) => item.id === op.programId);
                return <div key={op.id} className="grid gap-2 rounded-2xl p-3 text-sm transition hover:bg-slate-50 sm:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] sm:items-center"><div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_0_5px_rgba(109,93,251,0.12)]" /><b>{customer?.name}</b></div><span className="text-slate-500">{program?.name}</span><span>{op.change}</span><span className="text-slate-500">{formatDateTime(op.date)}</span><StatusBadge status={op.status} /></div>;
              })}
        </div>
      </Card>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <Card className="flex items-center gap-4 p-4"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#F0EDFF] text-[#6D5DFB]"><Icon className="h-5 w-5" /></span><span><p className="text-xs text-slate-500">{label}</p><p className="font-semibold">{value}</p></span></Card>;
}

type LimitItem = {
  label: string;
  value: number;
  limit: number | null;
  icon: typeof Users;
};

function PlanLimitsCard({ planName, usage, onChangePlan }: { planName: string; usage: LimitItem[]; onChangePlan: () => void }) {
  const highestUsage = Math.max(...usage.map((item) => getLimitPercent(item)));
  const stateLabel = highestUsage >= 100 ? "Лимит превышен" : highestUsage >= 80 ? "Скоро нужен апгрейд" : "В пределах тарифа";
  return (
    <Card className="overflow-hidden shadow-[var(--shadow-md)]">
      <div className="grid gap-0 xl:grid-cols-[320px_1fr]">
        <div className="relative overflow-hidden bg-[#121320] p-5 text-white">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--primary)]/35 blur-3xl" />
          <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Текущий тариф</p>
          <h2 className="relative mt-3 text-3xl font-semibold tracking-tight">{planName}</h2>
          <p className="relative mt-2 text-sm text-slate-300">Использование лимитов обновляется по demo-данным бизнеса.</p>
          <div className="relative mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/14">{stateLabel}</span>
            <Button variant="secondary" className="min-h-9 rounded-full px-3 py-1.5 text-xs" onClick={onChangePlan}>Сменить тариф</Button>
          </div>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {usage.map((item) => <LimitProgress key={item.label} item={item} />)}
        </div>
      </div>
    </Card>
  );
}

function LimitProgress({ item }: { item: LimitItem }) {
  const Icon = item.icon;
  const percent = getLimitPercent(item);
  const cappedPercent = Math.min(100, percent);
  const tone = percent >= 100 ? "bg-[var(--danger)]" : percent >= 80 ? "bg-[var(--warning)]" : "bg-[var(--primary)]";
  const value = item.limit === null ? `${item.value} / без лимита` : `${item.value.toLocaleString("ru-RU")} / ${item.limit.toLocaleString("ru-RU")}`;
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[var(--primary)] shadow-[var(--shadow-sm)]"><Icon className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{value}</p>
          </div>
        </div>
        {item.limit === null ? <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">∞</span> : <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">{Math.round(percent)}%</span>}
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
        <span className={`block h-full rounded-full ${tone}`} style={{ width: `${item.limit === null ? 18 : cappedPercent}%` }} />
      </div>
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
    { label: "Активные клиенты", value: activeClients, limit: limits.clients, icon: Users },
    { label: "Программы", value: programs, limit: limits.programs, icon: Layers3 },
    { label: "Точки", value: branches, limit: limits.branches, icon: MapPin },
    { label: "Сотрудники", value: workers, limit: limits.workers, icon: Building2 },
  ];
}
