"use client";

import { Bell, BriefcaseBusiness, ChevronDown, LogOut, RotateCcw, Settings, UserCircle } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Toast } from "@/components/ui/toast";
import { useDemoStore } from "@/store/demo-store";

const roleLinks = {
  owner: "/dashboard",
  staff: "/staff",
  customer: "/card/demo-washclub",
  admin: "/admin",
};

export function TopBar({ children }: { children?: ReactNode }) {
  const { role, setRole, businesses, selectedBusinessId, setSelectedBusiness, resetDemo } = useDemoStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const business = businesses.find((item) => item.id === selectedBusinessId) ?? businesses[0];
  const profile = getProfile(role, business.name);
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/82 shadow-[0_1px_0_rgba(18,19,32,0.04)] backdrop-blur-xl">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <BrandLogo size="sm" />
          <div className="flex flex-wrap items-center gap-2">
            {children}
            <LanguageSwitcher compact className="hidden sm:inline-flex" />
            <select className="h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-sm font-medium shadow-[var(--shadow-sm)]" value={selectedBusinessId} onChange={(event) => setSelectedBusiness(event.target.value)}>
              {businesses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select className="h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-sm font-medium shadow-[var(--shadow-sm)]" value={role} onChange={(event) => {
              const nextRole = event.target.value as keyof typeof roleLinks;
              setRole(nextRole);
              window.location.href = roleLinks[nextRole];
            }}>
              <option value="owner">Business Owner</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
              <option value="admin">SaaS Admin</option>
            </select>
            <button onClick={resetDemo} className="rounded-xl p-2 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[var(--primary)]" aria-label="Сбросить демо-данные"><RotateCcw className="h-5 w-5" /></button>
            <button className="rounded-xl p-2 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[var(--primary)]" aria-label="Уведомления"><Bell className="h-5 w-5" /></button>
            <span className="hidden items-center gap-2 rounded-xl bg-[var(--primary-soft)] px-3 py-2 text-sm font-semibold text-[var(--primary)] sm:flex"><BriefcaseBusiness className="h-4 w-4" />{business.name}<ChevronDown className="h-4 w-4" /></span>
            <div className="relative">
              <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[var(--primary)]" aria-label="Открыть профиль" aria-expanded={profileOpen}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#121320] text-sm font-bold text-white">{profile.initials}</span>
              </button>
              {profileOpen ? (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-lg)]">
                  <div className="bg-[#121320] p-4 text-white">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary)] text-sm font-bold">{profile.initials}</span>
                      <div>
                        <p className="font-semibold">{profile.name}</p>
                        <p className="text-xs text-slate-300">{profile.label}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <ProfileLink href={profile.home} icon={UserCircle} label="Открыть мой интерфейс" onClick={() => setProfileOpen(false)} />
                    <ProfileLink href={role === "admin" ? "/admin/settings" : "/dashboard/settings"} icon={Settings} label="Настройки профиля" onClick={() => setProfileOpen(false)} />
                    <button type="button" onClick={() => { resetDemo(); setProfileOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      <RotateCcw className="h-4 w-4 text-slate-400" />Сбросить demo-данные
                    </button>
                    <button type="button" onClick={() => { setProfileOpen(false); window.location.href = "/login"; }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50">
                      <LogOut className="h-4 w-4" />Выйти
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <Toast />
    </>
  );
}

function ProfileLink({ href, icon: Icon, label, onClick }: { href: string; icon: typeof UserCircle; label: string; onClick: () => void }) {
  return <Link href={href} onClick={onClick} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Icon className="h-4 w-4 text-slate-400" />{label}</Link>;
}

function getProfile(role: keyof typeof roleLinks, businessName: string) {
  if (role === "admin") return { initials: "SA", name: "SaaS Admin", label: "Platform owner", home: "/admin" };
  if (role === "staff") return { initials: "DS", name: "Diana Scan", label: `${businessName} · Staff`, home: "/staff" };
  if (role === "customer") return { initials: "AO", name: "Anna Ozola", label: "Customer", home: "/customer/cards" };
  return { initials: "BO", name: "Business Owner", label: businessName, home: "/dashboard" };
}
