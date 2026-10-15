import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/content";
import type { HomeContent } from "@/content/types";
import { productContent } from "@/content/product";
import { CustomerPagePreview } from "@/features/home/customer-page-preview";
import "./product.css";
export function ProductOverview({c,locale}: {c:HomeContent;locale:Locale}) {
 const p=productContent[locale];
 return <section className="product-overview container" id="product" aria-labelledby="product-overview-title"><div><p className="eyebrow"><span className="status-dot"/>MemberFlow</p><h2 id="product-overview-title">{p.overviewTitle}</h2><p>{p.overviewText}</p><div className="product-actions"><Link href={`/${locale}/product`} className="button product-explore-button">{p.explore}<ArrowRight size={16} aria-hidden="true" /></Link><Link href={`/${locale}/pricing`} className="secondary-link">{p.pricing}<ArrowRight size={14} aria-hidden="true"/></Link></div></div><CustomerPagePreview c={c} locale={locale}/></section>;
}
