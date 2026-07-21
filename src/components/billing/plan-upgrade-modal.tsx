"use client";

import { Check, Crown, Layers3, Rocket, Store, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn, formatMoney } from "@/lib/utils";
import type { SaaSPlan } from "@/types";

type ScalePlan = "solo" | "business" | "network";

const planMap: Record<ScalePlan, SaaSPlan> = {
  solo: "Loyalty",
  business: "Membership",
  network: "Complete",
};

const reversePlanMap: Record<SaaSPlan, ScalePlan> = {
  Loyalty: "solo",
  Membership: "business",
  Complete: "network",
};

const plans: Record<ScalePlan, { title: string; subtitle: string; priceCents: number; fee: string; icon: typeof Rocket; limits: string[]; accent: string }> = {
  solo: {
    title: "Solo",
    subtitle: "Для одной точки и первого запуска",
    priceCents: 2500,
    fee: "без комиссии для loyalty",
    icon: Rocket,
    limits: ["1 программа", "1 точка", "до 2 сотрудников", "до 300 активных клиентов"],
    accent: "bg-white",
  },
  business: {
    title: "Business",
    subtitle: "Для растущего бизнеса с командой",
    priceCents: 7900,
    fee: "+ 2,5% с клиентских платежей",
    icon: Store,
    limits: ["до 5 программ", "до 3 точек", "до 10 сотрудников", "до 1 500 активных клиентов"],
    accent: "bg-[#121320] text-white",
  },
  network: {
    title: "Network",
    subtitle: "Для сети точек и расширенных лимитов",
    priceCents: 16900,
    fee: "+ 2% с клиентских платежей",
    icon: Crown,
    limits: ["до 15 программ", "до 10 точек", "сотрудники без лимита", "до 5 000 активных клиентов"],
    accent: "bg-white",
  },
};

export function PlanUpgradeModal({ open, currentPlan, usage, onClose, onConfirm }: { open: boolean; currentPlan: SaaSPlan; usage: { clients: number; programs: number; branches: number; workers: number }; onClose: () => void; onConfirm: (plan: SaaSPlan) => void }) {
  const [selected, setSelected] = useState<ScalePlan>(reversePlanMap[currentPlan]);
  const nextPlan = planMap[selected];
  const projected = useMemo(() => getProjectedLimits(selected, usage), [selected, usage]);

  return (
    <Modal open={open} title="Сменить тариф" onClose={onClose} panelClassName="max-w-5xl">
      <div className="space-y-5">
        <p className="text-sm text-slate-600">Выберите масштаб бизнеса. Лимиты пересчитаются сразу, изменения сохраняются в demo-state после подтверждения.</p>
        <div className="grid gap-3 lg:grid-cols-3">
          {(Object.keys(plans) as ScalePlan[]).map((key) => {
            const item = plans[key];
            const Icon = item.icon;
            const active = selected === key;
            const dark = key === "business";
            return (
              <button key={key} type="button" onClick={() => setSelected(key)} className={cn("relative flex min-h-[310px] flex-col rounded-[24px] border p-4 text-left shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--primary)]", item.accent, active ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/18" : "border-[var(--border)]")}>
                {key === "business" ? <span className="absolute right-4 top-4 rounded-full bg-[var(--primary)] px-2.5 py-1 text-xs font-bold text-white">Популярный</span> : null}
                <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", dark ? "bg-white/10 text-violet-200" : "bg-[var(--primary-soft)] text-[var(--primary)]")}><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className={cn("mt-1 text-sm", dark ? "text-slate-300" : "text-slate-500")}>{item.subtitle}</p>
                <p className="mt-4 text-2xl font-semibold">{formatMoney(item.priceCents)} <span className={cn("text-sm font-medium", dark ? "text-slate-300" : "text-slate-500")}>/ месяц</span></p>
                <p className={cn("mt-1 text-xs font-semibold", dark ? "text-violet-200" : "text-[var(--primary)]")}>{item.fee}</p>
                <div className="mt-4 space-y-2">
                  {item.limits.map((limit) => <p key={limit} className={cn("flex gap-2 text-sm", dark ? "text-slate-200" : "text-slate-600")}><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />{limit}</p>)}
                </div>
                {currentPlan === planMap[key] ? <span className={cn("mt-auto pt-4 text-xs font-bold", dark ? "text-violet-200" : "text-[var(--primary)]")}>Текущий тариф</span> : null}
              </button>
            );
          })}
        </div>

        <div className="rounded-[24px] bg-slate-50 p-4">
          <h3 className="font-semibold">Новые лимиты после перехода на {plans[selected].title}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {projected.map((item) => <ProjectedLimit key={item.label} {...item} />)}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button onClick={() => { onConfirm(nextPlan); onClose(); }}>Подтвердить смену тарифа</Button>
        </div>
      </div>
    </Modal>
  );
}

function ProjectedLimit({ icon: Icon, label, value, limit }: { icon: typeof Users; label: string; value: number; limit: number | null }) {
  const percent = limit ? Math.min(100, (value / limit) * 100) : 12;
  const text = limit ? `${value.toLocaleString("ru-RU")} / ${limit.toLocaleString("ru-RU")}` : `${value.toLocaleString("ru-RU")} / без лимита`;
  return (
    <div className="rounded-2xl bg-white p-3 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon className="h-4 w-4" /></span>
        <div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-slate-500">{text}</p></div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-[var(--primary)]" style={{ width: `${percent}%` }} /></div>
    </div>
  );
}

function getProjectedLimits(plan: ScalePlan, usage: { clients: number; programs: number; branches: number; workers: number }) {
  const limits = {
    solo: { clients: 300, programs: 1, branches: 1, workers: 2 },
    business: { clients: 1500, programs: 5, branches: 3, workers: 10 },
    network: { clients: 5000, programs: 15, branches: 10, workers: null },
  }[plan];
  return [
    { label: "Активные клиенты", value: usage.clients, limit: limits.clients, icon: Users },
    { label: "Программы", value: usage.programs, limit: limits.programs, icon: Layers3 },
    { label: "Точки", value: usage.branches, limit: limits.branches, icon: Store },
    { label: "Сотрудники", value: usage.workers, limit: limits.workers, icon: Users },
  ];
}
