"use client";

import { ArrowRight, Check, Coffee, Copy, CreditCard, Edit3, FileImage, Gift, MapPin, Palette, Pause, Plus, Stamp, Trash2, WalletCards } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmModal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import type { Program } from "@/types";

export function ProgramManager() {
  const { selectedBusinessId, businesses, programs, updateProgramStatus, duplicateProgram } = useDemoStore();
  const [confirm, setConfirm] = useState<Program | null>(null);
  const list = programs.filter((program) => program.businessId === selectedBusinessId);
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const branches = business?.branches ?? [];
  const programLimit = getProgramLimit(business?.plan);
  const programUsagePercent = Math.min(100, (list.length / programLimit) * 100);
  const programLimitReached = list.length >= programLimit;
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-semibold">Программы</h1><p className="text-sm text-slate-500">Подписки и карты лояльности можно менять в demo-state.</p></div>
        <LinkButton href="/dashboard/programs/new" className={programLimitReached ? "pointer-events-none opacity-50" : ""}><Plus className="h-4 w-4" />Создать программу</LinkButton>
      </div>
      <Card className="relative overflow-hidden bg-[#121320] p-5 text-white shadow-[var(--shadow-lg)]">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[var(--primary)]/35 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-violet-200 ring-1 ring-white/10"><WalletCards className="h-6 w-6" /></span>
            <div>
              <p className="text-sm font-semibold">Лимит программ по тарифу {business?.plan ?? "Complete"}</p>
              <p className="mt-1 text-sm text-slate-300">{list.length} / {programLimit} программ</p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-violet-100">{Math.round(programUsagePercent)}%</span>
        </div>
        <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-white/12">
          <span className={programLimitReached ? "block h-full rounded-full bg-[var(--warning)]" : "block h-full rounded-full bg-[var(--primary-bright)]"} style={{ width: `${programUsagePercent}%` }} />
        </div>
        {programLimitReached ? <p className="relative mt-3 text-sm font-semibold text-amber-200">Лимит программ достигнут. Чтобы создать новую программу, смените тариф.</p> : null}
      </Card>
      <ProgramGroup title="Платные подписки" branches={branches} programs={list.filter((item) => item.type === "subscription")} onPause={(p) => updateProgramStatus(p.id, p.status === "paused" ? "active" : "paused")} onDuplicate={duplicateProgram} onArchive={setConfirm} />
      <ProgramGroup title="Карты лояльности" branches={branches} programs={list.filter((item) => item.type === "loyalty")} onPause={(p) => updateProgramStatus(p.id, p.status === "paused" ? "active" : "paused")} onDuplicate={duplicateProgram} onArchive={setConfirm} />
      <ConfirmModal open={Boolean(confirm)} title="Архивировать программу" text="Это destructive demo-действие скроет программу из активных сценариев." onClose={() => setConfirm(null)} onConfirm={() => confirm && updateProgramStatus(confirm.id, "archived")} />
    </div>
  );
}

function ProgramGroup({ title, programs, branches, onPause, onDuplicate, onArchive }: { title: string; programs: Program[]; branches: string[]; onPause: (program: Program) => void; onDuplicate: (id: string) => void; onArchive: (program: Program) => void }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {programs.length === 0 ? <EmptyState title="Пока нет программ" text={`В этой группе ещё нет активных demo-программ. Создайте ${title.toLowerCase()}, чтобы увидеть карточку, материалы и действия.`} /> : null}
        {programs.map((program) => (
          <Card key={program.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="font-semibold">{program.name}</h3><p className="mt-1 text-sm text-slate-500">{program.description}</p></div>
              <StatusBadge status={program.status} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Info label={program.type === "subscription" ? "Цена" : "Активные карты"} value={program.type === "subscription" ? `${formatMoney(program.priceCents ?? 0)} / мес` : String(program.customers)} />
              <Info label={program.type === "subscription" ? "MRR" : "Штампы"} value={program.type === "subscription" ? formatMoney(program.mrrCents) : String(program.stampsIssued ?? 0)} />
              <Info label="Клиенты" value={String(program.customers)} />
              <Info label="Награды" value={String(program.rewardsAvailable ?? 0)} />
            </div>
            <div className="mt-4 rounded-2xl bg-[var(--primary-soft)] p-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]"><MapPin className="h-3.5 w-3.5" />Точки действия</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(program.allBranches === false ? branches.slice(0, 1) : branches).map((branch) => <span key={branch} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-[var(--border)]">{branch}</span>)}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <LinkButton href={`/dashboard/programs/${program.id}`} variant="secondary"><Edit3 className="h-4 w-4" />Открыть</LinkButton>
              <LinkButton href={`/dashboard/programs/${program.id}/card-design`} variant="secondary"><Palette className="h-4 w-4" />Дизайн программы</LinkButton>
              <LinkButton href={`/dashboard/programs/${program.id}/materials`} variant="secondary"><FileImage className="h-4 w-4" />Материалы</LinkButton>
              <Button variant="ghost" onClick={() => onPause(program)}><Pause className="h-4 w-4" />{program.status === "paused" ? "Возобновить" : "Пауза"}</Button>
              <Button variant="ghost" onClick={() => onDuplicate(program.id)}><Copy className="h-4 w-4" />Дублировать</Button>
              <Button variant="ghost" onClick={() => onArchive(program)}><Trash2 className="h-4 w-4" />Архив</Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function getProgramLimit(plan?: string) {
  if (plan === "Loyalty") return 1;
  if (plan === "Membership") return 5;
  return 15;
}

export function NewProgramChooser() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Program builder</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Создать программу</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Выберите сценарий запуска. Можно начать с одного продукта и позже добавить второй в этом же кабинете.</p>
        </div>
        <LinkButton href="/dashboard/programs" variant="secondary">Назад к программам</LinkButton>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <CreateProgramCard
          href="/onboarding/subscription"
          icon={<CreditCard className="h-5 w-5" />}
          title="Платная подписка"
          description="Регулярные платежи, включённые услуги и автоматическое обновление лимитов."
          benefits={["MRR", "Автопродление", "QR клиента"]}
          cta="Создать подписку"
          dark
        >
          <div className="rounded-[24px] bg-[#0C0D16] p-5 text-white ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Wash Club</p>
                <p className="mt-1 text-xs text-slate-400">Две комплексные мойки каждый месяц</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-200">Active</span>
            </div>
            <div className="mt-6 flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-3xl font-semibold">€29,99</span>
              <span className="text-sm text-slate-400">/ месяц</span>
            </div>
            <div className="mt-5 rounded-2xl bg-white/8 p-4">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-300">Прогресс месяца</span><b>2 из 2</b></div>
              <div className="mt-3 h-2 rounded-full bg-white/12"><span className="block h-full w-full rounded-full bg-[var(--primary-bright)]" /></div>
            </div>
          </div>
        </CreateProgramCard>

        <CreateProgramCard
          href="/onboarding/loyalty"
          icon={<Stamp className="h-5 w-5" />}
          title="Карта лояльности"
          description="Штампы, награды и повторные визиты без регулярной оплаты клиента."
          benefits={["Награды", "Штампы", "Без комиссии"]}
          cta="Создать карту"
        >
          <div className="rounded-[24px] border border-amber-200 bg-[#FBF8F1] p-5 text-[#121320]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-amber-500 ring-1 ring-amber-200"><Coffee className="h-5 w-5" /></span>
                <div><p className="font-semibold">Coffee Regular</p><p className="text-xs text-slate-500">5 кофе — шестой бесплатно</p></div>
              </div>
              <Gift className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-7 flex gap-3">
              {Array.from({ length: 5 }, (_, index) => <span key={index} className={index < 4 ? "h-10 w-10 rounded-full bg-[var(--primary)] shadow-[0_0_0_5px_rgba(109,93,251,0.1)]" : "h-10 w-10 rounded-full border border-amber-200 bg-white"} />)}
            </div>
            <p className="mt-5 text-sm font-semibold">4 из 5 · ещё один визит до награды</p>
          </div>
        </CreateProgramCard>
      </div>
    </div>
  );
}

function CreateProgramCard({ href, icon, title, description, benefits, cta, children, dark = false }: { href: string; icon: React.ReactNode; title: string; description: string; benefits: string[]; cta: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link href={href} className={dark ? "group relative flex min-h-[520px] flex-col overflow-hidden rounded-[30px] border border-violet-400/20 bg-[#121320] p-7 text-white shadow-[var(--shadow-lg)] transition hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[var(--primary)]" : "group relative flex min-h-[520px] flex-col overflow-hidden rounded-[30px] border border-[var(--border)] bg-white p-7 shadow-[var(--shadow-md)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"}>
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[var(--primary)]/20 blur-3xl" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">{icon}</div>
      <h2 className="relative mt-5 text-2xl font-semibold tracking-tight">{title}</h2>
      <p className={dark ? "relative mt-3 max-w-md text-sm leading-6 text-slate-300" : "relative mt-3 max-w-md text-sm leading-6 text-slate-500"}>{description}</p>
      <div className="relative mt-5 flex flex-wrap gap-2">
        {benefits.map((benefit) => <span key={benefit} className={dark ? "inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10" : "inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-[var(--border)]"}><Check className="h-3.5 w-3.5 text-[var(--success)]" />{benefit}</span>)}
      </div>
      <div className="relative mt-8">{children}</div>
      <div className="relative mt-auto pt-7">
        <span className={dark ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-2 text-sm font-bold text-white shadow-[0_14px_32px_rgba(109,93,251,0.28)] transition group-hover:bg-[var(--primary-hover)]" : "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#121320] px-5 py-2 text-sm font-bold text-white transition group-hover:bg-black"}>
          {cta}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
