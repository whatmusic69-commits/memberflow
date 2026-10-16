import type { MetadataRoute } from "next";
import { locales } from "@/content";
import { publicSiteOrigin } from "@/config/public-site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {userAgent:"*",allow:"/",disallow:[
      "/dashboard", "/staff", "/login", "/forgot-password",
      ...locales.map(locale=>`/${locale}/onboarding`),
      "/b/*/join", "/*?*preview=", "/*?*prototypeCustomer=", "/*?*demo=", "/*?*guest=",
    ]},
    sitemap:`${publicSiteOrigin}/sitemap.xml`,
  };
}
