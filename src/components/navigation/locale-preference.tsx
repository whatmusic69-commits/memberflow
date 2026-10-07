"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isLocale } from "@/content";

/** Keep public pages and workspace language preferences in sync. */
export function LocalePreference() {
  const pathname = usePathname();
  useEffect(() => {
    const locale = pathname.split("/")[1];
    if (!isLocale(locale)) return;
    document.documentElement.lang = locale;
    document.cookie = `memberflow_locale=${locale}; Path=/; SameSite=Lax; Max-Age=31536000`;
  }, [pathname]);
  return null;
}
