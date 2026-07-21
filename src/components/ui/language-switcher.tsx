"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "lv", label: "LV" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
] as const;

type LanguageCode = (typeof languages)[number]["code"];

export function LanguageSwitcher({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [language, setLanguage] = useState<LanguageCode>("ru");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const saved = window.localStorage.getItem("memberflow-language") as LanguageCode | null;
      if (saved && languages.some((item) => item.code === saved)) {
        setLanguage(saved);
        document.documentElement.lang = saved;
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("memberflow-language", language);
    document.documentElement.lang = language;
  }, [hydrated, language]);

  function selectLanguage(nextLanguage: LanguageCode) {
    setLanguage(nextLanguage);
  }

  return (
    <div className={cn("inline-flex items-center rounded-xl border border-[var(--border)] bg-white/90 p-1 shadow-[var(--shadow-sm)]", className)} aria-label="Language switcher">
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => selectLanguage(item.code)}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
            compact && "px-2",
            language === item.code ? "bg-[var(--primary)] text-white shadow-[0_8px_18px_rgba(109,93,251,0.24)]" : "text-slate-500 hover:bg-slate-50 hover:text-[var(--foreground)]",
          )}
          aria-pressed={language === item.code}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
