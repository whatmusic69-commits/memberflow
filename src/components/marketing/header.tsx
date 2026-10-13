"use client";
import Link from "next/link";
import { HomeLink } from "@/components/ui/home-link";
import { useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { StartLink } from "./start-link";
import { Wordmark } from "@/components/ui/brand";
import {
  helpNavigationLabel,
  type MarketingPage,
} from "@/content/public-site/navigation";
import type { HomeContent } from "@/content/types";
import { locales, type Locale } from "@/content";
export function Header({
  c,
  locale,
  page,
}: {
  c: HomeContent;
  locale: Locale;
  page?: MarketingPage;
}) {
  const [open, setOpen] = useState(false);
  const language = useRef<HTMLDetailsElement>(null);
  const loginAvailable =
    process.env.NEXT_PUBLIC_AUTH_MODE === "symfony" &&
    Boolean(process.env.NEXT_PUBLIC_API_URL);
  const navigation = (
    <>
      <a
        href={page ? `/${locale}#product` : "#product"}
        onClick={() => setOpen(false)}
      >
        {c.nav[0]}
      </a>
      <Link
        href={`/${locale}/solutions`}
        aria-current={page === "solutions" ? "page" : undefined}
        onClick={() => setOpen(false)}
      >
        {c.nav[1]}
      </Link>
      <Link href={`/${locale}/pricing`} onClick={() => setOpen(false)}>
        {c.nav[2]}
      </Link>
      <Link
        href={`/${locale}/integrations`}
        aria-current={page === "integrations" ? "page" : undefined}
        onClick={() => setOpen(false)}
      >
        {c.nav[3]}
      </Link>
      <Link
        href={`/${locale}/help`}
        aria-current={
          page === "help" || page?.startsWith("help/") ? "page" : undefined
        }
        onClick={() => setOpen(false)}
      >
        {helpNavigationLabel[locale]}
      </Link>
      <Link
        href={`/${locale}/about`}
        aria-current={page === "about" ? "page" : undefined}
        onClick={() => setOpen(false)}
      >
        {c.about}
      </Link>
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
                  data-preserve-scroll
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
          {!page && (
            <Link
              className="header-dashboard desktop-login"
              href={`/dashboard?lang=${locale}`}
            >
              {c.dashboard}
            </Link>
          )}
          {loginAvailable && (
            <div className="desktop-login">
              <Link href={`/login?lang=${locale}`}>{c.login}</Link>
            </div>
          )}
          <div className="header-cta">
            <StartLink label={c.start} />
          </div>
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
          {!page && (
            <Link
              href={`/dashboard?lang=${locale}`}
              onClick={() => setOpen(false)}
            >
              {c.dashboard}
            </Link>
          )}
          {loginAvailable && (
            <Link href={`/login?lang=${locale}`}>{c.login}</Link>
          )}
          <StartLink label={c.start} />
        </nav>
      )}
    </header>
  );
}
