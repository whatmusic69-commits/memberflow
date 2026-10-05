"use client";
import Link from "next/link";
import { useOnboardingTransition } from "@/components/navigation/onboarding-transition";
import { useParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { isLocale, defaultLocale } from "@/content";
export function StartLink({ label }: { label: string }) {
  const transition = useOnboardingTransition();
  const params = useParams();
  const locale =
    typeof params.locale === "string" && isLocale(params.locale)
      ? params.locale
      : defaultLocale;
  return (
    <Link
      href={`/${locale}/onboarding`}
      prefetch
      className="button button-primary"
      onNavigate={(event) => {
        if (transition) {
          event.preventDefault();
          transition(`/${locale}/onboarding`);
        }
      }}
    >
      {label}
      <ArrowUpRight size={17} aria-hidden="true" />
    </Link>
  );
}
