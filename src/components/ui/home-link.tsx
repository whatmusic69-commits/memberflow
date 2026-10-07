"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { Locale } from "@/content";
/** Explicit home navigation always targets the top, including cached App Router pages. */
export function HomeLink({
  locale,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "href" | "scroll" | "onNavigate"> & {
  locale: Locale;
}) {
  return (
    <Link
      {...props}
      href={`/${locale}#top`}
      scroll
      onNavigate={() =>
        window.scrollTo({ top: 0, left: 0, behavior: "instant" })
      }
    >
      {children}
    </Link>
  );
}
