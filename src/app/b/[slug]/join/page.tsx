import { isLocale } from "@/content";
import { registrationContent } from "@/content/customer-registration";
import { CustomerRegistration } from "@/features/customer-registration/journey";
import { getPublicCustomerPage } from "@/features/customer-page/service";
export async function generateMetadata({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const q = await searchParams;
  const locale = typeof q.lang === "string" && isLocale(q.lang) ? q.lang : "en";
  return {title: `${registrationContent[locale].settings} — MemberFlow`, robots: {index: false, follow: false}};
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params,
    q = await searchParams;
  const locale = typeof q.lang === "string" && isLocale(q.lang) ? q.lang : "en";
  const local =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DASHBOARD_MODE !== "api" &&
    typeof q.preview === "string";
  let page = null;
  if (!local) {
    try {
      page = await getPublicCustomerPage(slug);
    } catch {}
  }
  return (
    <CustomerRegistration
      slug={slug}
      locale={locale}
      initialPage={page}
      previewId={local ? String(q.preview) : undefined}
    />
  );
}
