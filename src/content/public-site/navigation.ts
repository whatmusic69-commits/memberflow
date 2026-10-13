export type MarketingPage =
  | "terms"
  | "privacy"
  | "pricing"
  | "about"
  | "solutions"
  | "integrations"
  | "help"
  | `help/${string}`;
export const helpNavigationLabel = {
  en: "Help",
  lv: "Palīdzība",
  ru: "Помощь",
};
