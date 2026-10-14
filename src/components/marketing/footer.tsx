import Link from "next/link";
import { contactContent } from "@/content/contact";
import { faqContent } from "@/content/faq";
import { HomeLink } from "@/components/ui/home-link";
import {
  helpNavigationLabel,
  type MarketingPage,
} from "@/content/public-site/navigation";
import type { HomeContent } from "@/content/types";
import { locales, type Locale } from "@/content";
import { Wordmark } from "@/components/ui/brand";
export function Footer({
  c,
  locale,
  page,
}: {
  c: HomeContent;
  locale: Locale;
  page?: MarketingPage;
}) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <HomeLink locale={locale}>
              <Wordmark />
            </HomeLink>
            <p>{c.footerLine}</p>
          </div>
          <nav aria-label={c.nav[0]}>
            <strong>{c.nav[0]}</strong>
            <a href={page ? `/${locale}#product` : "#product"}>{c.nav[0]}</a>
            <Link
              href={`/${locale}/solutions`}
              aria-current={page === "solutions" ? "page" : undefined}
            >
              {c.nav[1]}
            </Link>
            <Link href={`/${locale}/pricing`}>{c.nav[2]}</Link>
            <Link
              href={`/${locale}/integrations`}
              aria-current={page === "integrations" ? "page" : undefined}
            >
              {c.nav[3]}
            </Link>
            <Link
              href={`/${locale}/help`}
              aria-current={
                page === "help" || page?.startsWith("help/")
                  ? "page"
                  : undefined
              }
            >
              {helpNavigationLabel[locale]}
            </Link>
            <Link href={`/${locale}/faq`} aria-current={page === "faq" ? "page" : undefined}>{faqContent[locale].nav}</Link>
          </nav>
          <nav aria-label={c.company}>
            <strong>{c.company}</strong>
            <Link
              href={`/${locale}/about`}
              aria-current={page === "about" ? "page" : undefined}
            >
              {c.about}
            </Link>
            <Link href={`/${locale}/contact`} aria-current={page === "contact" ? "page" : undefined}>{contactContent[locale].nav}</Link>
          </nav>
          <nav aria-label={c.legal}>
            <strong>{c.legal}</strong>
            <Link href={`/${locale}/privacy`}>{c.privacy}</Link>
            <Link href={`/${locale}/terms`}>{c.terms}</Link>
          </nav>
          <nav aria-label={c.language}>
            <strong>{c.language}</strong>
            {locales.map((l) => (
              <Link
                href={`/${l}${page ? "/" + page : ""}`}
                scroll={false}
                data-preserve-scroll
                lang={l}
                aria-current={l === locale ? "page" : undefined}
                key={l}
              >
                {l === "en" ? "English" : l === "lv" ? "Latviešu" : "Русский"}
              </Link>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MemberFlow</span>
          <p>{c.previewNote}</p>
        </div>
      </div>
    </footer>
  );
}
