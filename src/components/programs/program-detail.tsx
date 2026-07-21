"use client";

import { ArrowLeft, Copy, FileImage, MapPin, Palette, Pause, QrCode, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export function ProgramDetailPage({ programId }: { programId: string }) {
  const { businesses, programs, customers, operations, updateProgramStatus, duplicateProgram } = useDemoStore();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const program = programs.find((item) => item.id === programId);
  const business = businesses.find((item) => item.id === program?.businessId);

  if (!program) {
    return (
      <Card className="p-8">
        <CardHeader title="Программа не найдена" description="Вернитесь к списку программ и выберите существующую программу." />
        <LinkButton href="/dashboard/programs" className="mt-4"><ArrowLeft className="h-4 w-4" />К программам</LinkButton>
      </Card>
    );
  }

  const programCustomers = customers.filter((customer) => customer.subscriptionProgramId === program.id || customer.loyaltyProgramId === program.id);
  const programOperations = operations.filter((operation) => operation.programId === program.id).slice(0, 8);
  const branches = program.allBranches === false ? (business?.branches ?? []).slice(0, 1) : business?.branches ?? [];
  const isSubscription = program.type === "subscription";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <LinkButton href="/dashboard/programs" variant="secondary" className="mb-4"><ArrowLeft className="h-4 w-4" />К программам</LinkButton>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{program.name}</h1>
            <StatusBadge status={program.status} />
            <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">{isSubscription ? "Платная подписка" : "Карта лояльности"}</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{program.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={`/dashboard/programs/${program.id}/card-design`} variant="secondary"><Palette className="h-4 w-4" />Дизайн программы</LinkButton>
          <LinkButton href={`/dashboard/programs/${program.id}/materials`} variant="secondary"><FileImage className="h-4 w-4" />Материалы</LinkButton>
          <Button variant="secondary" onClick={() => updateProgramStatus(program.id, program.status === "paused" ? "active" : "paused")}><Pause className="h-4 w-4" />{program.status === "paused" ? "Возобновить" : "Пауза"}</Button>
          <Button variant="secondary" onClick={() => duplicateProgram(program.id)}><Copy className="h-4 w-4" />Дублировать</Button>
          <Button variant="danger" onClick={() => setConfirmArchive(true)}><Trash2 className="h-4 w-4" />Архив</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label={isSubscription ? "Подписчики" : "Активные карты"} value={String(program.customers)} />
        <Metric label={isSubscription ? "MRR" : "Штампы выданы"} value={isSubscription ? formatMoney(program.mrrCents) : String(program.stampsIssued ?? 0)} />
        <Metric label={isSubscription ? "Цена" : "Доступные награды"} value={isSubscription ? `${formatMoney(program.priceCents ?? 0)} / мес` : String(program.rewardsAvailable ?? 0)} />
        <Metric label={isSubscription ? "Включено услуг" : "Награды использованы"} value={isSubscription ? String(program.includedUses ?? 0) : String(program.rewardsRedeemed ?? 0)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden shadow-[var(--shadow-md)]">
          <CardHeader title={isSubscription ? "Условия подписки" : "Условия карты лояльности"} description="Эти параметры видны владельцу бизнеса и используются в demo-сценариях обслуживания." />
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {isSubscription ? (
              <>
                <Info label="Услуга" value={program.includedService ?? "Услуга"} />
                <Info label="Лимит" value={`${program.includedUses ?? 0} использований / месяц`} />
                <Info label="Перенос остатка" value={program.rollover ? `Да, до ${program.maxRollover ?? 0}` : "Нет"} />
                <Info label="Скидка на доп. услуги" value={`${program.extraDiscountPercent ?? 0}%`} />
                <Info label="Правила отмены" value={program.cancellationRules ?? "Не указано"} />
                <Info label="Действует во всех точках" value={program.allBranches === false ? "Нет" : "Да"} />
              </>
            ) : (
              <>
                <Info label="Механика" value={program.loyaltyMechanic === "visits" ? "N посещений → награда" : "N покупок → награда"} />
                <Info label="Требуется" value={`${program.targetCount ?? 0} штампов`} />
                <Info label="Награда" value={program.rewardName ?? "Награда"} />
                <Info label="Срок штампов" value={`${program.stampExpiryDays ?? 0} дней`} />
                <Info label="Повторять цикл" value={program.repeatable ? "Да" : "Нет"} />
                <Info label="Участники в таблице" value={String(programCustomers.length)} />
              </>
            )}
          </div>
        </Card>

        <Card className="p-5 shadow-[var(--shadow-md)]">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]"><MapPin className="h-4 w-4" />Точки действия</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {branches.map((branch) => <span key={branch} className="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-[var(--border)]">{branch}</span>)}
          </div>
          <div className="mt-6 rounded-2xl bg-[var(--primary-soft)] p-4">
            <p className="flex items-center gap-2 font-semibold"><QrCode className="h-4 w-4 text-[var(--primary)]" />QR для подключения</p>
            <p className="mt-1 text-sm text-slate-600">Клиенты сканируют плакат и подключаются по ссылке:</p>
            <p className="mt-2 break-all text-sm font-semibold text-[var(--primary)]">{program.type === "subscription" ? `/subscribe/${program.id}` : `/join/${program.id}`}</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Последние операции программы" />
        <div className="space-y-0 p-3">
          {programOperations.length ? programOperations.map((operation) => {
            const customer = customers.find((item) => item.id === operation.customerId);
            return (
              <div key={operation.id} className="grid gap-2 rounded-2xl p-3 text-sm transition hover:bg-slate-50 sm:grid-cols-[1.2fr_0.9fr_0.9fr_auto] sm:items-center">
                <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]"><Users className="h-4 w-4" /></span><b>{customer?.name ?? "Клиент"}</b></div>
                <span>{operation.change}</span>
                <span className="text-slate-500">{formatDateTime(operation.date)}</span>
                <StatusBadge status={operation.status} />
              </div>
            );
          }) : <div className="p-6 text-sm text-slate-500">По программе пока нет операций.</div>}
        </div>
      </Card>

      <ConfirmModal open={confirmArchive} title="Архивировать программу" text="Это destructive demo-действие изменит статус программы на archived." onClose={() => setConfirmArchive(false)} onConfirm={() => updateProgramStatus(program.id, "archived")} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p></Card>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{value}</p></div>;
}
