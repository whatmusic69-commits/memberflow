"use client";

import { toPng } from "html-to-image";
import { Calendar, CreditCard, Gift, History, Wallet, WalletCards } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode } from "@/components/ui/qr-code";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export function CustomerCard({ token }: { token: string }) {
  const { customers, businesses, programs, operations, showToast } = useDemoStore();
  const customer = customers.find((item) => item.token === token) ?? customers.find((item) => item.token === "mfp_c_8f3k29x7") ?? customers[0];
  const business = businesses.find((item) => item.id === customer.businessId) ?? businesses[0];
  const sub = programs.find((item) => item.id === customer.subscriptionProgramId);
  const loy = programs.find((item) => item.id === customer.loyaltyProgramId);
  const history = operations.filter((item) => item.customerId === customer.id).slice(0, 5);
  const progress = Math.min(100, (customer.remainingUses / Math.max(1, customer.includedUses)) * 100);
  const digitalCardRef = useRef<HTMLDivElement>(null);

  async function downloadDigitalCard() {
    if (!digitalCardRef.current) return;
    await document.fonts.ready;
    const dataUrl = await toPng(digitalCardRef.current, { pixelRatio: 3, cacheBust: true });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${business.name}-${customer.name}-digital-card.png`.replaceAll(" ", "-").toLowerCase();
    link.click();
  }

  return (
    <main className="min-h-screen bg-[#F4F5F9] px-4 py-5">
      <div className="mx-auto max-w-sm space-y-4">
        <section className="relative overflow-hidden rounded-[30px] bg-white p-4 shadow-[0_22px_70px_rgba(18,19,32,0.12)]">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-20 blur-3xl" style={{ background: business.brandColor }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-bold text-white shadow-[var(--shadow-sm)]" style={{ background: business.brandColor }}>{business.name[0]}</span>
              <div>
                <h1 className="font-semibold tracking-tight">{business.name}</h1>
                <p className="text-sm text-slate-500">{customer.name}</p>
              </div>
            </div>
            <StatusBadge status={customer.status} label={customer.status === "active" ? "Active" : customer.status} />
          </div>

          <div ref={digitalCardRef} className="relative mt-5 rounded-[26px] bg-[#121320] p-5 text-white shadow-[0_18px_50px_rgba(18,19,32,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">MemberFlow Pass</p>
                <h2 className="mt-2 text-2xl font-semibold">{customer.name}</h2>
                <p className="mt-1 text-sm text-white/75">Единая карта для всех программ</p>
              </div>
              <div className="rounded-2xl bg-white p-2">
                <QrCode label="" value={`memberflow:customer:${customer.token}`} size={84} />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/12 p-3"><p className="text-white/65">Активные программы</p><p className="mt-1 whitespace-nowrap text-lg font-semibold">5</p></div>
              <div className="rounded-2xl bg-white/12 p-3"><p className="text-white/65">Номер клиента</p><p className="mt-1 text-lg font-semibold">{customer.customerNumber ?? "MF-000184"}</p></div>
            </div>
            <Link href="/customer/cards" className="mt-4 inline-flex text-sm font-semibold text-white/80 hover:text-white">Мои карты →</Link>
          </div>
          <Button variant="secondary" className="relative mt-4 w-full" onClick={downloadDigitalCard}>Скачать цифровую карту</Button>
        </section>

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 text-sm font-semibold shadow-[var(--shadow-sm)]">
          <button className="rounded-xl bg-[#121320] px-3 py-2 text-white">Подписка</button>
          <button className="rounded-xl px-3 py-2 text-slate-500">Лояльность</button>
        </div>

        {sub ? <Card className="p-5"><div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-[var(--primary)]" /><h2 className="font-semibold">{sub.name}</h2></div><p className="mt-2 text-sm text-slate-500">{sub.description}</p><div className="mt-4 rounded-2xl bg-[var(--primary-soft)] p-4"><p className="text-2xl font-semibold">{customer.remainingUses} из {customer.includedUses}</p><p className="text-sm text-slate-500">оставшихся услуг</p><div className="mt-3 h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-[var(--primary)]" style={{ width: `${progress}%` }} /></div></div><p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Calendar className="h-4 w-4" />Следующее обновление: {formatDate(customer.nextRenewal)}</p></Card> : null}
        {loy ? <Card className="p-5"><div className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-[#20B486]" /><h2 className="font-semibold">{loy.name}</h2></div><div className="mt-4 flex flex-wrap gap-2">{Array.from({ length: loy.targetCount ?? 5 }, (_, i) => <span key={i} className={i < customer.stamps ? "h-8 w-8 rounded-full bg-[var(--primary)] shadow-[0_0_0_4px_rgba(109,93,251,0.1)]" : "h-8 w-8 rounded-full border border-slate-300 bg-white"} />)}</div><p className="mt-4 text-sm text-slate-500">{customer.stamps} из {loy.targetCount ?? 5}. Награды: {customer.rewards}</p></Card> : null}
        {customer.rewards > 0 ? <Card className="bg-[#FBF8F1] p-5"><div className="flex items-center gap-3"><Gift className="h-5 w-5 text-amber-500" /><div><h2 className="font-semibold">Доступная награда</h2><p className="text-sm text-slate-500">{loy?.rewardName ?? "Reward card"}</p></div></div></Card> : null}
        <div className="grid grid-cols-2 gap-3"><Button variant="secondary" className="bg-black text-white hover:bg-zinc-900" onClick={() => { window.location.href = `/api/wallet/apple/pass/${encodeURIComponent(customer.token)}`; }}><Wallet className="h-4 w-4" />Apple Wallet</Button><Button variant="secondary" onClick={() => showToast("Google Wallet подключается отдельной интеграцией Issuer account и signed JWT.")}>Google Wallet</Button></div>
        <Card className="p-5"><h2 className="flex items-center gap-2 font-semibold"><History className="h-5 w-5" />История посещений</h2><div className="mt-3 space-y-3">{history.map((item) => <div key={item.id} className="flex justify-between border-b border-slate-100 pb-2 text-sm last:border-0"><span>{item.change}</span><span className="text-slate-500">{formatDate(item.date)}</span></div>)}</div></Card>
      </div>
    </main>
  );
}
