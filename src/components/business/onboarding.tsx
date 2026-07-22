"use client";

import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CalendarCheck,
  Check,
  Clock,
  Eye,
  Gift,
  History,
  Phone,
  Rocket,
  Sparkles,
  Tag,
  Upload,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PosterBuilder } from "@/components/poster/poster-builder";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { QrCode } from "@/components/ui/qr-code";
import content from "@/data/onboarding-content.json";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import type { Business, Program } from "@/types";

type LanguageCode = keyof typeof content;
type StepKey = "business" | "branding" | "modules" | "loyalty" | "registration" | "services" | "automation" | "preview" | "launch";
type ModuleKey = "loyalty" | "offers" | "services" | "booking" | "packages" | "subscriptions" | "history" | "wallet" | "contacts" | "petProfile";
type RegistrationFieldKey = "firstName" | "lastName" | "email" | "phone" | "birthday" | "marketingConsent" | "carNumber" | "carBrand" | "carModel" | "petName" | "petType" | "petBreed" | "petBirthday" | "fitnessGoal" | "preferredBranch";
type PreviewScreen = "registration" | "home" | "rewards" | "offers" | "services" | "profile";

type FieldState = { enabled: boolean; required: boolean };
type ServiceDraft = { id: string; name: string; description: string; price: string; duration: string; category: string; action: string };

type OnboardingDraft = {
  business: {
    name: string;
    category: string;
    country: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    timezone: string;
    currency: string;
    language: LanguageCode;
  };
  brand: {
    logoDataUrl?: string;
    coverDataUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    buttonColor: string;
    theme: "light" | "dark";
    buttonShape: "soft" | "round" | "sharp";
    greeting: string;
    displayName: string;
  };
  modules: Record<ModuleKey, boolean>;
  loyalty: {
    mechanic: "stamps" | "points" | "visits" | "manual";
    stampCount: number;
    stampName: string;
    rewardName: string;
    rewardDescription: string;
    rewardExpiry: string;
    repeatable: boolean;
  };
  registration: Record<RegistrationFieldKey, FieldState>;
  services: {
    items: ServiceDraft[];
    mainAction: "book" | "services" | "call" | "route" | "package" | "subscription";
  };
  automation: {
    scenario: "inactive" | "secondVisit" | "oneStamp" | "unusedReward" | "packageEnding" | "birthday";
    inactiveDays: number;
    offerText: string;
    discount: string;
    offerExpiry: string;
    enabled: boolean;
  };
  status: "draft" | "published";
  completed: boolean;
  currentStep: StepKey;
  updatedAt: string;
};

const DRAFT_KEY = "memberflow-cabinet-onboarding-draft";
const inputClass = "h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-[var(--shadow-sm)] transition focus-visible:ring-2 focus-visible:ring-[var(--primary)]";

const routeByStep: Record<StepKey, string> = {
  business: "/onboarding/business",
  branding: "/onboarding/branding",
  modules: "/onboarding/modules",
  loyalty: "/onboarding/loyalty",
  registration: "/onboarding/registration",
  services: "/onboarding/services",
  automation: "/onboarding/automation",
  preview: "/onboarding/preview",
  launch: "/onboarding/launch",
};

const stepOrder: StepKey[] = ["business", "branding", "modules", "loyalty", "registration", "services", "automation", "preview", "launch"];
const groupedSteps = [
  { group: 0, steps: ["business"] as StepKey[] },
  { group: 1, steps: ["branding"] as StepKey[] },
  { group: 2, steps: ["modules", "loyalty", "services", "automation"] as StepKey[] },
  { group: 3, steps: ["registration", "preview"] as StepKey[] },
  { group: 4, steps: ["launch"] as StepKey[] },
];

const moduleMeta: Array<{ key: ModuleKey; icon: typeof Gift; comingSoon?: boolean }> = [
  { key: "loyalty", icon: Gift },
  { key: "offers", icon: Tag },
  { key: "services", icon: Sparkles },
  { key: "booking", icon: CalendarCheck },
  { key: "packages", icon: WalletCards },
  { key: "subscriptions", icon: WalletCards },
  { key: "history", icon: History },
  { key: "wallet", icon: WalletCards },
  { key: "contacts", icon: Phone },
  { key: "petProfile", icon: Sparkles, comingSoon: true },
];

const baseRegistration: Record<RegistrationFieldKey, FieldState> = {
  firstName: { enabled: true, required: true },
  lastName: { enabled: true, required: false },
  email: { enabled: true, required: false },
  phone: { enabled: true, required: true },
  birthday: { enabled: false, required: false },
  marketingConsent: { enabled: true, required: false },
  carNumber: { enabled: false, required: false },
  carBrand: { enabled: false, required: false },
  carModel: { enabled: false, required: false },
  petName: { enabled: false, required: false },
  petType: { enabled: false, required: false },
  petBreed: { enabled: false, required: false },
  petBirthday: { enabled: false, required: false },
  fitnessGoal: { enabled: false, required: false },
  preferredBranch: { enabled: false, required: false },
};

function defaultDraft(language: LanguageCode = "ru"): OnboardingDraft {
  const t = content[language];
  return {
    business: {
      name: "Wash Club",
      category: t.categories[0],
      country: "Latvia",
      city: "Riga",
      address: "Brivibas 21",
      phone: "+371 20 000 000",
      email: "hello@washclub.lv",
      website: "@washclub",
      timezone: "Europe/Riga",
      currency: "EUR",
      language,
    },
    brand: {
      primaryColor: "#6D5DFB",
      secondaryColor: "#20B486",
      buttonColor: "#6D5DFB",
      theme: "light",
      buttonShape: "soft",
      greeting: "Anna, your car is almost ready for a reward",
      displayName: "Wash Club",
    },
    modules: {
      loyalty: true,
      offers: true,
      services: true,
      booking: true,
      packages: true,
      subscriptions: false,
      history: true,
      wallet: true,
      contacts: true,
      petProfile: false,
    },
    loyalty: {
      mechanic: "stamps",
      stampCount: 6,
      stampName: "visit",
      rewardName: "Complex wash free",
      rewardDescription: "Free premium wash after six visits",
      rewardExpiry: "60 days",
      repeatable: true,
    },
    registration: { ...baseRegistration, carNumber: { enabled: true, required: true }, carBrand: { enabled: true, required: false }, carModel: { enabled: true, required: false } },
    services: {
      items: [
        { id: "srv-1", name: "Complex wash", description: "Exterior, interior and mats", price: "29.99", duration: "45 min", category: "Wash", action: "Book" },
        { id: "srv-2", name: "Protective coating", description: "Extra shine and protection", price: "18.00", duration: "20 min", category: "Care", action: "Add" },
      ],
      mainAction: "book",
    },
    automation: { scenario: "inactive", inactiveDays: 30, offerText: "-20% on your next visit", discount: "20%", offerExpiry: "7 days", enabled: true },
    status: "draft",
    completed: false,
    currentStep: "business",
    updatedAt: new Date(0).toISOString(),
  };
}

function readLanguage(): LanguageCode {
  if (typeof window === "undefined") return "ru";
  const value = window.localStorage.getItem("memberflow-language");
  return value === "ru" || value === "en" || value === "lv" ? value : "ru";
}

function readDraft(): OnboardingDraft {
  const fallback = defaultDraft(readLanguage());
  if (typeof window === "undefined") return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? "null") as Partial<OnboardingDraft> | null;
    if (!parsed) return fallback;
    return {
      ...fallback,
      ...parsed,
      business: { ...fallback.business, ...parsed.business },
      brand: { ...fallback.brand, ...parsed.brand },
      modules: { ...fallback.modules, ...parsed.modules },
      loyalty: { ...fallback.loyalty, ...parsed.loyalty },
      registration: { ...fallback.registration, ...parsed.registration },
      services: { ...fallback.services, ...parsed.services, items: parsed.services?.items?.length ? parsed.services.items : fallback.services.items },
      automation: { ...fallback.automation, ...parsed.automation },
    };
  } catch {
    return fallback;
  }
}

export function BusinessStep() {
  return <OnboardingStep stepKey="business" />;
}

export function ProgramTypeStep() {
  return <OnboardingStep stepKey="branding" />;
}

export function SubscriptionStep() {
  return <OnboardingStep stepKey="modules" />;
}

export function LoyaltyStep() {
  return <OnboardingStep stepKey="loyalty" />;
}

export function TeamStep() {
  return <OnboardingStep stepKey="registration" />;
}

export function BrandingStep() {
  return <OnboardingStep stepKey="branding" />;
}

export function ModulesStep() {
  return <OnboardingStep stepKey="modules" />;
}

export function RegistrationStep() {
  return <OnboardingStep stepKey="registration" />;
}

export function ServicesStep() {
  return <OnboardingStep stepKey="services" />;
}

export function AutomationStep() {
  return <OnboardingStep stepKey="automation" />;
}

export function PreviewStep() {
  return <OnboardingStep stepKey="preview" />;
}

export function LaunchStep() {
  return <OnboardingStep stepKey="launch" />;
}

function OnboardingStep({ stepKey }: { stepKey: StepKey }) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => defaultDraft());
  const [language, setLanguage] = useState<LanguageCode>("ru");
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const dirtyRef = useRef(false);
  const t = content[language];

  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = readDraft();
      setDraft({ ...next, currentStep: stepKey });
      setLanguage(next.business.language);
      setHydrated(true);
      dirtyRef.current = false;
    }, 0);
    return () => window.clearTimeout(id);
  }, [stepKey]);

  useEffect(() => {
    const handler = (event: Event) => {
      const nextLanguage = (event as CustomEvent<LanguageCode>).detail;
      if (!nextLanguage || !(nextLanguage in content)) return;
      setLanguage(nextLanguage);
      setDraft((current) => ({ ...current, business: { ...current.business, language: nextLanguage } }));
    };
    window.addEventListener("memberflow-language-change", handler);
    return () => window.removeEventListener("memberflow-language-change", handler);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, currentStep: stepKey, updatedAt: new Date().toISOString() }));
    dirtyRef.current = true;
  }, [draft, hydrated, stepKey]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const visibleSteps = useMemo(() => stepOrder.filter((item) => item !== "loyalty" || draft.modules.loyalty), [draft.modules.loyalty]);
  const index = visibleSteps.indexOf(stepKey);
  const previous = visibleSteps[Math.max(0, index - 1)];
  const next = visibleSteps[Math.min(visibleSteps.length - 1, index + 1)];
  const optional = stepKey === "services" || stepKey === "automation";

  function update(patch: Partial<OnboardingDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function validate() {
    if (stepKey === "business") {
      if (!draft.business.name.trim()) return t.validation.businessName;
      if (!draft.business.category.trim()) return t.validation.category;
    }
    if (stepKey === "modules" && !Object.entries(draft.modules).some(([key, enabled]) => enabled && !moduleMeta.find((item) => item.key === key)?.comingSoon)) return t.validation.modules;
    if (stepKey === "registration") {
      const emailEnabled = draft.registration.email.enabled;
      const phoneEnabled = draft.registration.phone.enabled;
      if (!emailEnabled && !phoneEnabled) return t.validation.identity;
    }
    return null;
  }

  function go(target: StepKey) {
    const currentError = target !== previous ? validate() : null;
    if (currentError) {
      setError(currentError);
      return;
    }
    setError(null);
    trackOnboardingEvent(stepEvent(stepKey));
    router.push(routeByStep[target]);
  }

  return (
    <main className="brand-grid min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[#F4F5F9]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <LinkButton href="/" variant="secondary" className="hidden sm:inline-flex">{t.header.home}</LinkButton>
            <LinkButton href="/login" variant="secondary">{t.header.login}</LinkButton>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-8">
        <aside className="h-fit rounded-[28px] border border-white/70 bg-white/86 p-4 shadow-[var(--shadow-sm)] backdrop-blur lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Setup flow</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]"><Clock className="h-3.5 w-3.5" />{t.header.time}</span>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2 lg:block lg:space-y-2">
            {groupedSteps.map((groupItem) => {
              const groupSteps = groupItem.steps.filter((item) => item !== "loyalty" || draft.modules.loyalty);
              if (!groupSteps.length) return null;
              const active = groupSteps.includes(stepKey);
              const available = visibleSteps.indexOf(groupSteps[0]) <= index;
              return (
                <button
                  key={groupItem.group}
                  type="button"
                  onClick={() => available && go(groupSteps[0])}
                  disabled={!available}
                  className={cn(
                    "flex min-h-12 items-center justify-center gap-2 rounded-2xl px-2 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-[var(--primary)] lg:w-full lg:justify-start lg:px-3",
                    active ? "bg-[#121320] text-white shadow-[var(--shadow-md)]" : available ? "bg-white text-slate-700 hover:bg-slate-50" : "cursor-not-allowed bg-slate-100 text-slate-400",
                  )}
                >
                  <span className={cn("grid h-7 w-7 place-items-center rounded-full text-xs", active ? "bg-[var(--primary)] text-white" : "bg-[var(--primary-soft)] text-[var(--primary)]")}>{groupItem.group + 1}</span>
                  <span className="hidden lg:inline">{t.groups[groupItem.group]}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 hidden rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 lg:block">
            <b className="text-slate-800">{t.header.save}</b>
            <p className="mt-1">{t.header.saveLater}</p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--primary)]">{index + 1} / {visibleSteps.length}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">{t.steps[stepKey].title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{t.steps[stepKey].description}</p>
            </div>
            <Button variant="secondary" onClick={() => saveAndLater(draft)}>{t.header.saveLater}</Button>
          </div>

          {error ? <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div> : null}

          {stepKey === "business" ? <BusinessPanel draft={draft} update={update} t={t} language={language} /> : null}
          {stepKey === "branding" ? <BrandingPanel draft={draft} update={update} t={t} /> : null}
          {stepKey === "modules" ? <ModulesPanel draft={draft} update={update} t={t} /> : null}
          {stepKey === "loyalty" ? <LoyaltyPanel draft={draft} update={update} t={t} /> : null}
          {stepKey === "registration" ? <RegistrationPanel draft={draft} update={update} t={t} /> : null}
          {stepKey === "services" ? <ServicesPanel draft={draft} update={update} t={t} /> : null}
          {stepKey === "automation" ? <AutomationPanel draft={draft} update={update} t={t} /> : null}
          {stepKey === "preview" ? <PreviewPanel draft={draft} update={update} t={t} /> : null}
          {stepKey === "launch" ? <LaunchPanel draft={draft} update={update} t={t} published={published || draft.status === "published"} setPublished={setPublished} /> : null}

          <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
            <Button variant="secondary" disabled={index === 0} onClick={() => go(previous)}><ArrowLeft className="h-4 w-4" />{t.buttons.back}</Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {optional ? <Button variant="ghost" onClick={() => go(next)}>{t.buttons.skip}</Button> : null}
              {stepKey !== "launch" ? <Button onClick={() => go(next)}>{t.buttons.next}<ArrowRight className="h-4 w-4" /></Button> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function BusinessPanel({ draft, update, t, language }: PanelProps & { language: LanguageCode }) {
  const fields = t.fields;
  function setBusiness(patch: Partial<OnboardingDraft["business"]>) {
    const nextBusiness = { ...draft.business, ...patch };
    update({ business: nextBusiness, brand: { ...draft.brand, displayName: patch.name ?? draft.brand.displayName } });
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label={fields.businessName} value={draft.business.name} onChange={(value) => setBusiness({ name: value })} maxLength={42} />
          <SelectField label={fields.category} value={draft.business.category} onChange={(value) => applyCategoryPreset(value, draft, update, language)} options={[...t.categories]} />
          <TextField label={fields.country} value={draft.business.country} onChange={(value) => setBusiness({ country: value })} />
          <TextField label={fields.city} value={draft.business.city} onChange={(value) => setBusiness({ city: value })} />
          <TextField label={fields.address} value={draft.business.address} onChange={(value) => setBusiness({ address: value })} />
          <TextField label={fields.phone} value={draft.business.phone} onChange={(value) => setBusiness({ phone: value })} />
          <TextField label={fields.email} type="email" value={draft.business.email} onChange={(value) => setBusiness({ email: value })} />
          <TextField label={fields.website} value={draft.business.website} onChange={(value) => setBusiness({ website: value })} />
          <SelectField label={fields.timezone} value={draft.business.timezone} onChange={(value) => setBusiness({ timezone: value })} options={["Europe/Riga", "Europe/Vilnius", "Europe/Tallinn", "Europe/Berlin"]} />
          <SelectField label={fields.currency} value={draft.business.currency} onChange={(value) => setBusiness({ currency: value })} options={["EUR", "USD", "GBP"]} />
          <SelectField label={fields.language} value={draft.business.language} onChange={(value) => setBusiness({ language: value as LanguageCode })} options={["ru", "en", "lv"]} />
        </div>
      </Card>
      <ClientCabinetPreview draft={draft} t={t} compact />
    </div>
  );
}

function BrandingPanel({ draft, update, t }: PanelProps) {
  function setBrand(patch: Partial<OnboardingDraft["brand"]>) {
    update({ brand: { ...draft.brand, ...patch } });
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <UploadField label={t.fields.logo} onLoad={(dataUrl) => setBrand({ logoDataUrl: dataUrl })} />
          <UploadField label={t.fields.cover} onLoad={(dataUrl) => setBrand({ coverDataUrl: dataUrl })} />
          <ColorField label={t.fields.primaryColor} value={draft.brand.primaryColor} onChange={(value) => setBrand({ primaryColor: value })} />
          <ColorField label={t.fields.secondaryColor} value={draft.brand.secondaryColor} onChange={(value) => setBrand({ secondaryColor: value })} />
          <ColorField label={t.fields.buttonColor} value={draft.brand.buttonColor} onChange={(value) => setBrand({ buttonColor: value })} />
          <SelectField label={t.fields.theme} value={draft.brand.theme} onChange={(value) => setBrand({ theme: value as OnboardingDraft["brand"]["theme"] })} options={[t.themes.light, t.themes.dark]} values={["light", "dark"]} />
          <SelectField label={t.fields.buttonShape} value={draft.brand.buttonShape} onChange={(value) => setBrand({ buttonShape: value as OnboardingDraft["brand"]["buttonShape"] })} options={[t.shapes.soft, t.shapes.round, t.shapes.sharp]} values={["soft", "round", "sharp"]} />
          <TextField label={t.fields.displayName} value={draft.brand.displayName} onChange={(value) => setBrand({ displayName: value })} maxLength={32} />
          <label className="text-sm font-medium md:col-span-2">
            {t.fields.greeting}
            <textarea className="mt-1 min-h-24 w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm shadow-[var(--shadow-sm)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]" maxLength={110} value={draft.brand.greeting} onChange={(event) => setBrand({ greeting: event.target.value })} />
          </label>
        </div>
      </Card>
      <ClientCabinetPreview draft={draft} t={t} />
    </div>
  );
}

function ModulesPanel({ draft, update, t }: PanelProps) {
  function toggle(key: ModuleKey, enabled: boolean) {
    update({ modules: { ...draft.modules, [key]: enabled } });
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          {moduleMeta.map((item) => {
            const Icon = item.icon;
            const selected = draft.modules[item.key];
            return (
              <button
                key={item.key}
                type="button"
                disabled={item.comingSoon}
                onClick={() => toggle(item.key, !selected)}
                className={cn(
                  "min-h-28 rounded-[22px] border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                  selected ? "border-[var(--primary)] bg-[var(--primary-soft)] shadow-[var(--shadow-sm)]" : "border-[var(--border)] bg-white hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]",
                  item.comingSoon && "cursor-not-allowed opacity-60",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className={cn("h-5 w-5", selected ? "text-[var(--primary)]" : "text-slate-500")} />
                  {item.comingSoon ? <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{t.comingSoon}</span> : selected ? <Check className="h-5 w-5 text-[var(--primary)]" /> : null}
                </div>
                <p className="mt-4 font-semibold">{t.modules[item.key]}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{moduleDescription(item.key, draft.business.category)}</p>
              </button>
            );
          })}
        </div>
      </Card>
      <ClientCabinetPreview draft={draft} t={t} />
    </div>
  );
}

function LoyaltyPanel({ draft, update, t }: PanelProps) {
  if (!draft.modules.loyalty) return <SkipPanel t={t} title={t.steps.loyalty.title} />;
  function setLoyalty(patch: Partial<OnboardingDraft["loyalty"]>) {
    update({ loyalty: { ...draft.loyalty, ...patch } });
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Механика" value={draft.loyalty.mechanic} onChange={(value) => setLoyalty({ mechanic: value as OnboardingDraft["loyalty"]["mechanic"] })} options={["Штампы за посещения", "Баллы за покупки", "Количество посещений", "Ручное начисление"]} values={["stamps", "points", "visits", "manual"]} />
          <TextField label={t.fields.stampCount} type="number" value={String(draft.loyalty.stampCount)} onChange={(value) => setLoyalty({ stampCount: Math.max(2, Number(value) || 6) })} />
          <TextField label={t.fields.stampName} value={draft.loyalty.stampName} onChange={(value) => setLoyalty({ stampName: value })} />
          <TextField label={t.fields.rewardName} value={draft.loyalty.rewardName} onChange={(value) => setLoyalty({ rewardName: value })} />
          <TextField label={t.fields.rewardDescription} value={draft.loyalty.rewardDescription} onChange={(value) => setLoyalty({ rewardDescription: value })} />
          <TextField label={t.fields.rewardExpiry} value={draft.loyalty.rewardExpiry} onChange={(value) => setLoyalty({ rewardExpiry: value })} />
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold">
            <input type="checkbox" checked={draft.loyalty.repeatable} onChange={(event) => setLoyalty({ repeatable: event.target.checked })} />
            {t.fields.repeatable}
          </label>
        </div>
        <div className="mt-5 rounded-2xl bg-[var(--primary-soft)] p-4 text-sm text-slate-700">{t.steps.loyalty.example}</div>
      </Card>
      <ClientCabinetPreview draft={draft} t={t} screen="rewards" />
    </div>
  );
}

function RegistrationPanel({ draft, update, t }: PanelProps) {
  function setField(key: RegistrationFieldKey, patch: Partial<FieldState>) {
    update({ registration: { ...draft.registration, [key]: { ...draft.registration[key], ...patch } } });
  }
  const entries = visibleRegistrationKeys(draft.business.category).map((key) => [key, draft.registration[key]] as [RegistrationFieldKey, FieldState]);
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="p-5 sm:p-6">
        <div className="mb-4 rounded-2xl bg-[var(--primary-soft)] p-4 text-sm text-slate-700">{categoryFieldsNote(draft.business.category, t)}</div>
        <div className="space-y-3">
          {entries.map(([key, field]) => (
            <div key={key} className="grid gap-3 rounded-2xl border border-[var(--border)] bg-white p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <div>
                <p className="font-semibold">{t.registrationFields[key]}</p>
                <p className="text-xs text-slate-500">{sensitiveHelp(key, t)}</p>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={field.enabled} onChange={(event) => setField(key, { enabled: event.target.checked, required: event.target.checked ? field.required : false })} />{t.registrationControls.show}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={!field.enabled || key === "marketingConsent"} checked={field.required} onChange={(event) => setField(key, { required: event.target.checked })} />{t.registrationControls.required}</label>
            </div>
          ))}
        </div>
      </Card>
      <RegistrationPreview draft={draft} t={t} />
    </div>
  );
}

function ServicesPanel({ draft, update, t }: PanelProps) {
  function setService(id: string, patch: Partial<ServiceDraft>) {
    update({ services: { ...draft.services, items: draft.services.items.map((item) => item.id === id ? { ...item, ...patch } : item) } });
  }
  function addService() {
    if (draft.services.items.length >= 3) return;
    update({ services: { ...draft.services, items: [...draft.services.items, { id: `srv-${Date.now()}`, name: "", description: "", price: "", duration: "", category: "", action: "" }] } });
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="p-5 sm:p-6">
        <SelectField label={t.fields.mainAction} value={draft.services.mainAction} onChange={(value) => update({ services: { ...draft.services, mainAction: value as OnboardingDraft["services"]["mainAction"] } })} options={["Записаться", "Посмотреть услуги", "Позвонить", "Открыть маршрут", "Купить пакет", "Управлять подпиской"]} values={["book", "services", "call", "route", "package", "subscription"]} />
        <div className="mt-5 space-y-4">
          {draft.services.items.map((service) => (
            <div key={service.id} className="rounded-[22px] border border-[var(--border)] bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <TextField label={t.fields.serviceName} value={service.name} onChange={(value) => setService(service.id, { name: value })} />
                <TextField label={t.fields.servicePrice} value={service.price} onChange={(value) => setService(service.id, { price: value })} />
                <TextField label={t.fields.serviceDuration} value={service.duration} onChange={(value) => setService(service.id, { duration: value })} />
                <TextField label={t.fields.serviceCategory} value={service.category} onChange={(value) => setService(service.id, { category: value })} />
                <TextField label={t.fields.serviceDescription} value={service.description} onChange={(value) => setService(service.id, { description: value })} />
                <TextField label={t.fields.serviceAction} value={service.action} onChange={(value) => setService(service.id, { action: value })} />
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-4" variant="secondary" disabled={draft.services.items.length >= 3} onClick={addService}>Добавить услугу</Button>
      </Card>
      <ClientCabinetPreview draft={draft} t={t} screen="services" />
    </div>
  );
}

function AutomationPanel({ draft, update, t }: PanelProps) {
  function setAutomation(patch: Partial<OnboardingDraft["automation"]>) {
    update({ automation: { ...draft.automation, ...patch } });
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Сценарий" value={draft.automation.scenario} onChange={(value) => setAutomation({ scenario: value as OnboardingDraft["automation"]["scenario"] })} options={["Вернуть неактивного клиента", "После первого визита", "Остался один штамп", "Награда не использована", "Заканчивается пакет", "День рождения"]} values={["inactive", "secondVisit", "oneStamp", "unusedReward", "packageEnding", "birthday"]} />
          <TextField label={t.fields.inactiveDays} type="number" value={String(draft.automation.inactiveDays)} onChange={(value) => setAutomation({ inactiveDays: Number(value) || 30 })} />
          <TextField label={t.fields.offerText} value={draft.automation.offerText} onChange={(value) => setAutomation({ offerText: value })} />
          <TextField label={t.fields.discount} value={draft.automation.discount} onChange={(value) => setAutomation({ discount: value })} />
          <TextField label={t.fields.offerExpiry} value={draft.automation.offerExpiry} onChange={(value) => setAutomation({ offerExpiry: value })} />
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold"><input type="checkbox" checked={draft.automation.enabled} onChange={(event) => setAutomation({ enabled: event.target.checked })} />{t.fields.enabled}</label>
        </div>
        <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">{t.steps.automation.note}</div>
      </Card>
      <Card className="overflow-hidden p-5">
        <div className="rounded-[24px] bg-[#121320] p-5 text-white">
          <BellRing className="h-6 w-6 text-violet-200" />
          <p className="mt-5 text-lg font-semibold">Robert has not visited for {draft.automation.inactiveDays} days.</p>
          <p className="mt-2 text-sm text-slate-300">MemberFlow creates a personal offer and reminds him about {draft.brand.displayName || draft.business.name}.</p>
          <div className="mt-4 rounded-2xl bg-white p-4 text-[#121320]">
            <p className="text-sm font-semibold">{draft.automation.offerText}</p>
            <p className="mt-1 text-xs text-slate-500">Valid for {draft.automation.offerExpiry}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PreviewPanel({ draft, t }: PanelProps) {
  const [screen, setScreen] = useState<PreviewScreen>("home");
  const screens: PreviewScreen[] = ["registration", "home", "rewards", "offers", "services", "profile"];
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {screens.map((item, index) => (
            <button key={item} type="button" onClick={() => setScreen(item)} className={cn("rounded-2xl border p-4 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]", screen === item ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]" : "border-[var(--border)] bg-white")}>{t.preview.screens[index]}</button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl bg-[var(--primary-soft)] p-4 text-sm text-slate-700">Preview показывает демонстрационного клиента и безопасно использует введённые настройки бренда. Можно вернуться к любому этапу через stepper.</div>
      </Card>
      <ClientCabinetPreview draft={draft} t={t} screen={screen} />
    </div>
  );
}

function LaunchPanel({ draft, update, t, published, setPublished }: PanelProps & { published: boolean; setPublished: (value: boolean) => void }) {
  const { businesses, selectedBusinessId, programs, updateBusiness, createProgram, showToast } = useDemoStore();
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const preparedBusiness = business ? mergeBusiness(business, draft) : undefined;
  const launchProgram = findLaunchProgram(programs, selectedBusinessId, draft) ?? makePreviewProgram(selectedBusinessId, draft);
  const joinUrl = `https://memberflow.demo/join/${launchProgram.id}`;

  function publish() {
    updateBusiness(selectedBusinessId, {
      name: draft.business.name,
      category: draft.business.category,
      city: draft.business.city,
      address: draft.business.address,
      phone: draft.business.phone,
      email: draft.business.email,
      brandColor: draft.brand.primaryColor,
      logoDataUrl: draft.brand.logoDataUrl,
    });
    const hasMatchingLoyalty = programs.some((program) => program.businessId === selectedBusinessId && program.name === draft.loyalty.rewardName && program.type === "loyalty");
    if (draft.modules.loyalty && !hasMatchingLoyalty) {
      createProgram({ type: "loyalty", name: `${draft.brand.displayName || draft.business.name} Rewards`, description: draft.loyalty.rewardDescription, loyaltyMechanic: draft.loyalty.mechanic === "points" ? "purchases" : "visits", targetCount: draft.loyalty.stampCount, rewardName: draft.loyalty.rewardName, stampExpiryDays: 60, repeatable: draft.loyalty.repeatable });
    }
    const hasMembership = programs.some((program) => program.businessId === selectedBusinessId && program.name === `${draft.brand.displayName || draft.business.name} Membership` && program.type === "subscription");
    if ((draft.modules.subscriptions || draft.modules.packages) && !hasMembership) {
      createProgram({ type: "subscription", name: `${draft.brand.displayName || draft.business.name} Membership`, description: "Client cabinet package and membership module", priceCents: 3500, includedService: draft.services.items[0]?.name || "Service visit", includedUses: 4, rollover: true, maxRollover: 8, allBranches: true, cancellationRules: "Active paid period remains available after cancellation" });
    }
    const nextDraft = { ...draft, status: "published" as const, completed: true, currentStep: "launch" as const };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(nextDraft));
    update(nextDraft);
    setPublished(true);
    showToast(t.launch.success);
    trackOnboardingEvent("onboarding_completed");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Info label={t.launch.link} value={`memberflow.demo/${draft.business.name.toLowerCase().replace(/\s+/g, "-")}`} />
        <Info label={t.launch.qr} value={`/join/${launchProgram.id}`} />
        <Info label="Status" value={published ? "published" : "draft"} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-5">
          <h2 className="text-lg font-semibold">{t.steps.launch.title}</h2>
          <p className="mt-2 text-sm text-slate-500">{t.steps.launch.description}</p>
          <div className="mt-5 flex justify-center rounded-[28px] bg-white p-6">
            <QrCode label="QR для регистрации клиентов" value={joinUrl} size={180} />
          </div>
          <div className="mt-5 rounded-2xl bg-[var(--primary-soft)] p-4 text-sm text-slate-700">После подключения кабинет появится у клиента в разделе “Мои карты”. Если у клиента ещё нет MemberFlow Pass, ему будет предложено добавить единую карту в Apple Wallet или Google Wallet.</div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={publish} disabled={published}><Rocket className="h-4 w-4" />{published ? t.launch.success : t.buttons.publish}</Button>
            <LinkButton href="/customer/cards" variant="secondary"><Eye className="h-4 w-4" />{t.buttons.customer}</LinkButton>
            <LinkButton href="/dashboard" variant="secondary">{t.buttons.dashboard}</LinkButton>
          </div>
        </Card>
        <ClientCabinetPreview draft={draft} t={t} />
      </div>
      <Card className="p-5">
        <h2 className="text-lg font-semibold">{t.launch.next}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{t.launch.actions.map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold">{item}</div>)}</div>
      </Card>
      <PosterBuilder business={preparedBusiness} program={launchProgram} source="onboarding" />
    </div>
  );
}

type PanelProps = {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  t: (typeof content)["ru"];
};

function ClientCabinetPreview({ draft, t, compact = false, screen = "home" }: { draft: OnboardingDraft; t: (typeof content)["ru"]; compact?: boolean; screen?: PreviewScreen | string }) {
  const dark = draft.brand.theme === "dark";
  const buttonRadius = draft.brand.buttonShape === "round" ? "999px" : draft.brand.buttonShape === "sharp" ? "10px" : "18px";
  const activeScreen = normalizePreviewScreen(screen);
  const previewTabs: Array<{ key: PreviewScreen; label: string }> = [
    { key: "home", label: t.preview.screens[1] },
    { key: "rewards", label: t.preview.screens[2] },
    { key: "offers", label: t.preview.screens[3] },
  ];
  return (
    <Card className={cn("h-fit overflow-hidden p-4 shadow-[var(--shadow-md)] xl:sticky xl:top-24", compact && "hidden xl:block")}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">{t.preview.label}</p>
      <div className="mx-auto w-full max-w-[340px] rounded-[34px] border border-slate-200 bg-[#11121d] p-3 shadow-[0_24px_70px_rgba(18,19,32,0.24)]">
        <div className={cn("overflow-hidden rounded-[28px] p-4", dark ? "bg-[#121320] text-white" : "bg-white text-[#121320]")} style={{ minHeight: 640 }}>
          <div className="relative overflow-hidden rounded-[24px] p-4 text-white" style={{ background: `linear-gradient(135deg, ${draft.brand.primaryColor}, ${draft.brand.secondaryColor})` }}>
            {draft.brand.coverDataUrl ? <img src={draft.brand.coverDataUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /> : null}
            <div className="relative flex items-center gap-3">
              <LogoMark draft={draft} />
              <div>
                <p className="text-sm font-semibold">{draft.brand.displayName || draft.business.name}</p>
                <p className="text-xs opacity-80">{t.preview.powered}</p>
              </div>
            </div>
            <h3 className="relative mt-6 text-xl font-semibold leading-tight">{draft.brand.greeting}</h3>
            <p className="relative mt-2 text-sm opacity-85">{t.preview.testClient}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {previewTabs.map((item) => <span key={item.key} className={cn("rounded-full px-2 py-1 text-center font-semibold", activeScreen === item.key ? "bg-[var(--primary-soft)] text-[var(--primary)]" : dark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500")}>{item.label}</span>)}
          </div>
          <PreviewScreenContent draft={draft} t={t} dark={dark} screen={activeScreen} />
          {activeScreen !== "registration" ? <button className="mt-5 w-full rounded-[18px] px-4 py-3 text-sm font-semibold text-white" style={{ backgroundColor: draft.brand.buttonColor, borderRadius: buttonRadius }}>{mainActionLabel(draft.services.mainAction, t)}</button> : null}
          {draft.modules.wallet ? <button className={cn("mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold", dark ? "border-white/15 bg-white/10" : "border-slate-200 bg-white")}><WalletCards className="h-4 w-4" />MemberFlow Pass</button> : null}
        </div>
      </div>
    </Card>
  );
}

function RegistrationPreview({ draft, t }: { draft: OnboardingDraft; t: (typeof content)["ru"] }) {
  const fields = visibleRegistrationKeys(draft.business.category).map((key) => [key, draft.registration[key]] as [RegistrationFieldKey, FieldState]).filter(([, value]) => value.enabled);
  return (
    <Card className="h-fit p-5 xl:sticky xl:top-24">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">{t.preview.screens[0]}</p>
      <div className="mt-4 rounded-[28px] bg-white p-4 shadow-[var(--shadow-sm)]">
        <LogoMark draft={draft} />
        <h3 className="mt-4 text-xl font-semibold">{draft.brand.displayName || draft.business.name}</h3>
        <div className="mt-4 space-y-2">
          {fields.slice(0, 7).map(([key, field]) => key === "marketingConsent" ? (
            <label key={key} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
              <input type="checkbox" className="mt-0.5" disabled />
              <span>{t.registrationFields[key]}</span>
            </label>
          ) : (
            <div key={key} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">{t.registrationFields[key]}{field.required ? " *" : ""}</div>
          ))}
        </div>
        <Button className="mt-4 w-full">{t.buttons.next}</Button>
      </div>
    </Card>
  );
}

function PreviewScreenContent({ draft, t, dark, screen }: { draft: OnboardingDraft; t: (typeof content)["ru"]; dark: boolean; screen: PreviewScreen }) {
  if (screen === "registration") return (
    <div className="mt-4">
      <RegistrationFormBody draft={draft} t={t} />
    </div>
  );

  if (screen === "rewards") return (
    <div className={cn("mt-4 rounded-[22px] p-4", dark ? "bg-white/10" : "bg-slate-50")}>
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-sm font-semibold">{t.modules.loyalty}</p><p className="mt-1 text-xs text-slate-500">{draft.loyalty.rewardName}</p></div>
        <Gift className="h-5 w-5" style={{ color: draft.brand.primaryColor }} />
      </div>
      <div className="mt-4 flex gap-2">
        {Array.from({ length: Math.min(8, draft.loyalty.stampCount) }, (_, index) => <span key={index} className={cn("h-8 w-8 rounded-full", index < 4 ? "bg-[var(--primary)]" : "border border-slate-300 bg-white")} />)}
      </div>
      <p className="mt-3 text-sm font-semibold">{t.preview.progress}</p>
      <p className="mt-1 text-xs text-slate-500">{t.preview.reward}</p>
    </div>
  );

  if (screen === "offers") return (
    <div className="mt-4 space-y-3">
      <div className={cn("rounded-[22px] p-4", dark ? "bg-white/10" : "bg-[#F8F5EF]")}>
        <p className="text-sm font-semibold">{t.preview.offer}</p>
        <p className="mt-1 text-lg font-semibold">{draft.automation.offerText || t.preview.offerText}</p>
        <p className="mt-2 text-xs text-slate-500">{draft.automation.offerExpiry}</p>
      </div>
      <div className={cn("rounded-[22px] p-4", dark ? "bg-white/10" : "bg-slate-50")}>
        <p className="text-sm font-semibold">Return bonus</p>
        <p className="mt-1 text-xs text-slate-500">Personal offer created when the customer is inactive.</p>
      </div>
    </div>
  );

  if (screen === "services") return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-semibold">{t.preview.services}</p>
      {draft.services.items.slice(0, 3).map((service) => <div key={service.id} className={cn("flex items-center justify-between gap-3 rounded-2xl p-3 text-sm", dark ? "bg-white/10" : "bg-slate-50")}><span><b>{service.name || "Service"}</b><span className="block text-xs text-slate-500">{service.duration} · {service.description}</span></span><span className="font-semibold whitespace-nowrap">€{service.price || "0"}</span></div>)}
    </div>
  );

  if (screen === "profile") return (
    <div className="mt-4 space-y-3">
      <div className={cn("rounded-[22px] p-4", dark ? "bg-white/10" : "bg-slate-50")}>
        <p className="text-sm font-semibold">{t.preview.testClient}</p>
        <p className="mt-1 text-xs text-slate-500">MF-000184 · {draft.business.phone}</p>
      </div>
      {draft.modules.wallet ? <div className={cn("rounded-[22px] p-4", dark ? "bg-white/10" : "bg-white border border-slate-200")}>
        <p className="text-sm font-semibold">MemberFlow Pass</p>
        <p className="mt-1 text-xs text-slate-500">One QR for all connected programs.</p>
      </div> : null}
      {draft.modules.contacts ? <div className={cn("rounded-[22px] p-4", dark ? "bg-white/10" : "bg-slate-50")}>
        <p className="text-sm font-semibold">{draft.business.address}</p>
        <p className="mt-1 text-xs text-slate-500">{draft.business.city} · {draft.business.website}</p>
      </div> : null}
    </div>
  );

  return (
    <>
      {draft.modules.loyalty ? <div className={cn("mt-4 rounded-[22px] p-4", dark ? "bg-white/10" : "bg-slate-50")}>
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-sm font-semibold">{t.modules.loyalty}</p><p className="mt-1 text-xs text-slate-500">{t.preview.reward}</p></div>
          <Gift className="h-5 w-5" style={{ color: draft.brand.primaryColor }} />
        </div>
        <div className="mt-4 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full" style={{ width: "66%", backgroundColor: draft.brand.primaryColor }} /></div>
        <p className="mt-2 text-sm font-semibold">{t.preview.progress}</p>
      </div> : null}
      {draft.modules.offers ? <div className={cn("mt-3 rounded-[22px] p-4", dark ? "bg-white/10" : "bg-[#F8F5EF]")}>
        <p className="text-sm font-semibold">{t.preview.offer}</p>
        <p className="mt-1 text-lg font-semibold">{draft.automation.offerText || t.preview.offerText}</p>
      </div> : null}
      {draft.modules.services ? <div className="mt-4 space-y-2">
        <p className="text-sm font-semibold">{t.preview.services}</p>
        {draft.services.items.slice(0, 2).map((service) => <div key={service.id} className={cn("flex items-center justify-between gap-3 rounded-2xl p-3 text-sm", dark ? "bg-white/10" : "bg-slate-50")}><span><b>{service.name || "Service"}</b><span className="block text-xs text-slate-500">{service.duration}</span></span><span className="font-semibold">€{service.price || "0"}</span></div>)}
      </div> : null}
    </>
  );
}

function RegistrationFormBody({ draft, t }: { draft: OnboardingDraft; t: (typeof content)["ru"] }) {
  const fields = visibleRegistrationKeys(draft.business.category).map((key) => [key, draft.registration[key]] as [RegistrationFieldKey, FieldState]).filter(([, value]) => value.enabled);
  return (
    <div className="rounded-[22px] bg-white p-3 text-[#121320] shadow-[var(--shadow-sm)]">
      <p className="text-sm font-semibold">{draft.brand.displayName || draft.business.name}</p>
      <p className="mt-1 text-xs text-slate-500">Join the customer portal</p>
      <div className="mt-3 space-y-2">
        {fields.slice(0, 7).map(([key, field]) => key === "marketingConsent" ? (
          <label key={key} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
            <input type="checkbox" className="mt-0.5" disabled />
            <span>{t.registrationFields[key]}</span>
          </label>
        ) : (
          <div key={key} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">{t.registrationFields[key]}{field.required ? " *" : ""}</div>
        ))}
      </div>
    </div>
  );
}

function normalizePreviewScreen(screen: PreviewScreen | string): PreviewScreen {
  if (screen === "registration" || screen === "home" || screen === "rewards" || screen === "offers" || screen === "services" || screen === "profile") return screen;
  return "home";
}

function LogoMark({ draft }: { draft: OnboardingDraft }) {
  if (draft.brand.logoDataUrl) return <img src={draft.brand.logoDataUrl} alt="" className="h-11 w-11 rounded-2xl object-cover ring-1 ring-white/40" />;
  return <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/18 text-lg font-bold text-white ring-1 ring-white/25">{(draft.brand.displayName || draft.business.name || "M").slice(0, 1)}</span>;
}

function SkipPanel({ t, title }: { t: (typeof content)["ru"]; title: string }) {
  return <Card className="p-8 text-center"><Gift className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-slate-500">{t.buttons.skip}</p></Card>;
}

function TextField({ label, value, onChange, type = "text", maxLength }: { label: string; value: string; onChange: (value: string) => void; type?: string; maxLength?: number }) {
  return <label className="text-sm font-medium">{label}<input className={cn(inputClass, "mt-1")} type={type} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, onChange, options, values }: { label: string; value: string; onChange: (value: string) => void; options: string[]; values?: string[] }) {
  return <label className="text-sm font-medium">{label}<select className={cn(inputClass, "mt-1")} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option, index) => <option key={option} value={values?.[index] ?? option}>{option}</option>)}</select></label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-sm font-medium">{label}<span className="mt-1 flex gap-2"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-16 rounded-xl border border-slate-200 bg-white" /><input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} /></span></label>;
}

function UploadField({ label, onLoad }: { label: string; onLoad: (dataUrl: string) => void }) {
  return <label className="text-sm font-medium">{label}<span className="mt-1 grid h-28 cursor-pointer place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"><Upload className="h-5 w-5 text-slate-400" />Local preview<input type="file" accept="image/*" className="sr-only" onChange={(event) => readFile(event.currentTarget.files?.[0], onLoad)} /></span></label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[var(--border)] bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-words font-semibold">{value}</p></div>;
}

function readFile(file: File | undefined, onLoad: (dataUrl: string) => void) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onLoad(String(reader.result));
  reader.readAsDataURL(file);
}

function saveAndLater(draft: OnboardingDraft) {
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function trackOnboardingEvent(eventName: string) {
  if (process.env.NODE_ENV !== "production") console.debug("memberflow:event", eventName);
}

function stepEvent(step: StepKey) {
  const map: Record<StepKey, string> = {
    business: "business_info_completed",
    branding: "branding_completed",
    modules: "modules_selected",
    loyalty: "loyalty_configured",
    registration: "registration_form_configured",
    services: "services_configured",
    automation: "automation_configured",
    preview: "preview_opened",
    launch: "onboarding_completed",
  };
  return map[step];
}

function applyCategoryPreset(category: string, draft: OnboardingDraft, update: (patch: Partial<OnboardingDraft>) => void, language: LanguageCode) {
  const next = { ...draft.business, category };
  const lower = category.toLowerCase();
  const registration = { ...draft.registration };
  if (lower.includes("авто") || lower.includes("car") || lower.includes("auto")) {
    registration.carNumber = { enabled: true, required: true };
    registration.carBrand = { enabled: true, required: false };
    registration.carModel = { enabled: true, required: false };
  }
  if (lower.includes("грум") || lower.includes("groom")) {
    registration.petName = { enabled: true, required: true };
    registration.petType = { enabled: true, required: false };
    registration.petBreed = { enabled: true, required: false };
  }
  update({ business: next, registration, brand: { ...draft.brand, greeting: language === "ru" ? "Ваш персональный кабинет уже готов" : draft.brand.greeting } });
}

function moduleDescription(key: ModuleKey, category: string) {
  const common: Record<ModuleKey, string> = {
    loyalty: "Progress, rewards and repeat visits inside one customer portal.",
    offers: "Personal offers for customers who should come back.",
    services: "A compact catalogue with prices and main actions.",
    booking: "Use an external booking link now; native scheduling can be added later.",
    packages: "Visit bundles and remaining services.",
    subscriptions: "Recurring memberships for regular customers.",
    history: "A clear timeline of visits and rewards.",
    wallet: "One MemberFlow Pass opens the customer's cards.",
    contacts: "Address, phone, opening hours and route.",
    petProfile: `Specific profile data for ${category}.`,
  };
  return common[key];
}

function sensitiveHelp(key: RegistrationFieldKey, t: (typeof content)["ru"]) {
  if (key === "birthday" || key === "petBirthday") return t.registrationHelp.birthday;
  if (key === "marketingConsent") return t.registrationHelp.marketingConsent;
  if (key === "email" || key === "phone") return t.registrationHelp.identity;
  if (["carNumber", "carBrand", "carModel", "petName", "petType", "petBreed", "fitnessGoal", "preferredBranch"].includes(key)) return t.registrationHelp.category;
  return t.registrationHelp.default;
}

function visibleRegistrationKeys(category: string): RegistrationFieldKey[] {
  const lower = category.toLowerCase();
  const base: RegistrationFieldKey[] = ["firstName", "lastName", "email", "phone", "birthday", "marketingConsent"];
  if (lower.includes("авто") || lower.includes("car") || lower.includes("auto")) return [...base, "carNumber", "carBrand", "carModel"];
  if (lower.includes("грум") || lower.includes("groom")) return [...base, "petName", "petType", "petBreed", "petBirthday"];
  if (lower.includes("fitness") || lower.includes("фитнес")) return [...base, "fitnessGoal", "preferredBranch"];
  if (lower.includes("clinic") || lower.includes("клиник")) return [...base, "preferredBranch"];
  return base;
}

function categoryFieldsNote(category: string, t: (typeof content)["ru"]) {
  const lower = category.toLowerCase();
  if (lower.includes("авто") || lower.includes("car") || lower.includes("auto")) return t.registrationNotes.car;
  if (lower.includes("грум") || lower.includes("groom")) return t.registrationNotes.grooming;
  if (lower.includes("fitness") || lower.includes("фитнес")) return t.registrationNotes.fitness;
  if (lower.includes("clinic") || lower.includes("клиник")) return t.registrationNotes.clinic;
  return t.registrationNotes.default;
}

function mainActionLabel(action: OnboardingDraft["services"]["mainAction"], t: (typeof content)["ru"]) {
  const labels = {
    book: t.preview.book,
    services: t.preview.services,
    call: "Call",
    route: "Route",
    package: "Buy package",
    subscription: "Membership",
  };
  return labels[action];
}

function mergeBusiness(business: Business, draft: OnboardingDraft): Business {
  return { ...business, name: draft.business.name, category: draft.business.category, city: draft.business.city, address: draft.business.address, phone: draft.business.phone, email: draft.business.email, brandColor: draft.brand.primaryColor, logoDataUrl: draft.brand.logoDataUrl };
}

function makePreviewProgram(businessId: string, draft: OnboardingDraft): Program {
  return {
    id: "cabinet-preview",
    businessId,
    type: draft.modules.loyalty ? "loyalty" : "subscription",
    name: draft.modules.loyalty ? `${draft.brand.displayName || draft.business.name} Rewards` : `${draft.brand.displayName || draft.business.name} Membership`,
    description: draft.loyalty.rewardDescription,
    status: "active",
    targetCount: draft.loyalty.stampCount,
    rewardName: draft.loyalty.rewardName,
    stampExpiryDays: 60,
    repeatable: draft.loyalty.repeatable,
    priceCents: 3500,
    includedService: draft.services.items[0]?.name || "Service visit",
    includedUses: 4,
    customers: 0,
    mrrCents: 0,
    stampsIssued: 0,
    rewardsAvailable: 0,
    rewardsRedeemed: 0,
  };
}

function findLaunchProgram(programs: Program[], businessId: string, draft: OnboardingDraft) {
  return programs.find((program) => program.businessId === businessId && program.name === `${draft.brand.displayName || draft.business.name} Rewards`) ?? programs.find((program) => program.businessId === businessId);
}
