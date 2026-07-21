"use client";

import { BarChart3, Building2, Home, ReceiptText, Settings, Users } from "lucide-react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
const nav = [{ href: "/admin", label: "Overview", icon: Home }, { href: "/admin/businesses", label: "Businesses", icon: Building2 }, { href: "/admin/customers", label: "Customers", icon: Users }, { href: "/admin/revenue", label: "Revenue", icon: BarChart3 }, { href: "/admin/transactions", label: "Transactions", icon: ReceiptText }, { href: "/admin/settings", label: "Settings", icon: Settings }];
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <SidebarLayout nav={nav} admin>{children}</SidebarLayout>; }
