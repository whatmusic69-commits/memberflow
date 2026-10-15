export type MarketingPage =
  | "terms"
  | "privacy"
  | "product"
  | "pricing"
  | "about"
  | "solutions"
  | "integrations"
  | "contact"
  | "faq"
  | "help"
  | `help/${string}`;
export const helpNavigationLabel = {
  en: "Help",
  lv: "Palīdzība",
  ru: "Помощь",
};
