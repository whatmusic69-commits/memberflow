import { defaultLocale, isLocale } from "@/content";
import { AuthPage } from "@/features/auth/auth-page";
export const metadata = {
  title: "MemberFlow — Password recovery",
  robots: { index: false, follow: false },
};
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const query = await searchParams;
  const locale =
    typeof query.lang === "string" && isLocale(query.lang)
      ? query.lang
      : defaultLocale;
  return <AuthPage initialLocale={locale} mode="reset" />;
}
