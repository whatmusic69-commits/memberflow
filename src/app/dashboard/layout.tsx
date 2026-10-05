import { Suspense } from "react";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isLocale } from "@/content";
import { Workspace } from "@/features/dashboard/workspace";
import "./dashboard.css";
export const metadata: Metadata = {
  title: "Workspace — MemberFlow",
  robots: { index: false, follow: false },
};
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieLocale =
    (await cookies()).get("memberflow_locale")?.value || "en";
  const locale = isLocale(cookieLocale) ? cookieLocale : "en";
  return (
    <Suspense
      fallback={
        <main id="main" className="mf-boot" aria-busy="true">
          MemberFlow
        </main>
      }
    >
      <Workspace initialLocale={locale}>{children}</Workspace>
    </Suspense>
  );
}
