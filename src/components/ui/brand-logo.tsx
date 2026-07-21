import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import memberflowLogo from "@/img/memberflow-logo.svg";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-[var(--primary)] shadow-[0_14px_32px_rgba(109,93,251,0.3)]", className)}>
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.34),transparent_38%)]" />
      <span className="relative flex h-5 w-6 items-center justify-between">
        <span className="h-5 w-2 rounded-full border-2 border-white/95" />
        <span className="h-5 w-2 rounded-full border-2 border-white/95" />
        <span className="absolute left-1/2 top-1/2 h-2 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95" />
      </span>
    </span>
  );
}

export function BrandLogo({ href = "/", compact = false, className }: { href?: string; compact?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3 font-semibold tracking-tight text-[var(--foreground)]", className)}>
      {compact ? (
        <BrandMark />
      ) : (
        <Image
          src={memberflowLogo}
          alt="MemberFlow"
          width={170}
          height={40}
          priority
          className="h-10 w-auto"
        />
      )}
    </Link>
  );
}
