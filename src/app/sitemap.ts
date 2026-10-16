import type { MetadataRoute } from "next";
import { locales } from "@/content";
import { helpArticles } from "@/content/public-site";
import { landingPaths } from "@/content/landing-pages";
import { publicSiteOrigin } from "@/config/public-site";

/** Only public marketing routes: no drafts, customers, auth, workspace or pending legal text. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "product", "solutions", "pricing", "integrations", "help", "faq", "about", "contact", ...landingPaths];
  const url = (locale: string, path: string) => `${publicSiteOrigin}/${locale}${path ? `/${path}` : ""}`;
  return locales.flatMap(locale => [
    ...pages.map(path => ({ url: url(locale,path), alternates: { languages: Object.fromEntries([...locales.map(language => [language,url(language,path)]),["x-default",url("en",path)]]) } })),
    ...helpArticles[locale].map(article => ({ url:url(locale,`help/${article.slug}`),alternates:{languages:Object.fromEntries([
      ...locales.filter(language => helpArticles[language].some(other=>other.slug===article.slug)).map(language=>[language,url(language,`help/${article.slug}`)]),
      ...(helpArticles.en.some(other=>other.slug===article.slug)?[["x-default",url("en",`help/${article.slug}`)]]:[]),
    ])} })),
  ]);
}
