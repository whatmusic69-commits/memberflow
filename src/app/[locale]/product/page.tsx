import { notFound } from "next/navigation";
import { isLocale, locales } from "@/content";
import { productContent } from "@/content/product";
import { publicMetadata } from "@/features/public-site/shell";
import { ProductPage } from "@/features/product/product-page";
export function generateStaticParams(){return locales.map(locale=>({locale}));}
export async function generateMetadata({params}: {params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))notFound();const c=productContent[locale];return publicMetadata(locale,"product",c.seoTitle,c.description);
}
export default async function Page({params}: {params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))notFound();return <ProductPage locale={locale}/>;
}
