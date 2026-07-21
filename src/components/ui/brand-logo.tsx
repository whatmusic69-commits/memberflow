import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import memberflowMark from "@/img/memberflow-logo-source.svg";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[14px] shadow-[0_14px_32px_rgba(109,93,251,0.3)]", className)}>
      <Image src={memberflowMark} alt="" fill sizes="40px" className="object-cover" priority />
    </span>
  );
}

export function BrandLogo({ href = "/", compact = false, size = "md", className }: { href?: string; compact?: boolean; size?: "sm" | "md"; className?: string }) {
  const markClassName = size === "sm" ? "h-8 w-8 rounded-[11px] shadow-[0_10px_24px_rgba(109,93,251,0.22)]" : undefined;
  const textClassName = size === "sm" ? "text-lg" : "text-xl";
  return (
    <Link href={href} className={cn("inline-flex items-center font-semibold tracking-tight text-[var(--foreground)]", size === "sm" ? "gap-2.5" : "gap-3", className)}>
      {compact ? (
        <BrandMark className={markClassName} />
      ) : (
        <>
          <BrandMark className={markClassName} />
          <span className={cn("font-[750] tracking-tight text-current", textClassName)}>
            Member<span className="text-[var(--primary)]">Flow</span>
          </span>
        </>
      )}
    </Link>
  );
}
