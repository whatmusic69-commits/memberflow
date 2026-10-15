import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/content";
import { helpArticles, publicSiteContent } from "@/content/public-site";
import { PublicShell, publicMetadata } from "@/features/public-site/shell";
import { ArticleContents } from "@/features/public-site/article-contents";
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    helpArticles[locale].map((a) => ({ locale, slug: a.slug })),
  );
}
async function getArticle(params: Promise<{ locale: string; slug: string }>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = helpArticles[locale].find((a) => a.slug === slug);
  if (!article) notFound();
  return { locale, article };
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, article } = await getArticle(params);
  return publicMetadata(
    locale,
    `help/${article.slug}`,
    article.title,
    article.summary,
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, article } = await getArticle(params);
  const c = publicSiteContent[locale];
  return (
    <PublicShell locale={locale} page={`help/${article.slug}`}>
      <nav className="help-breadcrumbs" aria-label={c.helpHome}>
        <Link href={`/${locale}/help`}>{c.helpHome}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{article.category}</span>
      </nav>
      <header className="public-heading article-heading">
        <p className="eyebrow">{article.category}</p>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
      </header>
      <div className="help-article-layout">
        <ArticleContents key={article.slug} label={c.contents} sections={article.sections.map(s => ({ title: s.title }))} helpHref={`/${locale}/help`} helpLabel={c.helpHome} />
        <article className="help-article">
          {article.sections.map((s, i) => (
            <section id={`section-${i}`} key={s.title}>
              <h2>{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
          <aside className="public-note">{c.previewNote}</aside>
        </article>
      </div>
      <section className="related-guides">
        <h2>{c.related}</h2>
        <div>
          {article.related.map((slug) => {
            const a = helpArticles[locale].find((a) => a.slug === slug);
            return a ? (
              <Link key={slug} href={`/${locale}/help/${slug}`}>
                <span>{a.category}</span>
                <strong>{a.title} ↗</strong>
              </Link>
            ) : null;
          })}
        </div>
      </section>
    </PublicShell>
  );
}
