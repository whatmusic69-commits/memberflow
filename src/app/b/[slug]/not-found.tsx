import { customerPageContent } from "@/content/customer-page";
import { cookies } from "next/headers";
import { isLocale } from "@/content";
import { Wordmark } from "@/components/ui/brand";
export default async function NotFound() {
  const value = (await cookies()).get("memberflow_locale")?.value;
  const locale = value && isLocale(value) ? value : "en";
  return (
    <main id="main" className="cp-public-state">
      <Wordmark />
      <h1>{customerPageContent[locale].notFound}</h1>
    </main>
  );
}
