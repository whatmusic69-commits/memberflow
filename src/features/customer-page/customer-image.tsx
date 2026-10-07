"use client";
import Image from "next/image";
import { useState, type ReactNode } from "react";
export function CustomerImage({
  src,
  alt,
  className,
  cover = false,
  fallback,
}: {
  src: string | null;
  alt: string;
  className?: string;
  cover?: boolean;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const valid =
    src &&
    (/^(https?:|blob:|data:image\/(png|jpeg|webp);)/.test(src) ||
      (src.startsWith("/") && !src.startsWith("//")));
  if (!valid || failed === src) return <>{fallback}</>;
  return (
    <Image
      src={src!}
      alt={alt}
      className={className}
      width={cover ? 900 : 160}
      height={cover ? 450 : 160}
      sizes={cover ? "(max-width: 560px) 100vw, 560px" : "72px"}
      priority={cover}
      unoptimized={!src!.startsWith("/")}
      onError={() => setFailed(src)}
    />
  );
}
