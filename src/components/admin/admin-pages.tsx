"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatMoney } from "@/lib/utils";
import { staticData, useDemoStore } from "@/store/demo-store";

export function AdminOverview() {
  return <div className="space-y-6"><div className="relative overflow-hidden rounded-[28px] bg-[#0C0D16] p-6 text-white shadow-[var(--shadow-lg)]"><div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-[var(--primary)]/30 blur-3xl" /><p className="relative text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Platform Admin</p><h1 className="relative mt-2 text-2xl font-semibold">SaaS Admin Overview</h1><div className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><DarkMetric label="Бизнесов" value="48" /><DarkMetric label="Клиентов" value="3 284" /><DarkMetric label="Оборот бизнесов" value="€96 420" /><DarkMetric label="Platform MRR" value="€3 805" /></div></div><div className="grid gap-6 lg:grid-cols-2"><Card className="shadow-[var(--shadow-md)]"><CardHeader title="Рост MRR" /><Chart type="bar" /></Card><Card className="shadow-[var(--shadow-md)]"><CardHeader title="Типы программ" /><Chart type="pie" /></Card></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Активные бизнесы" value="39" /><StatCard label="Trial" value="6" /><StatCard label="Failed payments" value="7" /><StatCard label="Refunds" value="€420" /></div></div>;
}

export function BusinessesAdmin({ businessId }: { businessId?: string }) {
  const { businesses, programs, customers, setSelectedBusiness } = useDemoStore();
  const router = useRouter();
  const selected = businessId ? businesses.find((item) => item.id === businessId) : null;
  if (selected) {
    const bizPrograms = programs.filter((item) => item.businessId === selected.id);
    return <div className="space-y-6"><Button variant="secondary" onClick={() => router.push("/admin/businesses")}>Назад</Button><Card className="overflow-hidden p-5 shadow-[var(--shadow-md)]"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Business profile</p><h1 className="mt-1 text-2xl font-semibold">{selected.name}</h1><p className="text-sm text-slate-500">{selected.category} · {selected.owner} · {selected.email}</p></div><Button onClick={() => { setSelectedBusiness(selected.id, true); router.push("/dashboard"); }}>Открыть кабинет бизнеса</Button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Info label="Тариф" value={selected.plan} /><Info label="Оборот" value={formatMoney(selected.turnoverCents)} /><Info label="Комиссия" value={formatMoney(selected.platformFeeCents)} /></div></Card><Card><CardHeader title="Программы, клиенты, операции и журнал" /><div className="grid gap-3 p-5 sm:grid-cols-3"><Info label="Программ" value={String(bizPrograms.length)} /><Info label="Клиентов" value={String(customers.filter((item) => item.businessId === selected.id).length)} /><Info label="Stripe" value={selected.stripeStatus} /></div></Card></div>;
  }
  return <div className="space-y-6"><h1 className="text-2xl font-semibold">Businesses</h1><Card className="overflow-hidden shadow-[var(--shadow-md)]"><CardHeader title="Подключённые компании" description="Поиск и фильтры представлены как demo-state таблица." /><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Компания</th><th className="p-4">Тариф</th><th className="p-4">Клиенты</th><th className="p-4">Оборот</th><th className="p-4">Stripe</th><th className="p-4">Статус</th></tr></thead><tbody>{businesses.map((biz) => <tr key={biz.id} onClick={() => router.push(`/admin/businesses/${biz.id}`)} className="cursor-pointer border-t border-slate-100 transition hover:bg-[var(--primary-soft)]/60"><td className="p-4"><b>{biz.name}</b><p className="text-xs text-slate-500">{biz.category} · {biz.owner}</p></td><td className="p-4">{biz.plan}</td><td className="p-4">{customers.filter((item) => item.businessId === biz.id).length}</td><td className="p-4">{formatMoney(biz.turnoverCents)}</td><td className="p-4"><StatusBadge status={biz.stripeStatus} /></td><td className="p-4"><StatusBadge status={biz.status} /></td></tr>)}</tbody></table></div></Card></div>;
}

export function RevenueAdmin() {
  return <div className="space-y-6"><h1 className="text-2xl font-semibold">Revenue</h1><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Loyalty тарифы" value="€225" /><StatCard label="Membership тарифы" value="€380" /><StatCard label="Complete" value="€1 225" /><StatCard label="Комиссии" value="€2 893" /></div><Card><CardHeader title="Финансовая разбивка" action={<Button variant="secondary" onClick={() => window.alert("CSV export сформирован для demo.")}>Экспорт CSV</Button>} /><div className="grid gap-3 p-5 sm:grid-cols-3"><Info label="Возвраты" value="€420" /><Info label="Stripe fees" value="€812" /><Info label="Чистый доход" value="€2 573" /><Info label="Ожидаемые выплаты" value="€18 740" /></div></Card></div>;
}

export function AdminTablePage({ title }: { title: string }) {
  const { operations, customers, programs } = useDemoStore();
  return <div className="space-y-6"><h1 className="text-2xl font-semibold">{title}</h1><Card><CardHeader title="Demo table" /><div className="overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{operations.slice(0, 12).map((op) => <tr key={op.id} className="border-b border-slate-100"><td className="p-4">{formatDate(op.date)}</td><td className="p-4">{customers.find((c) => c.id === op.customerId)?.name}</td><td className="p-4">{programs.find((p) => p.id === op.programId)?.name}</td><td className="p-4">{op.change}</td><td className="p-4"><StatusBadge status={op.status} /></td></tr>)}</tbody></table></div></Card></div>;
}

function Chart({ type }: { type: "bar" | "pie" }) {
  if (type === "pie") return <div className="h-80 p-5"><ResponsiveContainer><PieChart><Pie data={[{ name: "Subscriptions", value: 1147 }, { name: "Loyalty", value: 2036 }]} dataKey="value"><Cell fill="#6D5DFB" /><Cell fill="#20B486" /></Pie><Tooltip /></PieChart></ResponsiveContainer></div>;
  return <div className="h-80 p-5"><ResponsiveContainer><BarChart data={staticData.chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(value) => formatMoney(Number(value))} /><Bar dataKey="platformMrrCents" fill="#6D5DFB" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/8 p-4"><p className="text-xs text-slate-300">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}
