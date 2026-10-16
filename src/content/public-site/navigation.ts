export type MarketingPage =
  | "solutions/coffee-shops"
  | "solutions/beauty-salons"
  | "features/digital-loyalty-cards"
  | "features/qr-code-loyalty"
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
