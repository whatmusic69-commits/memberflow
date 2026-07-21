"use client";
import { ScanLine } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
export default function StaffPage() { const { selectedBusinessId, businesses, operations } = useDemoStore(); const business = businesses.find((b) => b.id === selectedBusinessId); const list = operations.filter((op) => op.businessId === selectedBusinessId).slice(0, 5); return <div className="mx-auto max-w-xl space-y-6"><div><h1 className="text-2xl font-semibold">{business?.name}</h1><p className="text-sm text-slate-500">Diana Scan · Staff</p></div><LinkButton href="/staff/scan" className="h-16 w-full text-base"><ScanLine className="h-5 w-5" />Сканировать QR</LinkButton><StatCard label="Операций сегодня" value="18" /><Card><CardHeader title="Последние операции" />{list.map((op) => <div key={op.id} className="flex justify-between border-b border-slate-100 p-4 text-sm last:border-0"><span>{op.change}</span><span className="text-slate-500">{formatDateTime(op.date)}</span></div>)}</Card></div>; }
