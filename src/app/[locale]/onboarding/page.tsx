import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { onboardingContent } from "@/content/onboarding";
import { Onboarding } from "@/features/onboarding/onboarding";
export const metadata = {
  title: "MemberFlow — Business setup",
  robots: { index: false, follow: false },
};
export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <Onboarding c={onboardingContent[locale]} locale={locale} />;
}
