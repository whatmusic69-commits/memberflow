"use client";

import { Building2, ImagePlus, MapPin, Palette, Plus, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/modal";
import { useDemoStore } from "@/store/demo-store";
import type { Business } from "@/types";

const inputClass = "h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-[var(--shadow-sm)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]";
type BusinessForm = Pick<Business, "name" | "category" | "city" | "address" | "phone" | "email" | "brandColor"> & { logoDataUrl?: string };

export default function SettingsPage() {
  const { businesses, selectedBusinessId, workers, operations, addBranch, deleteBranch, updateBusiness, resetDemo } = useDemoStore();
  const [branchName, setBranchName] = useState("");
  const [confirmBranch, setConfirmBranch] = useState<string | null>(null);
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const branches = business?.branches ?? [];
  const branchLimit = getBranchLimit(business?.plan);
  const branchUsagePercent = Math.min(100, (branches.length / branchLimit) * 100);
  const branchLimitReached = branches.length >= branchLimit;
  const [form, setForm] = useState<BusinessForm>(() => getBusinessForm(business));

  useEffect(() => {
    const id = window.setTimeout(() => setForm(getBusinessForm(business)), 0);
    return () => window.clearTimeout(id);
  }, [business]);

  function updateForm<Key extends keyof BusinessForm>(key: Key, value: BusinessForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleLogo(file?: File) {
    if (!file) return;
    updateForm("logoDataUrl", await fileToDataUrl(file));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Настройки</h1>
        <p className="text-sm text-slate-500">Управление точками бизнеса, demo-интеграциями и сохранёнными данными.</p>
      </div>

      <Card className="overflow-hidden shadow-[var(--shadow-md)]">
        <CardHeader title="Профиль бизнеса" description="Эти данные используются в кабинете, материалах, плакатах и клиентских карточках программ." />
        <div className="grid gap-6 p-5 xl:grid-cols-[1fr_340px]">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Название бизнеса"><input className={inputClass} value={form.name} onChange={(event) => updateForm("name", event.target.value)} /></Field>
            <Field label="Категория"><select className={inputClass} value={form.category} onChange={(event) => updateForm("category", event.target.value)}><option>Автомойка</option><option>Барбершоп</option><option>Кофейня</option><option>Beauty</option><option>Фитнес</option><option>Груминг</option></select></Field>
            <Field label="Город"><input className={inputClass} value={form.city} onChange={(event) => updateForm("city", event.target.value)} /></Field>
            <Field label="Адрес"><input className={inputClass} value={form.address} onChange={(event) => updateForm("address", event.target.value)} /></Field>
            <Field label="Телефон"><input className={inputClass} value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} /></Field>
            <Field label="Email"><input type="email" className={inputClass} value={form.email} onChange={(event) => updateForm("email", event.target.value)} /></Field>
            <Field label="Основной цвет"><div className="flex gap-2"><input type="color" value={form.brandColor} onChange={(event) => updateForm("brandColor", event.target.value)} className="h-11 w-16 rounded-xl border border-[var(--border)] bg-white p-1" /><span className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-[var(--primary-soft)] px-3 text-sm font-semibold text-[var(--primary)]"><Palette className="h-4 w-4" />{form.brandColor}</span></div></Field>
            <Field label="Логотип"><label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-600 transition hover:bg-white"><ImagePlus className="h-4 w-4" />Загрузить логотип<input type="file" accept="image/*" className="hidden" onChange={(event) => handleLogo(event.target.files?.[0])} /></label></Field>
          </div>
          <div className="rounded-[28px] border border-[var(--border)] bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Preview</p>
            <div className="mt-4 rounded-[24px] bg-white p-4 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl text-lg font-bold text-white shadow-[var(--shadow-sm)]" style={{ background: form.brandColor }}>{form.logoDataUrl ? <Image src={form.logoDataUrl} alt="" width={56} height={56} className="h-full w-full object-cover" unoptimized /> : form.name[0] ?? "M"}</span>
                <div className="min-w-0"><h3 className="truncate font-semibold">{form.name}</h3><p className="text-sm text-slate-500">{form.category} · {form.city}</p></div>
              </div>
              <div className="mt-4 rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${form.brandColor}, #121320)` }}>
                <p className="text-sm text-white/70">Клиентская программа</p>
                <p className="mt-1 text-xl font-semibold">{form.name} Pass</p>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={() => business && updateBusiness(business.id, form)}><Save className="h-4 w-4" />Сохранить изменения</Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden shadow-[var(--shadow-md)]">
        <CardHeader
          title="Точки бизнеса"
          description="Добавьте автомойки, кофейни, салоны или филиалы, где действуют подписки и карты лояльности."
        />
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-3">
            <div className="rounded-2xl border border-violet-100 bg-[var(--primary-soft)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Лимит точек по тарифу {business?.plan ?? "Complete"}</p>
                  <p className="mt-1 text-sm text-slate-600">Использовано {branches.length}/{branchLimit} точки</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--primary)] shadow-[var(--shadow-sm)]">{Math.round(branchUsagePercent)}%</span>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
                <span className={branchLimitReached ? "block h-full rounded-full bg-[var(--warning)]" : "block h-full rounded-full bg-[var(--primary)]"} style={{ width: `${branchUsagePercent}%` }} />
              </div>
              {branchLimitReached ? <p className="mt-3 text-sm font-semibold text-amber-700">Лимит точек достигнут. Чтобы добавить ещё филиалы, смените тариф.</p> : null}
            </div>
            {branches.map((branch) => {
              const staffCount = workers.filter((worker) => worker.businessId === selectedBusinessId && worker.branch === branch).length;
              const operationCount = operations.filter((operation) => operation.businessId === selectedBusinessId && operation.branch === branch).length;
              return (
                <div key={branch} className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]"><MapPin className="h-5 w-5" /></span>
                    <div>
                      <h3 className="font-semibold">{branch}</h3>
                      <p className="text-sm text-slate-500">{staffCount} сотрудников · {operationCount} операций · подписки и loyalty-карты</p>
                    </div>
                  </div>
                  <Button variant="ghost" disabled={branches.length <= 1} onClick={() => setConfirmBranch(branch)}><Trash2 className="h-4 w-4" />Удалить</Button>
                </div>
              );
            })}
          </div>
          <Card className="h-fit bg-[var(--primary-soft)] p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[var(--primary)] shadow-[var(--shadow-sm)]"><Building2 className="h-5 w-5" /></span>
              <div><h3 className="font-semibold">Новая точка</h3><p className="text-xs text-slate-500">Например: Imanta, Airport, Center 2</p></div>
            </div>
            <input disabled={branchLimitReached} value={branchName} onChange={(event) => setBranchName(event.target.value)} placeholder="Название точки" className="mt-4 h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-[var(--shadow-sm)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400" />
            <Button disabled={branchLimitReached} className="mt-3 w-full" onClick={() => { addBranch(branchName); setBranchName(""); }}><Plus className="h-4 w-4" />Добавить точку</Button>
            {branchLimitReached ? <p className="mt-3 text-xs font-semibold text-amber-700">Доступно {branchLimit} точек на текущем тарифе.</p> : null}
          </Card>
        </div>
      </Card>

      <Card>
        <CardHeader title="Demo settings" description="Интеграции Stripe, email, Wallet и внешняя авторизация не подключаются в прототипе." />
        <div className="space-y-3 p-5">
          <Button variant="secondary" onClick={() => window.alert("Stripe будет подключён в production-версии.")}>Проверить Stripe status</Button>
          <Button variant="secondary" onClick={() => window.alert("Email invitation demo-state обновлён.")}>Отправить тестовое приглашение</Button>
          <Button variant="danger" onClick={resetDemo}>Сбросить демо-данные</Button>
        </div>
      </Card>

      <ConfirmModal open={Boolean(confirmBranch)} title="Удалить точку" text="Точка будет удалена из demo-данных. Сотрудники и операции этой точки будут перенесены на другую доступную точку." onClose={() => setConfirmBranch(null)} onConfirm={() => confirmBranch && deleteBranch(confirmBranch)} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-slate-700"><span className="mb-2 block">{label}</span>{children}</label>;
}

function getBusinessForm(business?: Business): BusinessForm {
  return {
    name: business?.name ?? "",
    category: business?.category ?? "",
    city: business?.city ?? "",
    address: business?.address ?? "",
    phone: business?.phone ?? "",
    email: business?.email ?? "",
    brandColor: business?.brandColor ?? "#6D5DFB",
    logoDataUrl: business?.logoDataUrl,
  };
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getBranchLimit(plan?: string) {
  if (plan === "Loyalty") return 1;
  if (plan === "Membership") return 3;
  return 10;
}
