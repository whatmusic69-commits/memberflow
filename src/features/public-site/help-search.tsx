"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import type { Locale } from "@/content";
import type { HelpArticle, PublicSiteContent } from "@/content/public-site";
export function HelpSearch({
  articles,
  c,
  locale,
}: {
  articles: HelpArticle[];
  c: PublicSiteContent;
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const normalized = query.trim().toLocaleLowerCase(locale);
  const filtered = articles.filter(
    (a) =>
      (!category || a.slug === category) &&
      [
        a.title,
        a.summary,
        a.category,
        ...a.sections.flatMap((s) => [s.title, ...s.paragraphs]),
      ]
        .join(" ")
        .toLocaleLowerCase(locale)
        .includes(normalized),
  );
  return (
    <section className="help-browser" aria-label={c.helpHome}>
      <div className="help-controls">
        <label className="help-search">
          <Search size={21} aria-hidden="true" />
          <span className="sr-only">{c.search}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.search}
          />
        </label>
        <label className="help-category">
          <span className="sr-only">{c.all}</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">{c.all}</option>
            {articles.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.category}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="help-count" role="status">
        {filtered.length} {c.results}
      </p>
      <div className="help-grid">
        {filtered.map((a, i) => (
          <Link
            className="help-guide"
            key={a.slug}
            href={`/${locale}/help/${a.slug}`}
          >
            <span className="eyebrow">{a.category}</span>
            <h2>{a.title}</h2>
            <p>{a.summary}</p>
            <span className="guide-arrow">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <ArrowUpRight size={20} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
      {!filtered.length && <p className="help-empty">{c.noResults}</p>}
    </section>
  );
}
