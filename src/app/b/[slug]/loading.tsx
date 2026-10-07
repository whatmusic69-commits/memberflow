import { cookies } from "next/headers";
import { isLocale } from "@/content";
import { customerPageContent } from "@/content/customer-page";
export default async function Loading() {
  const value = (await cookies()).get("memberflow_locale")?.value;
  const locale = value && isLocale(value) ? value : "en";
  return (
    <main id="main" className="cp-public-state cp-loading" aria-busy="true">
      <div className="cp-loading-cover" />
      <p role="status">{customerPageContent[locale].loading}</p>
    </main>
  );
}
