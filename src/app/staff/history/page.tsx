"use client";
import { Card, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
export default function StaffHistoryPage() { const { selectedBusinessId, operations } = useDemoStore(); return <div className="mx-auto max-w-2xl space-y-6"><h1 className="text-2xl font-semibold">Моя история операций</h1><Card><CardHeader title="Операции Staff" />{operations.filter((op) => op.businessId === selectedBusinessId).slice(0, 12).map((op) => <div key={op.id} className="flex justify-between border-b border-slate-100 p-4 text-sm last:border-0"><span>{op.change} · {op.branch}</span><span className="text-slate-500">{formatDateTime(op.date)}</span></div>)}</Card></div>; }
