"use client";

import { toPng } from "html-to-image";
import { Calendar, Gift, History, Wallet } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/ui/brand-logo";
import { Card } from "@/components/ui/card";
import { QrCode } from "@/components/ui/qr-code";
import { formatDate } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import { getWalletDesignStorageKey, readStoredWalletDesign, type WalletDesignSettings } from "@/components/wallet/wallet-card-designer";
import type { Business, Customer, Program } from "@/types";

const customerToken = "mfp_c_8f3k29x7";
const customerNumber = "MF-000184";

export function CustomerCardsOverview() {
  const { customers, businesses, programs, operations, showToast } = useDemoStore();
  const memberflowPassRef = useRef<HTMLDivElement>(null);
  const memberships = useMemo(() => customers.filter((customer) => customer.token === customerToken), [customers]);
  const activePrograms = useMemo(() => memberships.flatMap((customer) => {
    const business = businesses.find((item) => item.id === customer.businessId);
    const items = [customer.subscriptionProgramId, customer.loyaltyProgramId]
      .filter(Boolean)
      .map((programId) => programs.find((program) => program.id === programId))
      .filter((program): program is Program => Boolean(program));
    return items.map((program) => ({ customer, business, program })).filter((item): item is { customer: Customer; business: Business; program: Program } => Boolean(item.business));
  }), [businesses, memberships, programs]);
  const history = operations.filter((operation) => memberships.some((customer) => customer.id === operation.customerId)).slice(0, 8);

  async function downloadMemberFlowPass() {
    if (!memberflowPassRef.current) return;
    await document.fonts.ready;
    const dataUrl = await toPng(memberflowPassRef.current, { pixelRatio: 3, cacheBust: true });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "memberflow-pass-anna-ozola.png";
    link.click();
  }

  return (
    <main className="min-h-screen bg-[#F4F5F9] px-4 py-5 sm:py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
          <section className="rounded-[32px] bg-white p-4 shadow-[0_22px_70px_rgba(18,19,32,0.12)]">
            <div ref={memberflowPassRef} className="rounded-[30px] bg-[#121320] p-5 text-white shadow-[0_18px_56px_rgba(18,19,32,0.2)]">
              <div className="flex items-center gap-3">
                <BrandMark className="h-12 w-12 rounded-2xl" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">MemberFlow Pass</p>
                  <h1 className="text-xl font-semibold">Anna Ozola</h1>
                </div>
              </div>
              <p className="mt-6 text-3xl font-semibold">{activePrograms.length} активных программ</p>
              <p className="mt-1 text-sm text-white/60">Одна карта для всех подключённых компаний</p>
              <div className="mt-5 grid place-items-center rounded-[24px] bg-white p-4">
                <QrCode className="items-center justify-center" value={`memberflow:customer:${customerToken}`} label="" size={180} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm font-bold text-white/70">
                <span>{customerNumber}</span>
                <span>Мои карты →</span>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Button onClick={downloadMemberFlowPass}><Wallet className="h-4 w-4" />Скачать цифровую карту</Button>
              <Button variant="secondary" onClick={() => showToast("Клиент добавляет одну карту MemberFlow в Wallet и использует её во всех подключённых программах.")}>Добавить в Wallet</Button>
            </div>
          </section>
          <Card className="p-5 text-sm text-slate-600">
            <p className="font-semibold text-[var(--foreground)]">QR клиента</p>
            <p className="mt-2">Сотрудник сканирует один и тот же QR во время обслуживания. В QR хранится только непрозрачный token: <b>{customerToken}</b>.</p>
          </Card>
        </aside>

        <section className="space-y-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Мои карты</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">Все программы Anna Ozola</h2>
            <p className="mt-2 text-sm text-slate-500">Подписки, лояльность, награды и история операций в одном личном кабинете.</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {activePrograms.map(({ customer, business, program }) => <ProgramMembershipCard key={`${customer.id}-${program.id}`} customer={customer} business={business} program={program} />)}
          </div>
          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-semibold"><History className="h-5 w-5" />История операций</h3>
            <div className="mt-3 space-y-3">
              {history.map((item) => {
                const program = programs.find((entry) => entry.id === item.programId);
                return <div key={item.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-2 text-sm last:border-0"><span>{program?.name ?? "Program"} · {item.change}</span><span className="text-slate-500">{formatDate(item.date)}</span></div>;
              })}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

function ProgramMembershipCard({ customer, business, program }: { customer: Customer; business: Business; program: Program }) {
  const design = readProgramDesign(program, business);
  const style = getProgramCardStyle(design);
  const isSubscription = program.type === "subscription";
  const progress = isSubscription ? Math.min(100, (customer.remainingUses / Math.max(1, customer.includedUses)) * 100) : Math.min(100, (customer.stamps / Math.max(1, program.targetCount ?? 5)) * 100);
  return (
    <article className="relative overflow-hidden rounded-[30px] p-5 text-white shadow-[0_18px_60px_rgba(18,19,32,0.14)]" style={style}>
      {design.backgroundImageDataUrl && design.template === "image" ? <Image src={design.backgroundImageDataUrl} alt="" fill className="object-cover" unoptimized /> : null}
      {design.backgroundImageDataUrl && design.template === "image" ? <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${design.backgroundDimming / 100})` }} /> : null}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/18 text-lg font-black ring-1 ring-white/20">{design.logoDataUrl ? <Image src={design.logoDataUrl} alt="" width={38} height={38} className="h-9 w-9 rounded-xl object-cover" unoptimized /> : business.name[0]}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold opacity-70">{business.name}</p>
            <h3 className="truncate text-2xl font-semibold">{design.cardName}</h3>
          </div>
        </div>
        <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-bold ring-1 ring-white/18">{isSubscription ? "Подписка" : "Карта лояльности"}</span>
      </div>
      <p className="relative mt-4 text-sm opacity-78">{design.shortDescription}</p>
      <div className="relative mt-6 rounded-[24px] bg-white/14 p-4 ring-1 ring-white/16">
        {isSubscription ? (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-65">{design.labels.remainingVisits}</p>
            <p className="mt-2 text-4xl font-semibold">{customer.remainingUses} из {customer.includedUses}</p>
            <p className="mt-2 flex items-center gap-2 text-sm opacity-75"><Calendar className="h-4 w-4" />Обновление {formatDate(customer.nextRenewal)}</p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-65">{design.labels.stamps}</p>
            <p className="mt-2 text-4xl font-semibold">{customer.stamps} из {program.targetCount ?? 5}</p>
            <p className="mt-2 text-sm opacity-75">До награды осталось {Math.max(0, (program.targetCount ?? 5) - customer.stamps)} посещение</p>
            <div className="mt-4 flex gap-2">{Array.from({ length: program.targetCount ?? 5 }, (_, index) => <span key={index} className={index < customer.stamps ? "h-8 w-8 rounded-full bg-white" : "h-8 w-8 rounded-full bg-white/18 ring-1 ring-white/30"} />)}</div>
          </>
        )}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/18"><span className="block h-full rounded-full bg-white" style={{ width: `${progress}%` }} /></div>
      </div>
      {customer.rewards > 0 ? <div className="relative mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 text-[#121320]"><Gift className="h-5 w-5 text-amber-500" /><span className="font-semibold">Доступна награда: {program.rewardName ?? design.back.rewardName}</span></div> : null}
    </article>
  );
}

function readProgramDesign(program: Program, business: Business): WalletDesignSettings {
  const defaults: WalletDesignSettings = {
    businessName: business.name,
    cardName: program.name,
    shortDescription: program.description,
    primaryColor: business.brandColor,
    secondaryColor: "#121320",
    textTone: "light",
    backgroundDimming: 42,
    template: "gradient",
    metric: program.type === "subscription" ? "remaining" : "stamps",
    labels: { stamps: "Штампы", toReward: "До награды", remainingVisits: "Осталось посещений", nextRenewal: "Следующее обновление", reward: "Награда" },
    back: { description: program.description, terms: "", rewardName: program.rewardName ?? "Награда", address: business.address, phone: business.phone, website: "memberflow.app", socials: "", branches: business.branches.join(", "), cancellationPolicy: program.cancellationRules ?? "" },
  };
  return readStoredWalletDesign(getWalletDesignStorageKey(program.id), defaults);
}

function getProgramCardStyle(settings: WalletDesignSettings): React.CSSProperties {
  const color = settings.textTone === "light" ? "#ffffff" : "#121320";
  if (settings.template === "minimal") return { background: settings.primaryColor, color };
  if (settings.template === "premium") return { background: `radial-gradient(circle at 15% 5%, ${settings.primaryColor} 0, transparent 32%), linear-gradient(145deg, #0C0D16, ${settings.secondaryColor})`, color: "#ffffff" };
  if (settings.template === "image") return { background: settings.primaryColor, color };
  return { background: `linear-gradient(145deg, ${settings.primaryColor}, ${settings.secondaryColor})`, color };
}
