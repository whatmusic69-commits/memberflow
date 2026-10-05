import { en } from "./en";
import { lv } from "./lv";
import { ru } from "./ru";
export const locales = ["en", "lv", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const content = { en, lv, ru };
export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}
