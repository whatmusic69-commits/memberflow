import type { Locale } from "@/content";
import type { Money } from "./types";
export function money(value: Money | null, locale: Locale) {
  return value
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: value.currency,
      }).format(value.minor / 10 ** (value.fractionDigits ?? 2))
    : "—";
}
export function date(
  value: string | null,
  locale: Locale,
  fallback: string,
  time = false,
) {
  if (!value || Number.isNaN(Date.parse(value))) return fallback;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}
