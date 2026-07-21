"use client";

import { AlertTriangle, CreditCard, Eye, Gift, ImageIcon, Palette, QrCodeIcon, RotateCcw, Save, ShieldCheck, Stamp, Upload, WalletCards, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { QrCode } from "@/components/ui/qr-code";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import type { Business, Program } from "@/types";

type EditorSide = "front" | "back";
type WalletTemplate = "minimal" | "gradient" | "image" | "premium";
type TextTone = "light" | "dark";
type SubscriptionMetric = "remaining" | "used" | "nextRenewal" | "status";
type LoyaltyMetric = "stamps" | "points" | "cashback" | "status";
type WalletMetric = SubscriptionMetric | LoyaltyMetric;

export interface WalletDesignSettings {
  logoDataUrl?: string;
  backgroundImageDataUrl?: string;
  businessName: string;
  cardName: string;
  shortDescription: string;
  primaryColor: string;
  secondaryColor: string;
  textTone: TextTone;
  backgroundDimming: number;
  template: WalletTemplate;
  metric: WalletMetric;
  labels: {
    stamps: string;
    toReward: string;
    remainingVisits: string;
    nextRenewal: string;
    reward: string;
  };
  back: {
    description: string;
    terms: string;
    rewardName: string;
    address: string;
    phone: string;
    website: string;
    socials: string;
    branches: string;
    cancellationPolicy: string;
  };
}

const testCustomer = {
  name: "Anna Ozola",
  number: "MF-000184",
  loyalty: "4 из 5 штампов",
  subscription: "2 из 2 услуг",
  nextRenewal: "01.08.2026",
  status: "Active",
};

const inputClass = "w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-[var(--shadow-sm)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]";
const toggleClass = "rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[var(--primary)]";
const activeToggleClass = "border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary)]";

export function WalletCardDesigner({ business, program, source = "onboarding" }: { business?: Business; program?: Program; source?: "onboarding" | "dashboard" }) {
  const defaults = useMemo(() => getDefaultWalletDesign(business, program), [business, program]);
  const storageKey = getWalletDesignStorageKey(program?.id);
  const [settings, setSettings] = useState<WalletDesignSettings>(() => readStoredWalletDesign(storageKey, defaults));
  const [side, setSide] = useState<EditorSide>("front");
  const [toast, setToast] = useState<string | null>(null);
  const programType = program?.type ?? "loyalty";
  const contrastWarning = getContrastRatio(settings.primaryColor, settings.textTone === "light" ? "#ffffff" : "#121320") < 4.5;
  const qrWarning = settings.template === "image" && Boolean(settings.backgroundImageDataUrl) && settings.backgroundDimming < 36;

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings, storageKey]);

  function updateSetting<Key extends keyof WalletDesignSettings>(key: Key, value: WalletDesignSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateLabel<Key extends keyof WalletDesignSettings["labels"]>(key: Key, value: string) {
    setSettings((current) => ({ ...current, labels: { ...current.labels, [key]: value } }));
  }

  function updateBack<Key extends keyof WalletDesignSettings["back"]>(key: Key, value: string) {
    setSettings((current) => ({ ...current, back: { ...current.back, [key]: value } }));
  }

  async function handleUpload(file: File | undefined, target: "logoDataUrl" | "backgroundImageDataUrl") {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateSetting(target, dataUrl);
  }

  function saveDesign() {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
    showToast("Дизайн программы сохранён");
  }

  function resetDesign() {
    setSettings(defaults);
    window.localStorage.setItem(storageKey, JSON.stringify(defaults));
    showToast("Дизайн сброшен");
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  return (
    <div className="relative">
      {toast ? <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-[#121320] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-lg)]">{toast}</div> : null}
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(420px,480px)_1fr]">
        <Card className="h-fit overflow-hidden xl:sticky xl:top-20">
          <CardHeader title="Дизайн программы" description="Настройте, как ваша программа будет выглядеть для клиентов." />
          <div className="border-b border-slate-100 p-4">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              {(["front", "back"] as const).map((item) => (
                <button key={item} type="button" onClick={() => setSide(item)} className={cn("rounded-xl px-3 py-2 text-sm font-bold transition", side === item ? "bg-white text-[var(--foreground)] shadow-[var(--shadow-sm)]" : "text-slate-500 hover:text-slate-800")}>
                  {item === "front" ? "Лицевая сторона" : "Оборотная сторона"}
                </button>
              ))}
            </div>
          </div>

          {side === "front" ? (
            <div className="space-y-6 p-5">
              <SettingsSection icon={Palette} title="Брендинг">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Логотип"><UploadButton label="Загрузить" onChange={(file) => handleUpload(file, "logoDataUrl")} /></Field>
                  <Field label="Фоновое изображение"><UploadButton label="Добавить фон" onChange={(file) => handleUpload(file, "backgroundImageDataUrl")} /></Field>
                  <Field label="Название бизнеса"><input maxLength={34} value={settings.businessName} onChange={(event) => updateSetting("businessName", event.target.value)} className={inputClass} /></Field>
                  <Field label="Название карты"><input maxLength={32} value={settings.cardName} onChange={(event) => updateSetting("cardName", event.target.value)} className={inputClass} /></Field>
                  <Field label="Короткое описание"><input maxLength={74} value={settings.shortDescription} onChange={(event) => updateSetting("shortDescription", event.target.value)} className={inputClass} /></Field>
                  <Field label="Затемнение фона"><input type="range" min={0} max={70} value={settings.backgroundDimming} onChange={(event) => updateSetting("backgroundDimming", Number(event.target.value))} className="w-full accent-[var(--primary)]" /></Field>
                  <Field label="Основной цвет"><input type="color" value={settings.primaryColor} onChange={(event) => updateSetting("primaryColor", event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] bg-white p-1" /></Field>
                  <Field label="Доп. цвет"><input type="color" value={settings.secondaryColor} onChange={(event) => updateSetting("secondaryColor", event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] bg-white p-1" /></Field>
                </div>
                <Field label="Цвет текста">
                  <div className="grid grid-cols-2 gap-2">
                    {(["light", "dark"] as const).map((tone) => <button key={tone} type="button" onClick={() => updateSetting("textTone", tone)} className={cn(toggleClass, settings.textTone === tone && activeToggleClass)}>{tone === "light" ? "Светлый" : "Тёмный"}</button>)}
                  </div>
                </Field>
              </SettingsSection>

              <SettingsSection icon={CreditCard} title="Стиль карты">
                <div className="grid grid-cols-2 gap-2">
                  {(["minimal", "gradient", "image", "premium"] as const).map((template) => <button key={template} type="button" onClick={() => updateSetting("template", template)} className={cn(toggleClass, "capitalize", settings.template === template && activeToggleClass)}>{template}</button>)}
                </div>
              </SettingsSection>

              <SettingsSection icon={programType === "loyalty" ? Stamp : ShieldCheck} title="Основной показатель">
                <div className="grid gap-2 sm:grid-cols-2">
                  {(programType === "loyalty" ? loyaltyMetrics : subscriptionMetrics).map((metric) => <button key={metric.value} type="button" onClick={() => updateSetting("metric", metric.value)} className={cn(toggleClass, "justify-start text-left", settings.metric === metric.value && activeToggleClass)}>{metric.label}</button>)}
                </div>
              </SettingsSection>

              <SettingsSection icon={Gift} title="Подписи">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Штампы"><input maxLength={24} value={settings.labels.stamps} onChange={(event) => updateLabel("stamps", event.target.value)} className={inputClass} /></Field>
                  <Field label="До награды"><input maxLength={24} value={settings.labels.toReward} onChange={(event) => updateLabel("toReward", event.target.value)} className={inputClass} /></Field>
                  <Field label="Осталось посещений"><input maxLength={28} value={settings.labels.remainingVisits} onChange={(event) => updateLabel("remainingVisits", event.target.value)} className={inputClass} /></Field>
                  <Field label="Следующее обновление"><input maxLength={28} value={settings.labels.nextRenewal} onChange={(event) => updateLabel("nextRenewal", event.target.value)} className={inputClass} /></Field>
                  <Field label="Награда"><input maxLength={24} value={settings.labels.reward} onChange={(event) => updateLabel("reward", event.target.value)} className={inputClass} /></Field>
                </div>
              </SettingsSection>
            </div>
          ) : (
            <div className="space-y-5 p-5">
              <SettingsSection icon={ImageIcon} title="Оборотная сторона">
                <Field label="Описание программы"><textarea maxLength={240} value={settings.back.description} onChange={(event) => updateBack("description", event.target.value)} className={cn(inputClass, "min-h-20 py-3")} /></Field>
                <Field label="Условия использования"><textarea maxLength={320} value={settings.back.terms} onChange={(event) => updateBack("terms", event.target.value)} className={cn(inputClass, "min-h-24 py-3")} /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Название награды"><input maxLength={42} value={settings.back.rewardName} onChange={(event) => updateBack("rewardName", event.target.value)} className={inputClass} /></Field>
                  <Field label="Телефон"><input maxLength={28} value={settings.back.phone} onChange={(event) => updateBack("phone", event.target.value)} className={inputClass} /></Field>
                  <Field label="Адрес"><input maxLength={70} value={settings.back.address} onChange={(event) => updateBack("address", event.target.value)} className={inputClass} /></Field>
                  <Field label="Сайт"><input maxLength={52} value={settings.back.website} onChange={(event) => updateBack("website", event.target.value)} className={inputClass} /></Field>
                  <Field label="Соцсети"><input maxLength={52} value={settings.back.socials} onChange={(event) => updateBack("socials", event.target.value)} className={inputClass} /></Field>
                  <Field label="Филиалы"><input maxLength={90} value={settings.back.branches} onChange={(event) => updateBack("branches", event.target.value)} className={inputClass} /></Field>
                </div>
                {programType === "subscription" ? <Field label="Политика отмены"><textarea maxLength={220} value={settings.back.cancellationPolicy} onChange={(event) => updateBack("cancellationPolicy", event.target.value)} className={cn(inputClass, "min-h-20 py-3")} /></Field> : null}
              </SettingsSection>
            </div>
          )}

          <div className="space-y-3 border-t border-slate-100 p-5">
            {contrastWarning ? <Warning text="Проверьте контраст: выбранный цвет текста может читаться недостаточно хорошо." /> : null}
            {qrWarning ? <Warning text="QR-код лучше читается на спокойном фоне. Увеличьте затемнение изображения или выберите другой шаблон." /> : null}
            <div className="grid gap-2 sm:grid-cols-3">
              <Button onClick={saveDesign}><Save className="h-4 w-4" />Сохранить</Button>
              <Button variant="secondary" onClick={resetDesign}><RotateCcw className="h-4 w-4" />Сбросить</Button>
              <LinkButton href="/customer/cards" variant="secondary"><Eye className="h-4 w-4" />Мои карты</LinkButton>
            </div>
          </div>
        </Card>

        <div className="min-w-0 xl:sticky xl:top-20">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Так программа будет выглядеть для клиента</p>
              <p className="text-sm text-slate-500">Дизайн применяется в «Мои карты», на странице программы и в материалах подключения.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setSide((current) => current === "front" ? "back" : "front")}>Показать {side === "front" ? "оборот" : "лицо"}</Button>
            </div>
          </div>
          <ProgramPreview settings={settings} programType={programType} side={side} />
          <div className="mt-4 rounded-3xl border border-violet-100 bg-[var(--primary-soft)] p-4 text-sm text-slate-700">
            <p className="flex items-center gap-2 font-semibold text-[var(--foreground)]"><WalletCards className="h-4 w-4 text-[var(--primary)]" />Единая карта MemberFlow</p>
            <p className="mt-1">Клиент использует одну карту MemberFlow для всех программ. Ваш дизайн будет отображаться внутри его личного кабинета и на странице программы.</p>
          </div>
          <MemberFlowPassInfo />
          {source === "onboarding" ? <div className="mt-5 flex justify-end"><LinkButton href="/onboarding/team">Продолжить к работникам</LinkButton></div> : null}
        </div>
      </div>
    </div>
  );
}

export function OnboardingCardDesignPage() {
  const { businesses, selectedBusinessId, programs } = useDemoStore();
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const latestProgram = [...programs].reverse().find((item) => item.businessId === selectedBusinessId);
  return <WalletCardDesigner business={business} program={latestProgram} source="onboarding" />;
}

export function DashboardCardDesignPage({ programId }: { programId: string }) {
  const { businesses, programs } = useDemoStore();
  const program = programs.find((item) => item.id === programId);
  const business = businesses.find((item) => item.id === program?.businessId);
  if (!program) {
    return (
      <Card className="p-8">
        <CardHeader title="Программа не найдена" description="Выберите существующую программу в разделе программ." />
        <LinkButton href="/dashboard/programs" className="mt-4">Назад к программам</LinkButton>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Дизайн программы</h1>
          <p className="text-sm text-slate-500">{program.name} · отображение в «Мои карты» и материалах подключения</p>
        </div>
        <LinkButton href="/dashboard/programs" variant="secondary">Назад к программам</LinkButton>
      </div>
      <WalletCardDesigner business={business} program={program} source="dashboard" />
    </div>
  );
}

export function getWalletDesignStorageKey(programId?: string) {
  return `memberflow-wallet-design-${programId ?? "new"}`;
}

export function readStoredWalletDesign(storageKey: string, defaults: WalletDesignSettings): WalletDesignSettings {
  if (typeof window === "undefined") return defaults;
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return defaults;
  try {
    return { ...defaults, ...JSON.parse(saved) as Partial<WalletDesignSettings> };
  } catch {
    return defaults;
  }
}

function ProgramPreview({ settings, programType, side }: { settings: WalletDesignSettings; programType: Program["type"]; side: EditorSide }) {
  const metric = getMetricDisplay(settings, programType);
  const style = getWalletCardStyle(settings);
  return (
    <div className="brand-grid rounded-[32px] border border-white/70 bg-white/72 p-5 shadow-[var(--shadow-md)] sm:p-8">
      <div className="mx-auto w-full max-w-[520px] rounded-[32px] bg-[#F4F5F9] p-4 shadow-inner">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Мои карты</p>
            <p className="text-sm font-semibold text-slate-700">{testCustomer.name}</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">{testCustomer.number}</span>
        </div>
        {side === "back" ? (
          <div className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Условия программы</p>
                <h3 className="mt-1 text-xl font-semibold">{settings.cardName}</h3>
              </div>
              <ShieldCheck className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["Описание", settings.back.description],
                ["Условия", settings.back.terms],
                ["Награда", settings.back.rewardName],
                ["Адрес", settings.back.address],
                ["Филиалы", settings.back.branches],
              ].filter(([, value]) => value).map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-medium leading-5 text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[30px] p-5 shadow-[0_18px_60px_rgba(18,19,32,0.16)]" style={style}>
            {settings.backgroundImageDataUrl && settings.template === "image" ? <Image src={settings.backgroundImageDataUrl} alt="" fill className="object-cover" unoptimized /> : null}
            {settings.backgroundImageDataUrl && settings.template === "image" ? <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${settings.backgroundDimming / 100})` }} /> : null}
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">
                  {settings.logoDataUrl ? <Image src={settings.logoDataUrl} alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" unoptimized /> : <span className="text-lg font-black">{settings.businessName[0] ?? "M"}</span>}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold opacity-75">{settings.businessName}</p>
                  <h3 className="truncate text-2xl font-semibold tracking-tight">{settings.cardName}</h3>
                </div>
              </div>
              <span className="rounded-full bg-white/18 px-2.5 py-1 text-xs font-bold ring-1 ring-white/18">{programType === "subscription" ? "Подписка" : "Лояльность"}</span>
            </div>
            <p className="relative mt-4 max-w-[88%] text-sm leading-6 opacity-80">{settings.shortDescription}</p>
            <div className="relative mt-6 rounded-[24px] bg-white/14 p-4 ring-1 ring-white/18">
              <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">{metric.label}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">{metric.value}</p>
              <p className="mt-2 text-sm opacity-75">{metric.helper}</p>
              {programType === "loyalty" ? <div className="mt-4 flex gap-2">{Array.from({ length: 5 }, (_, index) => <span key={index} className={cn("h-8 w-8 rounded-full ring-1 ring-white/30", index < 4 ? "bg-white" : "bg-white/18")} />)}</div> : <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/18"><span className="block h-full w-full rounded-full bg-white" /></div>}
            </div>
            <div className="relative mt-5 flex items-center justify-between gap-3 rounded-2xl bg-white/12 p-3 text-sm font-semibold ring-1 ring-white/14">
              <span>{settings.labels.reward}: {settings.back.rewardName}</span>
              <span>Подробнее →</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberFlowPassInfo() {
  return (
    <div className="mt-4 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[var(--shadow-sm)] sm:grid-cols-[210px_1fr]">
      <div className="rounded-[24px] bg-[#121320] p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-sm font-black">MF</span>
          <div>
            <p className="text-xs font-bold text-white/55">MemberFlow Pass</p>
            <p className="text-sm font-semibold">{testCustomer.name}</p>
          </div>
        </div>
        <p className="mt-5 text-2xl font-semibold">5 активных программ</p>
        <div className="mt-4 rounded-2xl bg-white p-3">
          <QrCode value="memberflow:customer:mfp_c_8f3k29x7" label="" size={104} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-bold text-white/70">
          <span>{testCustomer.number}</span>
          <span>Мои карты →</span>
        </div>
      </div>
      <div className="flex flex-col justify-center text-sm text-slate-600">
        <p className="flex items-center gap-2 font-semibold text-[var(--foreground)]"><QrCodeIcon className="h-4 w-4 text-[var(--primary)]" />QR клиента</p>
        <p className="mt-2">Персональный QR одинаковый для всех программ и содержит только непрозрачный token <b>mfp_c_8f3k29x7</b>. Бизнес не меняет логотип, цвет или структуру общей Wallet-карты.</p>
      </div>
    </div>
  );
}

function getWalletCardStyle(settings: WalletDesignSettings): React.CSSProperties {
  const color = settings.textTone === "light" ? "#ffffff" : "#121320";
  if (settings.template === "minimal") {
    return { background: settings.textTone === "light" ? settings.primaryColor : "#F8F7FF", color };
  }
  if (settings.template === "image") {
    return { background: settings.primaryColor, color };
  }
  if (settings.template === "premium") {
    return { background: `radial-gradient(circle at 25% 10%, ${settings.primaryColor} 0, transparent 34%), linear-gradient(145deg, #0C0D16 0%, ${settings.secondaryColor} 54%, #121320 100%)`, color: "#ffffff" };
  }
  return { background: `linear-gradient(145deg, ${settings.primaryColor}, ${settings.secondaryColor})`, color };
}

function getMetricDisplay(settings: WalletDesignSettings, programType: Program["type"]) {
  if (programType === "subscription") {
    const map: Record<SubscriptionMetric, { label: string; value: string; helper: string }> = {
      remaining: { label: settings.labels.remainingVisits, value: testCustomer.subscription, helper: "Доступно в текущем периоде" },
      used: { label: "Использовано услуг", value: "0 из 2", helper: "С начала месяца" },
      nextRenewal: { label: settings.labels.nextRenewal, value: testCustomer.nextRenewal, helper: "Лимит обновится автоматически" },
      status: { label: "Статус подписки", value: testCustomer.status, helper: "Подписка активна" },
    };
    const metric = (settings.metric as SubscriptionMetric) in map ? settings.metric as SubscriptionMetric : "remaining";
    return map[metric];
  }
  const map: Record<LoyaltyMetric, { label: string; value: string; helper: string }> = {
    stamps: { label: settings.labels.stamps, value: testCustomer.loyalty, helper: settings.labels.toReward },
    points: { label: "Баллы", value: "420", helper: "80 баллов до награды" },
    cashback: { label: "Cashback", value: "€8,40", helper: "Доступно на следующую покупку" },
    status: { label: "Статус клиента", value: "Regular", helper: settings.labels.reward },
  };
  const metric = (settings.metric as LoyaltyMetric) in map ? settings.metric as LoyaltyMetric : "stamps";
  return map[metric];
}

function getDefaultWalletDesign(business?: Business, program?: Program): WalletDesignSettings {
  const isSubscription = program?.type === "subscription";
  return {
    businessName: business?.name ?? "Wash Club",
    cardName: program?.name ?? (isSubscription ? "Wash Club" : "Coffee Regular"),
    shortDescription: program?.description ?? (isSubscription ? "Включённые услуги каждый месяц" : "Штампы, награды и повторные визиты"),
    primaryColor: business?.brandColor ?? "#6D5DFB",
    secondaryColor: "#121320",
    textTone: "light",
    backgroundDimming: 42,
    template: "gradient",
    metric: isSubscription ? "remaining" : "stamps",
    labels: {
      stamps: "Штампы",
      toReward: "До награды",
      remainingVisits: "Осталось посещений",
      nextRenewal: "Следующее обновление",
      reward: "Награда",
    },
    back: {
      description: program?.description ?? "Карта действует во всех указанных точках бизнеса.",
      terms: isSubscription ? "Услуги списываются сотрудником после сканирования QR-кода." : "Штампы начисляются после подтверждённой покупки или посещения.",
      rewardName: program?.rewardName ?? "Бесплатная услуга",
      address: business?.address ?? "Brivibas 21, Riga",
      phone: business?.phone ?? "+371 20 000 000",
      website: "memberflow.app",
      socials: "@memberflow",
      branches: business?.branches.join(", ") ?? "Main location",
      cancellationPolicy: program?.cancellationRules ?? "Отмена применяется со следующего оплаченного периода.",
    },
  };
}

function SettingsSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return <section className="space-y-3"><h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-slate-500"><Icon className="h-4 w-4 text-[var(--primary)]" />{title}</h3>{children}</section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-slate-700"><span className="mb-2 block">{label}</span>{children}</label>;
}

function UploadButton({ label, onChange }: { label: string; onChange: (file?: File) => void }) {
  return <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-600 transition hover:bg-white"><Upload className="h-4 w-4" />{label}<input type="file" accept="image/*" className="hidden" onChange={(event) => onChange(event.target.files?.[0])} /></label>;
}

function Warning({ text }: { text: string }) {
  return <div className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" />{text}</div>;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized.length === 3 ? normalized.split("").map((item) => item + item).join("") : normalized, 16);
  return { red: (value >> 16) & 255, green: (value >> 8) & 255, blue: value & 255 };
}

function getRelativeLuminance(hex: string) {
  const { red, green, blue } = hexToRgb(hex);
  const values = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

function getContrastRatio(first: string, second: string) {
  const light = Math.max(getRelativeLuminance(first), getRelativeLuminance(second));
  const dark = Math.min(getRelativeLuminance(first), getRelativeLuminance(second));
  return (light + 0.05) / (dark + 0.05);
}

const loyaltyMetrics: { value: LoyaltyMetric; label: string }[] = [
  { value: "stamps", label: "Штампы" },
  { value: "points", label: "Баллы" },
  { value: "cashback", label: "Cashback" },
  { value: "status", label: "Статус клиента" },
];

const subscriptionMetrics: { value: SubscriptionMetric; label: string }[] = [
  { value: "remaining", label: "Осталось услуг" },
  { value: "used", label: "Использовано услуг" },
  { value: "nextRenewal", label: "Дата обновления" },
  { value: "status", label: "Статус подписки" },
];
