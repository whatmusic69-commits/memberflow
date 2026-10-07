import "@fontsource-variable/manrope";
import "./globals.css";
import { LocalePreference } from "@/components/navigation/locale-preference";
import { OnboardingTransition } from "@/components/navigation/onboarding-transition";
import { content, isLocale, defaultLocale } from "@/content";
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = raw && isLocale(raw) ? raw : defaultLocale;
  return (
    <html lang={locale}>
      <body>
        <LocalePreference />
        <a className="skip-link" href="#main">
          {content[locale].skip}
        </a>
        <OnboardingTransition>{children}</OnboardingTransition>
      </body>
    </html>
  );
}
