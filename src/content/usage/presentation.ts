import type { Locale } from "@/content";
export const planPresentation: Record<
  Locale,
  {
    title: string;
    intro: string;
    selected: string;
    selectHint: string;
    included: string;
  }
> = {
  ru: {
    title: "Тариф для вашего бизнеса",
    intro:
      "Сравните возможности и лимиты. Выберите план, который подходит вашему бизнесу сейчас.",
    selected: "Выбранный тариф",
    selectHint: "Выберите тариф выше, чтобы продолжить.",
    included: "Возможности тарифа",
  },
  en: {
    title: "A plan for your business",
    intro:
      "Compare features and limits. Choose the plan that fits your business today.",
    selected: "Selected plan",
    selectHint: "Choose a plan above to continue.",
    included: "Plan features",
  },
  lv: {
    title: "Plāns jūsu uzņēmumam",
    intro:
      "Salīdziniet iespējas un limitus. Izvēlieties plānu, kas šobrīd atbilst jūsu uzņēmumam.",
    selected: "Izvēlētais plāns",
    selectHint: "Izvēlieties plānu augstāk, lai turpinātu.",
    included: "Plāna iespējas",
  },
};
