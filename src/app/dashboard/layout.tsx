"use client";

import { BarChart3, BellRing, BriefcaseBusiness, CalendarCheck, CreditCard, Gift, Globe2, Home, LayoutTemplate, QrCode, ReceiptText, Settings, Sparkles, Tag, Users, WalletCards } from "lucide-react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

const nav = [
  { href: "/dashboard", label: "Обзор", icon: Home, group: "Основное" },
  { href: "/dashboard/customers", label: "Клиенты", icon: Users, group: "Основное" },
  { href: "/dashboard/visits", label: "Посещения", icon: ReceiptText, group: "Основное" },
  { href: "/dashboard/services", label: "Услуги", icon: BriefcaseBusiness, group: "Основное" },
  { href: "/dashboard/bookings", label: "Записи", icon: CalendarCheck, group: "Основное", badge: "soon" },
  { href: "/dashboard/loyalty", label: "Лояльность", icon: Gift, group: "Рост и удержание" },
  { href: "/dashboard/offers", label: "Предложения", icon: Tag, group: "Рост и удержание" },
  { href: "/dashboard/automations", label: "Автоматизации", icon: BellRing, group: "Рост и удержание", badge: "soon" },
  { href: "/dashboard/packages", label: "Пакеты и подписки", icon: WalletCards, group: "Рост и удержание" },
  { href: "/dashboard/business-page", label: "Страница бизнеса", icon: Globe2, group: "Пространство бизнеса" },
  { href: "/dashboard/client-portal", label: "Клиентский кабинет", icon: LayoutTemplate, group: "Пространство бизнеса" },
  { href: "/dashboard/wallet", label: "Wallet", icon: WalletCards, group: "Пространство бизнеса" },
  { href: "/dashboard/qr", label: "QR-коды и материалы", icon: QrCode, group: "Пространство бизнеса" },
  { href: "/dashboard/team", label: "Сотрудники", icon: Users, group: "Управление" },
  { href: "/dashboard/analytics", label: "Аналитика", icon: BarChart3, group: "Управление" },
  { href: "/dashboard/payments", label: "Платежи", icon: CreditCard, group: "Управление" },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings, group: "Управление" },
  { href: "/dashboard/programs", label: "Старые программы", icon: Sparkles, group: "Совместимость" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout nav={nav}>{children}</SidebarLayout>;
}
