"use client";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { content, locales, type Locale } from "@/content";

export function OnboardingLanguageSwitcher({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  return (
    <details
      ref={menu}
      className="language-switcher"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menu.current) {
          menu.current.open = false;
          menu.current.querySelector("summary")?.focus({ preventScroll: true });
        }
      }}
    >
      <summary aria-label={content[locale].language}>
        {locale.toUpperCase()}
        <ChevronDown size={12} />
      </summary>
      <div className="language-options">
        {locales.map((value) => (
          <button
            type="button"
            key={value}
            lang={value}
            aria-pressed={value === locale}
            onClick={() => {
              onChange(value);
              menu.current
                ?.querySelector("summary")
                ?.focus({ preventScroll: true });
              if (menu.current) menu.current.open = false;
            }}
          >
            {value.toUpperCase()}
            <span>
              {value === "en"
                ? "English"
                : value === "lv"
                  ? "Latviešu"
                  : "Русский"}
            </span>
          </button>
        ))}
      </div>
    </details>
  );
}
