import type { Locale } from "@/content";
export const legalContent: Record<
  Locale,
  {
    accept: string;
    termsLink: string;
    privacyLink: string;
    terms: string;
    privacy: string;
    newTab: string;
  }
> = {
  en: {
    accept: "I accept the",
    termsLink: "Terms",
    privacyLink: "Privacy policy",
    terms: "Terms of use",
    privacy: "Privacy policy",
    newTab: "opens in a new tab",
  },
  lv: {
    accept: "Piekrītu",
    termsLink: "noteikumiem",
    privacyLink: "privātuma politikai",
    terms: "Lietošanas noteikumi",
    privacy: "Privātuma politika",
    newTab: "atveras jaunā cilnē",
  },
  ru: {
    accept: "Я принимаю",
    termsLink: "условия",
    privacyLink: "политику конфиденциальности",
    terms: "Условия использования",
    privacy: "Политика конфиденциальности",
    newTab: "откроется в новой вкладке",
  },
};
