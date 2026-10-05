import Link from "next/link";
import { HomeLink } from "@/components/ui/home-link";
import type { HomeContent } from "@/content/types";
import { locales, type Locale } from "@/content";
import { Wordmark } from "@/components/ui/brand";
import { PreviewAction } from "./actions";
export function Footer({
  c,
  locale,
  page,
}: {
  c: HomeContent;
  locale: Locale;
  page?: "terms" | "privacy";
}) {
  const action = (
    key: "pricing" | "resources" | "about" | "privacy" | "terms",
    label: string,
  ) => (
    <PreviewAction
      label={label}
      title={c.dialogs[key][0]}
      description={c.dialogs[key][1]}
      close={c.close}
    />
  );
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
            <a href={page ? `/${locale}#solutions` : "#solutions"}>
              {c.nav[1]}
            </a>
            {action("pricing", c.nav[2])}
            <a href={page ? `/${locale}#integrations` : "#integrations"}>
              {c.nav[3]}
            </a>
            {action("resources", c.nav[4])}
          </nav>
          <nav aria-label={c.company}>
            <strong>{c.company}</strong>
            {action("about", c.about)}
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
