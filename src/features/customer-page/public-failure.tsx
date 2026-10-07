"use client";
import { useRouter } from "next/navigation";
import type { Locale } from "@/content";
import { customerPageContent } from "@/content/customer-page";
export function PublicFailure({ locale }: { locale: Locale }) {
  const router = useRouter();
  const c = customerPageContent[locale];
  return (
    <main id="main" className="cp-public-state">
      <h1>{c.error}</h1>
      <button className="button" onClick={() => router.refresh()}>
        {c.retry}
      </button>
    </main>
  );
}
