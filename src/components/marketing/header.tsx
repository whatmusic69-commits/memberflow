"use client";
import Link from "next/link";
import { HomeLink } from "@/components/ui/home-link";
import { useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { StartLink } from "./start-link";
import { Wordmark } from "@/components/ui/brand";
import { PreviewAction } from "./actions";
import type { HomeContent } from "@/content/types";
import { locales, type Locale } from "@/content";
export function Header({
  c,
  locale,
  page,
}: {
  c: HomeContent;
  locale: Locale;
  page?: "terms" | "privacy";
}) {
  const [open, setOpen] = useState(false);
  const language = useRef<HTMLDetailsElement>(null);
  const action = (
    key: "login" | "pricing" | "resources" | "start",
    label: string,
    primary = false,
  ) =>
    key === "login" ? (
      <Link href={`/login?lang=${locale}`}>{label}</Link>
    ) : (
      <PreviewAction
        label={label}
        title={c.dialogs[key][0]}
        description={c.dialogs[key][1]}
        close={c.close}
        primary={primary}
      />
    );
  const navigation = (
    <>
      <a
        href={page ? `/${locale}#product` : "#product"}
        onClick={() => setOpen(false)}
      >
        {c.nav[0]}
      </a>
      <a
        href={page ? `/${locale}#solutions` : "#solutions"}
        onClick={() => setOpen(false)}
      >
        {c.nav[1]}
      </a>
      {action("pricing", c.nav[2])}
      <a
        href={page ? `/${locale}#integrations` : "#integrations"}
        onClick={() => setOpen(false)}
      >
        {c.nav[3]}
      </a>
      {action("resources", c.nav[4])}
    </>
  );
  return (
    <header className="site-header">
      <div className="container header-inner">
        <HomeLink locale={locale} aria-label="MemberFlow">
          <Wordmark />
        </HomeLink>
        <nav className="desktop-nav" aria-label={c.menu}>
          {navigation}
        </nav>
        <div className="header-actions">
          <details
            ref={language}
            className="language-switcher"
            onKeyDown={(e) => {
              if (e.key === "Escape" && language.current)
                language.current.open = false;
            }}
          >
            <summary aria-label={c.language}>
              {locale.toUpperCase()}
              <ChevronDown size={12} />
            </summary>
            <div className="language-options">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={`/${l}${page ? "/" + page : ""}`}
                  scroll={false}
                  onNavigate={() => {
                    // Language changes should preserve the reading position.
                    // Return focus before hiding the currently focused option.
                    language.current
                      ?.querySelector("summary")
                      ?.focus({ preventScroll: true });
                    if (language.current) language.current.open = false;
                    setOpen(false);
                  }}
                  lang={l}
                  aria-current={locale === l ? "page" : undefined}
                >
                  {l.toUpperCase()}
                  <span>
                    {l === "en"
                      ? "English"
                      : l === "lv"
                        ? "Latviešu"
                        : "Русский"}
                  </span>
                </Link>
              ))}
            </div>
          </details>
          {!page && <Link className="header-dashboard desktop-login" href={`/dashboard?lang=${locale}`}>
            {c.dashboard}
          </Link>}
          <div className="desktop-login">{action("login", c.login)}</div>
          <div className="header-cta">{action("start", c.start, true)}</div>
          <button
            className="icon-button mobile-toggle"
            aria-label={open ? c.close : c.menu}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-nav container"
          aria-label={c.menu}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {navigation}
          {!page && <Link href={`/dashboard?lang=${locale}`} onClick={() => setOpen(false)}>{c.dashboard}</Link>}
          {action("login", c.login)}
          <StartLink label={c.start} />
        </nav>
      )}
    </header>
  );
}
