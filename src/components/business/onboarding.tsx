"use client";

import { BadgeEuro, Check, CreditCard, FileImage, Gift, Palette, Plus, QrCode, Rocket, ShieldCheck, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { PosterBuilder } from "@/components/poster/poster-builder";
import { useDemoStore } from "@/store/demo-store";

const input = "h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-[var(--shadow-sm)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]";
type OnboardingProduct = "loyalty" | "membership" | "complete";
type OnboardingPlan = "solo" | "business" | "network";

export function BusinessStep() {
  return <OnboardingShell step="Шаг 1" title="Компания" next="/onboarding/program-type">
    <div className="grid gap-4 md:grid-cols-2">
      {["Название бизнеса", "Город", "Адрес", "Телефон", "Email"].map((label, i) => <label key={label} className="text-sm font-medium">{label}<input className={input} defaultValue={i === 0 ? "Wash Club" : ""} /></label>)}
      <label className="text-sm font-medium">Категория<select className={input}><option>Автомойка</option><option>Барбершоп</option><option>Кофейня</option><option>Beauty</option></select></label>
      <label className="text-sm font-medium">Основной цвет бренда<div className="flex gap-2"><input type="color" defaultValue="#6D5DFB" className="h-11 w-16 rounded-lg border border-slate-200" /><span className="flex h-11 flex-1 items-center gap-2 rounded-lg bg-[#F0EDFF] px-3 text-sm"><Palette className="h-4 w-4" />#6D5DFB</span></div></label>
      <label className="text-sm font-medium">Логотип<div className="grid h-28 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50"><Upload className="h-5 w-5 text-slate-400" /><span className="text-xs text-slate-500">Локальный preview без загрузки</span></div></label>
    </div>
  </OnboardingShell>;
}

export function ProgramTypeStep() {
  const router = useRouter();
  const [product, setProduct] = useState<OnboardingProduct>("membership");
  const [plan, setPlan] = useState<OnboardingPlan>("business");
  const [stripeConnected, setStripeConnected] = useState(false);
  const selectedPrice = pricing[product][plan];
  const selectedMonthlyCents = pricingCents[product][plan];
  const discountedMonthlyCents = Math.round(selectedMonthlyCents * 0.7);
  useEffect(() => {
    const id = window.setTimeout(() => {
      setProduct(readOnboardingProduct());
      setPlan(readOnboardingPlan());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);
  return <OnboardingShell step="Шаг 2" title="Продукт, тариф и оплата" next={null}>
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Выберите, что запускает бизнес: карту лояльности, платные подписки или оба продукта одновременно.</p>
        <div className="mt-4 rounded-[24px] border border-violet-200 bg-[var(--primary-soft)] p-4 shadow-[var(--shadow-sm)]">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Промо для нового клиента</p>
          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">-30% на первый месяц</h2>
              <p className="mt-1 text-sm text-slate-600">Скидка применяется к фиксированной месячной оплате MemberFlow. Комиссия с клиентских платежей остаётся по выбранному тарифу.</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm shadow-[var(--shadow-sm)]">
              <p className="text-slate-500">Первый платёж</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{formatEuro(discountedMonthlyCents)} <span className="text-sm font-medium text-slate-400 line-through">{formatEuro(selectedMonthlyCents)}</span></p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ProductChoice selected={product === "loyalty"} icon={Gift} title="Карта лояльности" description="Штампы, награды и повторные визиты без оплаты клиента." price="от €25 / месяц" onClick={() => setProduct("loyalty")} />
          <ProductChoice selected={product === "membership"} icon={CreditCard} title="Платные подписки" description="Регулярные платежи клиентов и лимиты услуг." price="от €35 / месяц + 3%" onClick={() => setProduct("membership")} />
          <ProductChoice selected={product === "complete"} icon={ShieldCheck} title="Оба продукта" description="Подписки и карты лояльности в одном кабинете." price="от €49 / месяц + 2%" onClick={() => setProduct("complete")} />
        </div>
        {product === "complete" ? <div className="mt-4 rounded-2xl border border-violet-100 bg-[var(--primary-soft)] p-4 text-sm text-slate-700"><b className="text-[var(--foreground)]">Вы выбрали оба продукта.</b><p className="mt-1">Сначала настроим платную подписку, затем карту лояльности. На запуске будут показаны обе программы и отдельные QR для подключения.</p></div> : null}
      </div>

      <div>
        <h2 className="text-base font-semibold">Масштаб бизнеса</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {(["solo", "business", "network"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setPlan(item)} className={plan === item ? "rounded-2xl border border-[var(--primary)] bg-[var(--primary-soft)] p-4 text-left shadow-[var(--shadow-sm)] ring-2 ring-[var(--primary)]/15" : "rounded-2xl border border-[var(--border)] bg-white p-4 text-left shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"}>
              <p className="font-semibold capitalize">{item}</p>
              <p className="mt-1 text-sm text-slate-500">{pricing[product][item]}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="flex items-center gap-2 font-semibold"><BadgeEuro className="h-5 w-5 text-[var(--primary)]" />Оплата MemberFlow</p>
          <p className="mt-2 text-sm text-slate-500">Demo-карта нужна для оплаты выбранного тарифа платформы.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Номер карты<input className={input} defaultValue="4242 4242 4242 4242" /></label>
            <label className="text-sm font-medium">Владелец<input className={input} defaultValue="Wash Club SIA" /></label>
            <label className="text-sm font-medium">Срок<input className={input} defaultValue="08 / 28" /></label>
            <label className="text-sm font-medium">CVC<input className={input} defaultValue="123" /></label>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
            <p><b>Первый месяц со скидкой:</b> {formatEuro(discountedMonthlyCents)}</p>
            <p className="mt-1 text-slate-500">Далее: {selectedPrice}</p>
          </div>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-2 font-semibold"><CreditCard className="h-5 w-5 text-[var(--primary)]" />Выплаты от клиентов</p>
          <p className="mt-2 text-sm text-slate-500">Для платных подписок бизнес подключает Stripe, чтобы получать платежи клиентов на свой аккаунт.</p>
          <button type="button" onClick={() => setStripeConnected(true)} className={stripeConnected ? "mt-4 flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-emerald-800" : "mt-4 flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-white p-4 text-left transition hover:bg-slate-50"}>
            <span><b>{stripeConnected ? "Stripe подключён" : "Подключить Stripe"}</b><p className="mt-1 text-sm opacity-75">{stripeConnected ? "Demo-статус готов к приёму платежей." : "Откроется защищённый onboarding платёжного провайдера."}</p></span>
            <Check className={stripeConnected ? "h-5 w-5" : "h-5 w-5 text-slate-300"} />
          </button>
          {product === "loyalty" ? <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Для карты лояльности Stripe можно подключить позже, если вы добавите платные подписки.</p> : null}
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => {
          window.localStorage.setItem("memberflow-onboarding-product", product);
          window.localStorage.setItem("memberflow-onboarding-plan", plan);
          router.push(product === "loyalty" ? "/onboarding/loyalty" : "/onboarding/subscription");
        }}>Продолжить к условиям</Button>
      </div>
    </div>
  </OnboardingShell>;
}

export function SubscriptionStep() {
  const { createProgram } = useDemoStore();
  const router = useRouter();
  const product = useOnboardingProduct();
  const [name, setName] = useState("Wash Club");
  const [price, setPrice] = useState("29.99");
  const [uses, setUses] = useState("2");
  return <OnboardingShell step="Шаг 3A" title="Создание подписки" next={null}>
    {product === "complete" ? <FlowNotice title="Оба продукта: сначала подписка" text="После сохранения подписки вы перейдёте к созданию карты лояльности для этого же бизнеса." /> : null}
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">Название<input className={input} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="text-sm font-medium">Цена<input className={input} value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <label className="text-sm font-medium">Период<select className={input}><option>month</option><option>year</option></select></label>
        <label className="text-sm font-medium">Услуга<input className={input} defaultValue="Комплексная мойка" /></label>
        <label className="text-sm font-medium">Включённых использований<input className={input} value={uses} onChange={(e) => setUses(e.target.value)} /></label>
        <label className="text-sm font-medium">Максимальное накопление<input className={input} defaultValue="4" /></label>
        <label className="text-sm font-medium">Скидка на доп. услуги<input className={input} defaultValue="10%" /></label>
        <label className="text-sm font-medium">Правила отмены<input className={input} defaultValue="Отмена до следующего платежа" /></label>
      </div>
      <MembershipPreview name={name} price={price} uses={uses} />
    </div>
    <div className="mt-6 flex justify-end"><Button onClick={() => { createProgram({ type: "subscription", name, description: "Всегда чистый автомобиль", priceCents: Math.round(Number(price) * 100), includedService: "Комплексная мойка", includedUses: Number(uses), rollover: true, maxRollover: 4, extraDiscountPercent: 10, allBranches: true, cancellationRules: "Отмена до следующего платежа" }); router.push(product === "complete" ? "/onboarding/loyalty" : "/onboarding/team"); }}>{product === "complete" ? "Сохранить подписку и создать карту" : "Сохранить и продолжить"}</Button></div>
  </OnboardingShell>;
}

export function LoyaltyStep() {
  const { createProgram } = useDemoStore();
  const router = useRouter();
  const product = useOnboardingProduct();
  const [name, setName] = useState("Coffee Regular");
  const [target, setTarget] = useState("5");
  return <OnboardingShell step="Шаг 3B" title="Создание карты лояльности" next={null}>
    {product === "complete" ? <FlowNotice title="Оба продукта: теперь карта лояльности" text="Подписка уже создана. После этой формы бизнес будет использовать обе системы одновременно." /> : null}
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">Название карты<input className={input} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="text-sm font-medium">Тип механики<select className={input}><option>N покупок → награда</option><option>N посещений → награда</option></select></label>
        <label className="text-sm font-medium">Что учитывается<input className={input} defaultValue="Кофе" /></label>
        <label className="text-sm font-medium">Требуемое количество<input className={input} value={target} onChange={(e) => setTarget(e.target.value)} /></label>
        <label className="text-sm font-medium">Название награды<input className={input} defaultValue="Бесплатный кофе" /></label>
        <label className="text-sm font-medium">Срок действия штампов<input className={input} defaultValue="90 дней" /></label>
        <label className="text-sm font-medium">Частота начисления<input className={input} defaultValue="1 раз за покупку" /></label>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" defaultChecked /> Повторять цикл</label>
      </div>
      <LoyaltyPreview name={name} target={Number(target)} />
    </div>
    <div className="mt-6 flex justify-end"><Button onClick={() => { createProgram({ type: "loyalty", name, description: "Цифровые штампы и награды", loyaltyMechanic: "purchases", targetCount: Number(target), rewardName: "Бесплатный кофе", stampExpiryDays: 90, repeatable: true }); router.push("/onboarding/team"); }}>Сохранить и продолжить</Button></div>
  </OnboardingShell>;
}

export function TeamStep() {
  const { workers, selectedBusinessId, addWorker, deleteWorker } = useDemoStore();
  const list = workers.filter((worker) => worker.businessId === selectedBusinessId);
  const [name, setName] = useState("New Staff");
  const [email, setEmail] = useState("staff@example.com");
  return <OnboardingShell step="Шаг 4" title="Работники" next="/onboarding/launch">
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">{list.map((worker) => <div key={worker.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"><span><b>{worker.name}</b><p className="text-sm text-slate-500">{worker.email} · {worker.role}</p></span><Button variant="ghost" onClick={() => deleteWorker(worker.id)}>Удалить</Button></div>)}</div>
      <Card className="p-4">
        <h3 className="font-semibold">Добавить приглашение</h3>
        <div className="mt-3 space-y-3"><input className={input} value={name} onChange={(e) => setName(e.target.value)} /><input className={input} value={email} onChange={(e) => setEmail(e.target.value)} /><select className={input} id="role"><option>Staff</option><option>Manager</option></select><Button className="w-full" onClick={() => addWorker({ name, email, role: "Staff" })}><Plus className="h-4 w-4" />Добавить</Button></div>
        <p className="mt-4 text-xs text-slate-500">Manager видит клиентов, программы и аналитику. Staff может сканировать карты, списывать услуги и видеть собственную историю.</p>
      </Card>
    </div>
  </OnboardingShell>;
}

export function LaunchStep() {
  const router = useRouter();
  const [published, setPublished] = useState(false);
  const product = useOnboardingProduct();
  const { businesses, selectedBusinessId, programs, workers } = useDemoStore();
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const count = workers.filter((item) => item.businessId === selectedBusinessId).length;
  const businessPrograms = programs.filter((item) => item.businessId === selectedBusinessId);
  const launchPrograms = product === "complete" ? businessPrograms.slice(0, 2) : businessPrograms.slice(0, 1);
  const latest = launchPrograms[0] ?? businessPrograms[0];
  return <OnboardingShell step="Шаг 5" title="Запуск" next={null}>
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Info label="Бизнес" value={business?.name ?? "Business"} /><Info label="Программы" value={launchPrograms.map((program) => program.name).join(" + ") || "Demo program"} /><Info label="Тариф SaaS" value={business?.plan ?? "Complete"} /><Info label="Работники" value={String(count)} /><Info label="Режим" value={product === "complete" ? "Подписки + лояльность" : product === "membership" ? "Подписки" : "Лояльность"} /><Info label="Виджет для сайта" value="<script data-memberflow>" />
      </div>
      {product === "complete" ? <Card className="p-5"><h2 className="font-semibold">Созданы две программы</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{launchPrograms.map((program) => <div key={program.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-semibold">{program.name}</p><p className="mt-1 text-sm text-slate-500">{program.type === "subscription" ? "Платная подписка" : "Карта лояльности"}</p><p className="mt-3 break-all text-sm font-semibold text-[var(--primary)]">{program.type === "subscription" ? `/subscribe/${program.id}` : `/join/${program.id}`}</p></div>)}</div></Card> : null}
      <div className="rounded-3xl border border-violet-100 bg-[var(--primary-soft)] p-5 text-sm text-slate-700">
        <h2 className="font-semibold text-[var(--foreground)]">Единая карта MemberFlow</h2>
        <p className="mt-2">После подключения программа появится в разделе “Мои карты” клиента. Если у клиента ещё нет MemberFlow Pass, ему будет предложено добавить единую карту в Apple Wallet или Google Wallet.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Info label="QR для подключения" value={`/join/${latest?.id ?? "program"}`} />
          <Info label="QR клиента" value="mfp_c_8f3k29x7" />
        </div>
      </div>
      <PosterBuilder business={business} program={latest} source="onboarding" />
    </div>
    <div className="mt-6 flex justify-end">{published ? <Button onClick={() => router.push("/dashboard")}><Check className="h-4 w-4" />Открыть кабинет</Button> : <Button onClick={() => setPublished(true)}><Rocket className="h-4 w-4" />Опубликовать программу</Button>}</div>
    {published ? (
      <div className="animate-fade-up mt-4 overflow-hidden rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 shadow-[var(--shadow-md)]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-6 w-6" /></span>
            <div>
              <h2 className="text-lg font-semibold">Программа опубликована</h2>
              <p className="mt-1 text-sm text-emerald-800">QR для подключения активен. Можно распечатать плакат, открыть карточку программы или сразу проверить обслуживание клиента.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {latest ? <LinkButton href={`/dashboard/programs/${latest.id}/materials`} variant="secondary"><FileImage className="h-4 w-4" />Создать плакат</LinkButton> : null}
            {latest ? <LinkButton href={`/dashboard/programs/${latest.id}`} variant="secondary"><Rocket className="h-4 w-4" />Открыть программу</LinkButton> : null}
            <LinkButton href="/dashboard/scanner"><QrCode className="h-4 w-4" />Перейти к сканеру</LinkButton>
          </div>
        </div>
      </div>
    ) : null}
  </OnboardingShell>;
}

function OnboardingShell({ step, title, next, children }: { step: string; title: string; next: string | null; children: React.ReactNode }) {
  const steps = ["Компания", "Тип программы", "Условия", "Работники", "Запуск"];
  const product = useOnboardingProduct();
  const stepRoutes = ["/onboarding/business", "/onboarding/program-type", product === "loyalty" ? "/onboarding/loyalty" : "/onboarding/subscription", "/onboarding/team", "/onboarding/launch"];
  const currentStep = Number(step.match(/\d/)?.[0] ?? 1);
  return (
    <main className="brand-grid min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-[#F4F5F9]/82 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <LinkButton href="/" variant="secondary" className="hidden sm:inline-flex">На главную</LinkButton>
            <LinkButton href="/login" variant="secondary">Войти</LinkButton>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <Card className="h-fit p-4 lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Setup flow</p>
            <div className="mt-4 space-y-3">
              {steps.map((item, index) => {
                const available = index + 1 <= currentStep;
                const active = index + 1 === currentStep;
                const content = (
                  <>
                    <span className={available ? "grid h-7 w-7 place-items-center rounded-full bg-[var(--primary)] text-xs font-bold text-white" : "grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-400"}>{index + 1}</span>
                    <span className={active ? "text-sm font-bold text-[var(--foreground)]" : available ? "text-sm font-semibold text-slate-700" : "text-sm font-semibold text-slate-400"}>{item}</span>
                  </>
                );
                return available ? (
                  <Link key={item} href={stepRoutes[index]} className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
                    {content}
                  </Link>
                ) : (
                  <div key={item} className="flex cursor-not-allowed items-center gap-3 p-1 opacity-70">
                    {content}
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-5 shadow-[var(--shadow-md)] sm:p-7">
            <p className="text-sm font-semibold text-[var(--primary)]">{step}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
            <div className="mt-6">{children}</div>
            {next ? <div className="mt-6 flex justify-end"><LinkButton href={next}>Продолжить</LinkButton></div> : null}
          </Card>
        </div>
      </div>
    </main>
  );
}

function ProductChoice({ selected, icon: Icon, title, description, price, onClick }: { selected: boolean; icon: typeof Gift; title: string; description: string; price: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={selected ? "relative overflow-hidden rounded-[24px] border border-[var(--primary)] bg-[#121320] p-5 text-left text-white shadow-[var(--shadow-lg)] ring-2 ring-[var(--primary)]/20" : "relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-white p-5 text-left shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"}>
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--primary)]/20 blur-3xl" />
      <Icon className={selected ? "relative h-7 w-7 text-violet-200" : "relative h-7 w-7 text-[var(--primary)]"} />
      <h2 className="relative mt-4 text-lg font-semibold">{title}</h2>
      <p className={selected ? "relative mt-2 text-sm text-slate-300" : "relative mt-2 text-sm text-slate-500"}>{description}</p>
      <p className={selected ? "relative mt-4 text-sm font-bold text-white" : "relative mt-4 text-sm font-bold text-[var(--foreground)]"}>{price}</p>
    </button>
  );
}

function FlowNotice({ title, text }: { title: string; text: string }) {
  return <div className="mb-5 rounded-2xl border border-violet-100 bg-[var(--primary-soft)] p-4 text-sm text-slate-700"><b className="text-[var(--foreground)]">{title}</b><p className="mt-1">{text}</p></div>;
}

function useOnboardingProduct() {
  const [product, setProduct] = useState<OnboardingProduct>("membership");
  useEffect(() => {
    const id = window.setTimeout(() => setProduct(readOnboardingProduct()), 0);
    return () => window.clearTimeout(id);
  }, []);
  return product;
}

function readOnboardingProduct(): OnboardingProduct {
  if (typeof window === "undefined") return "membership";
  const value = window.localStorage.getItem("memberflow-onboarding-product");
  return value === "loyalty" || value === "membership" || value === "complete" ? value : "membership";
}

function readOnboardingPlan(): OnboardingPlan {
  if (typeof window === "undefined") return "business";
  const value = window.localStorage.getItem("memberflow-onboarding-plan");
  return value === "solo" || value === "business" || value === "network" ? value : "business";
}

const pricing = {
  loyalty: {
    solo: "€25 / месяц · без комиссии",
    business: "€69 / месяц · без комиссии",
    network: "€149 / месяц · без комиссии",
  },
  membership: {
    solo: "€35 / месяц + 3%",
    business: "€79 / месяц + 2,5%",
    network: "€169 / месяц + 2%",
  },
  complete: {
    solo: "€49 / месяц + 2%",
    business: "€119 / месяц + 2%",
    network: "€249 / месяц + 1,5%",
  },
} as const;

const pricingCents = {
  loyalty: {
    solo: 2500,
    business: 6900,
    network: 14900,
  },
  membership: {
    solo: 3500,
    business: 7900,
    network: 16900,
  },
  complete: {
    solo: 4900,
    business: 11900,
    network: 24900,
  },
} as const;

function formatEuro(cents: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

function MembershipPreview({ name, price, uses }: { name: string; price: string; uses: string }) {
  return <Card className="sticky top-6 overflow-hidden bg-[#121320] p-5 text-white shadow-[var(--shadow-lg)]"><div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--primary)]/35 blur-3xl" /><p className="relative text-sm text-slate-300">Live preview</p><h3 className="relative mt-8 text-2xl font-semibold">{name}</h3><p className="relative mt-1 text-slate-300">Всегда чистый автомобиль</p><p className="relative mt-6 text-3xl font-semibold">€{price} <span className="text-sm text-slate-300">/ месяц</span></p><div className="relative mt-6 rounded-2xl bg-white/10 p-4"><p>Две комплексные мойки</p><p className="mt-2 text-sm text-slate-300">Осталось: {uses} из {uses}</p></div></Card>;
}

function LoyaltyPreview({ name, target }: { name: string; target: number }) {
  const filled = Math.max(1, target - 1);
  return <Card className="sticky top-6 bg-[#FBF8F1] p-5 shadow-[var(--shadow-md)]"><p className="text-sm text-slate-500">Live preview</p><h3 className="mt-8 text-2xl font-semibold">{name}</h3><div className="mt-6 flex gap-2">{Array.from({ length: target }, (_, i) => <span key={i} className={i < filled ? "h-8 w-8 rounded-full bg-[var(--primary)] shadow-[0_0_0_4px_rgba(109,93,251,0.1)]" : "h-8 w-8 rounded-full border border-slate-300 bg-white"} />)}</div><p className="mt-5 font-semibold">{filled} из {target} кофе</p><p className="text-sm text-slate-500">Ещё одна покупка до бесплатного кофе</p></Card>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}
