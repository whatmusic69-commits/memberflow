import { defaultLocale, isLocale } from "@/content";
import { AuthPage } from "@/features/auth/auth-page";
import { safeAuthRedirect } from "@/features/auth/redirect";
export const metadata = {
  title: "MemberFlow — Log in",
  robots: { index: false, follow: false },
};
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; redirect?: string; reason?: string }>;
}) {
  const query = await searchParams;
  const locale =
    typeof query.lang === "string" && isLocale(query.lang)
      ? query.lang
      : defaultLocale;
  return (
    <AuthPage
      initialLocale={locale}
      redirectTo={safeAuthRedirect(query.redirect)}
      sessionExpired={query.reason === "expired"}
    />
  );
}
