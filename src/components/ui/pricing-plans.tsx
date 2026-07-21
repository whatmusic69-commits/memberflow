"use client";

import { Check, CreditCard, Gift, Layers3 } from "lucide-react";
import { useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProductKey = "loyalty" | "membership" | "complete";
type PlanKey = "solo" | "business" | "network";

interface Plan {
  key: PlanKey;
  title: string;
  price: string;
  fee?: string;
  note?: string;
  features: string[];
}

const productTabs: { key: ProductKey; label: string; icon: typeof Gift }[] = [
  { key: "loyalty", label: "Карта лояльности", icon: Gift },
  { key: "membership", label: "Платные подписки", icon: CreditCard },
  { key: "complete", label: "Оба продукта", icon: Layers3 },
];

const plans: Record<ProductKey, Plan[]> = {
  loyalty: [
    { key: "solo", title: "Solo", price: "€25 / месяц", note: "Без комиссии", features: ["1 программа", "1 точка", "до 2 сотрудников", "до 300 активных клиентов", "QR-карты", "штампы и награды", "базовая аналитика"] },
    { key: "business", title: "Business", price: "€69 / месяц", note: "Без комиссии", features: ["до 5 программ", "до 3 точек", "до 10 сотрудников", "до 1 500 активных клиентов", "расширенная аналитика", "экспорт клиентов", "собственный брендинг"] },
    { key: "network", title: "Network", price: "€149 / месяц", note: "Без комиссии", features: ["до 15 программ", "до 10 точек", "до 5 000 активных клиентов", "неограниченное количество сотрудников", "аналитика по филиалам", "роли и права доступа", "приоритетная поддержка"] },
  ],
  membership: [
    { key: "solo", title: "Solo", price: "€35 / месяц", fee: "+ 3% с платежей клиентов", features: ["1 программа подписки", "1 точка", "до 2 сотрудников", "до 300 активных подписчиков", "автоматические платежи", "лимиты посещений и услуг", "QR-карты"] },
    { key: "business", title: "Business", price: "€79 / месяц", fee: "+ 2,5% с платежей клиентов", features: ["до 5 программ", "до 3 точек", "до 10 сотрудников", "до 1 500 активных подписчиков", "аналитика MRR", "управление отменами", "экспорт данных"] },
    { key: "network", title: "Network", price: "€169 / месяц", fee: "+ 2% с платежей клиентов", features: ["до 15 программ", "до 10 точек", "до 5 000 активных подписчиков", "неограниченное количество сотрудников", "аналитика по филиалам", "роли и права доступа", "приоритетная поддержка"] },
  ],
  complete: [
    { key: "solo", title: "Solo", price: "€49 / месяц", fee: "+ 2% с платежей клиентов", features: ["карта лояльности и подписки", "1 точка", "до 2 сотрудников", "до 300 активных клиентов"] },
    { key: "business", title: "Business", price: "€119 / месяц", fee: "+ 2% с платежей клиентов", features: ["до 5 программ каждого типа", "до 3 точек", "до 10 сотрудников", "до 1 500 активных клиентов", "расширенная аналитика", "экспорт данных", "собственный брендинг"] },
    { key: "network", title: "Network", price: "€249 / месяц", fee: "+ 1,5% с платежей клиентов", features: ["до 15 программ каждого типа", "до 10 точек", "до 5 000 активных клиентов", "неограниченное количество сотрудников", "роли и права доступа", "аналитика по филиалам", "приоритетная поддержка"] },
  ],
};

export function PricingPlans() {
  const [product, setProduct] = useState<ProductKey>("loyalty");
  const selectedPlans = plans[product];

  return (
    <div>
      <div className="mb-7 overflow-x-auto pb-1">
        <div className="mx-auto inline-flex min-w-max rounded-2xl border border-[var(--border)] bg-white p-1 shadow-[var(--shadow-sm)] sm:flex sm:w-fit">
          {productTabs.map((tab) => {
            const Icon = tab.icon;
            const active = product === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setProduct(tab.key)}
                className={cn("flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:ring-2 focus-visible:ring-[var(--primary)]", active ? "bg-[#121320] text-white shadow-[var(--shadow-sm)]" : "text-slate-600 hover:bg-slate-50 hover:text-[var(--foreground)]")}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div key={product} className="grid animate-fade-up gap-5 [animation-duration:180ms] lg:grid-cols-3">
        {selectedPlans.map((plan) => <PlanCard key={plan.key} product={product} plan={plan} />)}
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[22px] border border-[var(--border)] bg-white/80 p-5 text-sm text-[var(--muted-foreground)] shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
        <p>Активный клиент — клиент, совершивший хотя бы одну операцию за последние 30 дней. В подписках учитываются клиенты с действующей подпиской.</p>
        <a href="/register?product=complete&plan=network" className="shrink-0 font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]">Более 5 000 клиентов или 10 точек? Связаться с нами</a>
      </div>
    </div>
  );
}

function PlanCard({ product, plan }: { product: ProductKey; plan: Plan }) {
  const popular = plan.key === "business";
  const href = `/register?product=${product}&plan=${plan.key}`;
  return (
    <Card className={cn("flex h-full min-h-[560px] flex-col rounded-[28px] p-6 shadow-[var(--shadow-md)] max-lg:min-h-0", popular ? "order-1 border-violet-400/20 bg-[#121320] text-white lg:order-none" : plan.key === "solo" ? "order-2 lg:order-none" : "order-3 lg:order-none")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn("text-xs font-bold uppercase tracking-[0.18em]", popular ? "text-violet-200" : "text-[var(--primary)]")}>{plan.key === "solo" ? "Доступный старт" : plan.key === "network" ? "Для сети" : "Оптимальный рост"}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">{plan.title}</h3>
        </div>
        {popular ? <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#121320]">Популярный</span> : null}
      </div>

      <div className="mt-6">
        <p className="whitespace-nowrap text-3xl font-semibold tracking-tight">{plan.price}</p>
        {plan.fee ? <p className={cn("mt-2 whitespace-nowrap text-sm font-semibold", popular ? "text-violet-200" : "text-[var(--primary)]")}>{plan.fee}</p> : null}
        {plan.note ? <p className={cn("mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold", popular ? "bg-white/10 text-violet-200" : "bg-[var(--primary-soft)] text-[var(--primary)]")}>{plan.note}</p> : null}
      </div>

      <ul className={cn("mt-7 space-y-3 text-sm", popular ? "text-slate-300" : "text-slate-700")}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <LinkButton href={href} variant={popular ? "primary" : "secondary"} className="w-full">Выбрать {plan.title}</LinkButton>
      </div>
    </Card>
  );
}
