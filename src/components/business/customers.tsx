"use client";

import { Search, SlidersHorizontal, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import type { Customer } from "@/types";

export function CustomersPage() {
  const { selectedBusinessId, businesses, customers, programs, adjustCustomer } = useDemoStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Customer | null>(null);
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const bizPrograms = programs.filter((program) => program.businessId === selectedBusinessId);
  const activeClientUsage = Math.max(customers.filter((customer) => customer.businessId === selectedBusinessId).length, bizPrograms.reduce((sum, program) => sum + program.customers, 0));
  const clientLimit = getClientLimit(business?.plan);
  const clientUsagePercent = Math.min(100, (activeClientUsage / clientLimit) * 100);
  const nearLimit = clientUsagePercent >= 80;
  const list = useMemo(() => customers.filter((customer) => customer.businessId === selectedBusinessId && (status === "all" || customer.status === status) && customer.name.toLowerCase().includes(query.toLowerCase())), [customers, selectedBusinessId, status, query]);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Клиенты</h1><p className="text-sm text-slate-500">Поиск, фильтры, профиль и ручные корректировки.</p></div>
      <Card className="relative overflow-hidden bg-[#121320] p-5 text-white shadow-[var(--shadow-lg)]">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[var(--primary)]/35 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-violet-200 ring-1 ring-white/10"><Users className="h-6 w-6" /></span>
            <div>
              <p className="text-sm font-semibold">Лимит активных клиентов по тарифу {business?.plan ?? "Complete"}</p>
              <p className="mt-1 text-sm text-slate-300">{activeClientUsage.toLocaleString("ru-RU")} / {clientLimit.toLocaleString("ru-RU")} активных клиентов</p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-violet-100">{Math.round(clientUsagePercent)}%</span>
        </div>
        <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-white/12">
          <span className={nearLimit ? "block h-full rounded-full bg-[var(--warning)]" : "block h-full rounded-full bg-[var(--primary-bright)]"} style={{ width: `${clientUsagePercent}%` }} />
        </div>
        {nearLimit ? <p className="relative mt-3 text-sm font-semibold text-amber-200">Вы приближаетесь к лимиту активных клиентов. При росте базы стоит сменить тариф.</p> : null}
      </Card>
      <Card>
        <CardHeader title="База клиентов" action={<Button variant="secondary"><SlidersHorizontal className="h-4 w-4" />Фильтры</Button>} />
        <div className="flex flex-col gap-3 p-4 sm:flex-row">
          <label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск клиента" className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" /></label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option value="all">Все статусы</option><option value="active">Active</option><option value="failed_payment">Failed payment</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Клиент</th><th className="p-4">Программы</th><th className="p-4">Остаток</th><th className="p-4">Прогресс</th><th className="p-4">Награды</th><th className="p-4">Визит</th><th className="p-4">Статус</th></tr></thead>
            <tbody>
              {list.map((customer) => {
                const sub = programs.find((item) => item.id === customer.subscriptionProgramId);
                const loy = programs.find((item) => item.id === customer.loyaltyProgramId);
                return <tr key={customer.id} onClick={() => setSelected(customer)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"><td className="p-4"><b>{customer.name}</b><p className="text-xs text-slate-500">{customer.email}</p><p className="text-xs text-slate-500">{customer.phone}</p></td><td className="p-4">{[sub?.name, loy?.name].filter(Boolean).join(", ")}</td><td className="p-4">{customer.remainingUses} из {customer.includedUses}</td><td className="p-4">{customer.stamps} / {loy?.targetCount ?? 5}</td><td className="p-4">{customer.rewards}</td><td className="p-4">{formatDate(customer.lastVisit)}</td><td className="p-4"><StatusBadge status={customer.status} /></td></tr>;
              })}
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border-t border-slate-100 p-6">
                    <EmptyState title="Клиенты не найдены" text="Измените поиск или фильтр статуса. Когда клиент подключится по QR, он появится в этой таблице." />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={Boolean(selected)} title={selected?.name ?? "Клиент"} onClose={() => setSelected(null)}>
        {selected ? <div className="space-y-4 text-sm">
          <p className="text-slate-500">{selected.email} · {selected.phone}</p>
          <div className="grid grid-cols-2 gap-3"><Info label="Осталось услуг" value={`${selected.remainingUses} из ${selected.includedUses}`} /><Info label="Штампы" value={String(selected.stamps)} /><Info label="Награды" value={String(selected.rewards)} /><Info label="Следующее обновление" value={formatDate(selected.nextRenewal)} /></div>
          <div className="grid gap-2 sm:grid-cols-2"><Button onClick={() => adjustCustomer(selected.id, "add_service")}>Добавить услугу</Button><Button variant="secondary" onClick={() => adjustCustomer(selected.id, "add_stamp")}>Добавить штамп</Button><Button variant="secondary" onClick={() => adjustCustomer(selected.id, "issue_reward")}>Выдать награду</Button><Button variant="danger" onClick={() => adjustCustomer(selected.id, "redeem_reward")}>Списать награду</Button></div>
        </div> : null}
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="font-semibold">{value}</p></div>;
}

function getClientLimit(plan?: string) {
  if (plan === "Loyalty") return 300;
  if (plan === "Membership") return 1500;
  return 5000;
}
