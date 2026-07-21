"use client";

import { History, Home, ScanLine } from "lucide-react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
const nav = [{ href: "/staff", label: "Главная", icon: Home }, { href: "/staff/scan", label: "Сканировать", icon: ScanLine }, { href: "/staff/history", label: "История", icon: History }];
export default function StaffLayout({ children }: { children: React.ReactNode }) { return <SidebarLayout nav={nav}>{children}</SidebarLayout>; }
