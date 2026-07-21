"use client";

import { ArrowRight, Building2, Check, CreditCard, Gift, MapPin, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLogo, BrandMark } from "@/components/ui/brand-logo";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode } from "@/components/ui/qr-code";
import { formatDate, formatMoney } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import type { ProgramType } from "@/types";

const customerToken = "mfp_c_8f3k29x7";
const customerNumber = "MF-000184";

export function ProgramSignupPage({ programId, mode }: { programId: string; mode: ProgramType }) {
  const { businesses, programs, customers, operations, showToast } = useDemoStore();
  const [joined, setJoined] = useState(false);
  const program = programs.find((item) => item.id === programId);
  const business = businesses.find((item) => item.id === program?.businessId);
  const customer = customers.find((item) => item.token === customerToken && item.businessId === program?.businessId);
  const recent = useMemo(() => operations.filter((item) => item.customerId === customer?.id).slice(0, 3), [customer?.id, operations]);

  if (!program || !business || program.type !== mode) {
    return (
      <main className="brand-grid min-h-screen bg-[var(--background)] px-4 py-8">
        <div className="mx-auto max-w-xl">
          <BrandLogo size="sm" />
          <Card className="mt-8 p-8 text-center shadow-[var(--shadow-md)]">
            <h1 className="text-2xl font-semibold">Программа не найдена</h1>
            <p className="mt-2 text-sm text-slate-500">Проверьте ссылку на QR-плакате или выберите другую demo-программу.</p>
            <LinkButton href="/" className="mt-6">На главную</LinkButton>
          </Card>
        </div>
      </main>
    );
  }

  const isSubscription = program.type === "subscription";
  const joinUrl = isSubscription ? `/subscribe/${program.id}` : `/join/${program.id}`;
  const title = isSubscription ? "Подключите подписку" : "Получите карту лояльности";
  const actionLabel = isSubscription ? "Оформить подписку" : "Присоединиться";
  const passText = customer ? "У Anna Ozola уже есть MemberFlow Pass. После подключения программа появится в разделе “Мои карты”." : "После подключения клиенту будет предложено добавить единую карту MemberFlow в Apple Wallet или Google Wallet.";

  function completeJoin() {
    setJoined(true);
    showToast(isSubscription ? "Подписка добавлена в Мои карты" : "Карта лояльности добавлена в Мои карты");
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo size="sm" />
          <Link href="/customer/cards" className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]">Мои карты</Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:py-12">
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-[var(--primary)]/20 blur-3xl" />
        <div className="absolute -left-24 bottom-20 h-80 w-80 rounded-full bg-violet-200/45 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card className="overflow-hidden p-6 shadow-[var(--shadow-lg)] sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-black text-white shadow-[var(--shadow-sm)]" style={{ backgroundColor: business.brandColor }}>{business.name[0]}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">{business.name} · {business.category}</p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{title}: {program.name}</h1>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">{program.description}</p>

              <div className="mt-7 grid gap-3 md:grid-cols-3">
                <InfoTile icon={MapPin} label="Точки" value={(business.branches.length ? business.branches : ["Main"]).join(", ")} />
                <InfoTile icon={isSubscription ? CreditCard : Gift} label={isSubscription ? "Стоимость" : "Механика"} value={isSubscription ? `${formatMoney(program.priceCents ?? 0)} / месяц` : `${program.targetCount ?? 5} визитов → награда`} />
                <InfoTile icon={ShieldCheck} label="Статус" value="Active" />
              </div>

              <div className="mt-7 rounded-[26px] bg-slate-50 p-5">
                <h2 className="font-semibold">Условия программы</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {isSubscription ? (
                    <>
                      <Condition label="Включено" value={`${program.includedUses ?? 0} × ${program.includedService ?? "услуга"} каждый месяц`} />
                      <Condition label="Следующее обновление" value={formatDate(customer?.nextRenewal ?? "2026-08-01")} />
                      <Condition label="Перенос остатка" value={program.rollover ? `Да, до ${program.maxRollover ?? 0} использований` : "Нет"} />
                      <Condition label="Отмена" value={program.cancellationRules ?? "До следующего платежа"} />
                    </>
                  ) : (
                    <>
                      <Condition label="Прогресс" value={`${customer?.stamps ?? 0} из ${program.targetCount ?? 5} штампов`} />
                      <Condition label="Награда" value={program.rewardName ?? "Награда"} />
                      <Condition label="Срок штампов" value={`${program.stampExpiryDays ?? 90} дней`} />
                      <Condition label="Повторный цикл" value={program.repeatable ? "Да" : "Нет"} />
                    </>
                  )}
                </div>
              </div>

              {joined ? (
                <div className="animate-fade-up mt-7 rounded-[26px] border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-5 w-5" /></span>
                    <div>
                      <h2 className="font-semibold text-emerald-950">Программа подключена</h2>
                      <p className="mt-1 text-sm text-emerald-800">Она появилась в “Мои карты”. Покажите QR клиента сотруднику во время визита.</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <LinkButton href="/customer/cards">Открыть Мои карты</LinkButton>
                        <Button variant="secondary" onClick={() => showToast("Клиент добавляет одну карту MemberFlow в Wallet и использует её во всех подключённых программах.")}>Добавить MemberFlow Pass</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={completeJoin} className="min-h-12 px-5">{actionLabel}<ArrowRight className="h-4 w-4" /></Button>
                  <LinkButton href="/customer/cards" variant="secondary" className="min-h-12">Посмотреть пример клиента</LinkButton>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-semibold"><Smartphone className="h-5 w-5 text-[var(--primary)]" />Как это будет работать</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {["Клиент подключается по QR-плакату", "Программа появляется в разделе “Мои карты”", "Сотрудник сканирует единый QR клиента"].map((item, index) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm"><b className="text-[var(--primary)]">{index + 1}.</b><p className="mt-2 text-slate-600">{item}</p></div>)}
              </div>
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <section className="rounded-[32px] bg-white p-4 shadow-[0_22px_70px_rgba(18,19,32,0.12)]">
              <div className="rounded-[30px] bg-[#121320] p-5 text-white shadow-[0_18px_56px_rgba(18,19,32,0.2)]">
                <div className="flex items-center gap-3">
                  <BrandMark className="h-12 w-12 rounded-2xl" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">MemberFlow Pass</p>
                    <h2 className="text-xl font-semibold">Anna Ozola</h2>
                  </div>
                </div>
                <p className="mt-6 text-2xl font-semibold">{customerNumber}</p>
                <p className="mt-1 text-sm text-white/60">{passText}</p>
                <div className="mt-5 rounded-[24px] bg-white p-4">
                  <QrCode value={`memberflow:customer:${customerToken}`} label="QR клиента" size={170} />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm font-bold text-white/70">
                  <span>QR клиента</span>
                  <span>Мои карты →</span>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">Этот QR одинаковый для всех программ. Сотрудник увидит только данные своего бизнеса.</p>
            </section>

            <Card className="p-5">
              <h3 className="flex items-center gap-2 font-semibold"><Building2 className="h-5 w-5 text-[var(--primary)]" />QR для подключения</h3>
              <p className="mt-2 text-sm text-slate-500">Именно этот URL зашит в A4-плакат для стойки.</p>
              <p className="mt-3 break-all rounded-2xl bg-[var(--primary-soft)] p-3 text-sm font-semibold text-[var(--primary)]">{joinUrl}</p>
            </Card>

            {recent.length ? <Card className="p-5">
              <h3 className="font-semibold">Последние действия Anna</h3>
              <div className="mt-3 space-y-2">
                {recent.map((item) => <div key={item.id} className="flex justify-between gap-3 border-b border-slate-100 pb-2 text-sm last:border-0"><span>{item.change}</span><span className="text-slate-500">{formatDate(item.date)}</span></div>)}
              </div>
            </Card> : null}
          </aside>
        </div>
      </section>
    </main>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><Icon className="h-5 w-5 text-[var(--primary)]" /><p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}

function Condition({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{value}</p></div>;
}
