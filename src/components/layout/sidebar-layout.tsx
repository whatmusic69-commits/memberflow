"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/layout/demo-shell";
import { useDemoStore } from "@/store/demo-store";

export function SidebarLayout({ nav, children, admin = false }: { nav: { href: string; label: string; icon: LucideIcon }[]; children: React.ReactNode; admin?: boolean }) {
  const pathname = usePathname();
  const warning = useDemoStore((state) => state.roleViewWarning);
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopBar />
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-hidden bg-[#0C0D16] p-4 text-white lg:block">
          <div className="absolute -left-16 top-12 h-44 w-44 rounded-full bg-[var(--primary)]/18 blur-3xl" />
          <div className="relative mb-7 flex items-center justify-between">
            <BrandLogo compact className="text-white" />
            {admin ? <span className="rounded-full bg-violet-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-200">Platform Admin</span> : null}
          </div>
          <nav className="relative space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/dashboard" || item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={cn("group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--primary)]", active && "bg-white text-[#121320] shadow-[0_18px_40px_rgba(0,0,0,0.22)] hover:bg-white hover:text-[#121320]")}>
                  {active ? <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--primary)]" /> : null}
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {nav.map((item) => {
              const active = item.href === "/dashboard" || item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return <Link key={item.href} href={item.href} className={cn("shrink-0 rounded-2xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-[var(--border)]", active && "bg-[#121320] text-white")}>{item.label}</Link>;
            })}
          </div>
          {warning && !admin ? <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 shadow-[var(--shadow-sm)]">Вы просматриваете кабинет в режиме администратора платформы</div> : null}
          {children}
        </main>
      </div>
    </div>
  );
}
