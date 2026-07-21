"use client";

import { BarChart3, CreditCard, Home, QrCode, ReceiptText, Settings, Users, WalletCards } from "lucide-react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

const nav = [
  { href: "/dashboard", label: "Обзор", icon: Home },
  { href: "/dashboard/programs", label: "Программы", icon: WalletCards },
  { href: "/dashboard/customers", label: "Клиенты", icon: Users },
  { href: "/dashboard/scanner", label: "Сканировать", icon: QrCode },
  { href: "/dashboard/team", label: "Команда", icon: Users },
  { href: "/dashboard/stripe", label: "Stripe", icon: CreditCard },
  { href: "/dashboard/transactions", label: "Операции", icon: ReceiptText },
  { href: "/dashboard/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout nav={nav}>{children}</SidebarLayout>;
}
