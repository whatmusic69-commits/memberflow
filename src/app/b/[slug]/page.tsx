import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { isLocale } from "@/content";
import { customerPageContent } from "@/content/customer-page";
import { getPublicCustomerPage } from "@/features/customer-page/service";
import { safeLink } from "@/features/customer-page/public-model";
import { PublicFailure } from "@/features/customer-page/public-failure";
import { CustomerExperience } from "@/features/customer-page/customer-experience";
import "@/features/customer-page/customer-page.css";
type Query = Record<string, string | string[] | undefined>;
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Query>;
};
const demo =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DASHBOARD_MODE !== "api";
const load = cache(async (slug: string, fixture: string) => {
  if (demo) {
    if (slug !== "your-coffee") return null;
    const { publicFixtures } = await import("@/mocks/customer-page/fixtures");
    return (
      publicFixtures[fixture as keyof typeof publicFixtures] ||
      publicFixtures.guest
    );
  }
  try {
    return await getPublicCustomerPage(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params,
    query = await searchParams;
  if (demo && typeof query.preview === "string")
    return {
      title: "Customer page preview — MemberFlow",
      robots: { index: false, follow: false },
    };
  try {
    const page = await load(
      slug,
      typeof query.demo === "string" ? query.demo : "guest",
    );
    if (!page)
      return { title: "MemberFlow", robots: { index: false, follow: false } };
    const cover = safeLink(page.branding.coverUrl);
    return {
      title: page.business.name,
      description: page.business.description || undefined,
      robots: {
        index: !demo && page.status === "ACTIVE",
        follow: !demo && page.status === "ACTIVE",
      },
      openGraph: {
        title: page.business.name,
        description: page.business.description || undefined,
        ...(cover ? { images: [cover] } : {}),
      },
    };
  } catch {
    return { title: "MemberFlow", robots: { index: false, follow: false } };
  }
}
export default async function PublicCustomerPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params,
    query = await searchParams;
  const locale =
    typeof query.lang === "string" && isLocale(query.lang) ? query.lang : "en";
  const c = customerPageContent[locale];
  if (demo && typeof query.preview === "string")
    return (
      <main id="main" className="cp-public-shell">
        <CustomerExperience
          key={`${slug}:${query.preview}:${locale}`}
          initialPage={null}
          locale={locale}
          demo
          previewId={query.preview}
        />
      </main>
    );
  let page;
  try {
    page = await load(
      slug,
      typeof query.demo === "string" ? query.demo : "guest",
    );
  } catch (error) {
    if (error instanceof ApiError && [403, 410].includes(error.status))
      return (
        <main id="main" className="cp-public-state">
          <h1>{c.unavailable}</h1>
        </main>
      );
    return <PublicFailure locale={locale} />;
  }
  if (!page) notFound();
  return (
    <main id="main" className="cp-public-shell">
      <CustomerExperience
        key={`${slug}:${typeof query.demo === "string" ? query.demo : "guest"}:${locale}`}
        initialPage={page}
        locale={locale}
        demo={demo}
        connectedFixture={demo && query.demo === "connected"}
      />
    </main>
  );
}
