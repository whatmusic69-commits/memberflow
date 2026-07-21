"use client";

import { AlertTriangle, CheckCircle2, CreditCard, ExternalLink, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";
import { staticData, useDemoStore } from "@/store/demo-store";

export default function StripePage() {
  const { businesses, selectedBusinessId, showToast } = useDemoStore();
  const payments = staticData.payments;
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const businessPayments = payments.filter((payment) => payment.businessId === selectedBusinessId);
  const paid = businessPayments.filter((payment) => payment.status === "paid");
  const failed = businessPayments.filter((payment) => payment.status === "failed");
  const refunded = businessPayments.filter((payment) => payment.status === "refunded");
  const turnover = paid.reduce((sum, payment) => sum + payment.amountCents, 0);
  const fees = paid.reduce((sum, payment) => sum + payment.feeCents, 0);
  const status = business?.stripeStatus ?? "pending";
  const connected = status === "connected";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stripe</h1>
          <p className="text-sm text-slate-500">Подключение платёжного аккаунта для получения клиентских платежей по подпискам.</p>
        </div>
        <Button onClick={() => showToast(connected ? "Открыты demo-настройки Stripe." : "Открыт demo-onboarding Stripe для выплат клиентских платежей.")}>
          <ExternalLink className="h-4 w-4" />{connected ? "Открыть Stripe" : "Подключить Stripe"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden shadow-[var(--shadow-md)]">
          <div className="grid gap-0 md:grid-cols-[300px_1fr]">
            <div className="relative overflow-hidden bg-[#121320] p-6 text-white">
              <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[var(--primary)]/35 blur-3xl" />
              <CreditCard className="relative h-8 w-8 text-violet-200" />
              <p className="relative mt-5 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Payment provider</p>
              <h2 className="relative mt-2 text-3xl font-semibold">Stripe</h2>
              <div className="relative mt-5"><StatusBadge status={status} label={connected ? "Connected" : status === "pending" ? "Pending" : "Action needed"} /></div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold">{connected ? "Аккаунт подключён" : status === "failed" ? "Нужно исправить подключение" : "Подключите аккаунт для выплат"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Платежи клиентов поступают бизнесу через подключённый платёжный аккаунт. MemberFlow удерживает комиссию согласно тарифу, а остальная сумма доступна к выплате бизнесу.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <StatusItem icon={CheckCircle2} label="KYC" value={connected ? "Проверен" : "Не завершён"} tone={connected ? "success" : "warning"} />
                <StatusItem icon={ShieldCheck} label="Payouts" value={connected ? "Включены" : "Ожидают"} tone={connected ? "success" : "warning"} />
                <StatusItem icon={AlertTriangle} label="Disputes" value="0" tone="neutral" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="shadow-[var(--shadow-md)]">
          <CardHeader title="Следующая выплата" description="Demo-расчёт по оплаченным клиентским подпискам." />
          <div className="p-5">
            <p className="text-4xl font-semibold tracking-tight">{formatMoney(Math.max(0, turnover - fees))}</p>
            <p className="mt-2 text-sm text-slate-500">Ожидаемая дата: 25 июля 2026</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Mini label="Оборот клиентов" value={formatMoney(turnover)} />
              <Mini label="Stripe fees" value={formatMoney(fees)} />
              <Mini label="Failed payments" value={String(failed.length)} />
              <Mini label="Refunds" value={String(refunded.length)} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Последние платежи клиентов" description="Здесь владелец видит клиентские платежи, которые проходят через платёжного провайдера." />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="p-4">Дата</th>
                <th className="p-4">Сумма</th>
                <th className="p-4">Комиссия</th>
                <th className="p-4">Статус</th>
                <th className="p-4">Действие</th>
              </tr>
            </thead>
            <tbody>
              {businessPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-100 last:border-0">
                  <td className="p-4">{payment.date}</td>
                  <td className="p-4 font-semibold">{formatMoney(payment.amountCents)}</td>
                  <td className="p-4 text-slate-500">{formatMoney(payment.feeCents)}</td>
                  <td className="p-4"><StatusBadge status={payment.status} /></td>
                  <td className="p-4"><Button variant="secondary" onClick={() => showToast("Открыта demo-детализация платежа.")}>Открыть</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <p className="flex items-center gap-2 font-semibold"><RefreshCcw className="h-5 w-5 text-[var(--primary)]" />Как это работает</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">MemberFlow не хранит деньги бизнеса. Клиентские платежи проходят через Stripe-аккаунт бизнеса, а раздел показывает статус подключения, выплаты, возвраты и проблемные платежи.</p>
      </Card>
    </div>
  );
}

function StatusItem({ icon: Icon, label, value, tone }: { icon: typeof CheckCircle2; label: string; value: string; tone: "success" | "warning" | "neutral" }) {
  const className = tone === "success" ? "text-emerald-700 bg-emerald-50" : tone === "warning" ? "text-amber-700 bg-amber-50" : "text-slate-700 bg-slate-50";
  return <div className={`rounded-2xl p-3 ${className}`}><Icon className="h-5 w-5" /><p className="mt-2 text-xs font-bold uppercase tracking-wide opacity-70">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}
