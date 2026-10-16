import { notFound } from "next/navigation";
import { isLocale, locales } from "@/content";
import { landingContent, landingPaths } from "@/content/landing-pages";
import { isLandingPath } from "@/content/landing-pages/types";
import { publicMetadata } from "@/features/public-site/shell";
import { LandingPage } from "@/features/landing-pages/landing-page";
type Params = Promise<{ locale: string; feature: string }>;
export function generateStaticParams() {
 return locales.flatMap(locale => landingPaths.filter(path => path.startsWith("features/")).map(path => ({locale,feature:path.split("/")[1]})));
}
async function resolve(params: Params) {
 const {locale,feature}=await params;
 const path=`features/${feature}`;
 if(!isLocale(locale)||!isLandingPath(path))notFound();
 return {locale,path};
}
export async function generateMetadata({params}:{params:Params}) {
 const {locale,path}=await resolve(params),c=landingContent[locale][path];
 return publicMetadata(locale,path,c.seoTitle,c.description);
}
export default async function Page({params}:{params:Params}) {
 const {locale,path}=await resolve(params);
 return <LandingPage locale={locale} path={path}/>;
}
