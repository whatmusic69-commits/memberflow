import { Suspense } from "react";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isLocale } from "@/content";
import { StaffApp } from "@/features/staff/staff-app";
import "../dashboard/dashboard.css";
import "./staff.css";
export const metadata: Metadata = {
  title: "Staff — MemberFlow",
  robots: { index: false, follow: false },
};
export default async function StaffPage() {
  const value = (await cookies()).get("memberflow_locale")?.value;
  return (
    <Suspense
      fallback={
        <main id="main" className="mf-staff-loading" aria-busy="true">
          MemberFlow
        </main>
      }
    >
      <StaffApp initialLocale={value && isLocale(value) ? value : "en"} />
    </Suspense>
  );
}
