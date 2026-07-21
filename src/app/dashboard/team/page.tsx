"use client";

import { Mail, Plus, Send, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDemoStore } from "@/store/demo-store";
import type { Worker } from "@/types";

const inputClass = "h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-[var(--shadow-sm)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]";

type InviteForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: Worker["role"];
};

export default function TeamPage() {
  const { workers, businesses, selectedBusinessId, addWorker, updateWorkerStatus, deleteWorker } = useDemoStore();
  const business = businesses.find((item) => item.id === selectedBusinessId);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [sentInvite, setSentInvite] = useState<InviteForm | null>(null);
  const [form, setForm] = useState<InviteForm>({ firstName: "", lastName: "", email: "", role: "Staff" });
  const list = workers.filter((worker) => worker.businessId === selectedBusinessId);
  const activeCount = list.filter((worker) => worker.status === "active").length;
  const invitedCount = list.filter((worker) => worker.status === "invited").length;
  const workerLimit = getWorkerLimit(business?.plan);
  const workerLimitReached = workerLimit !== null && list.length >= workerLimit;
  const workerUsagePercent = workerLimit === null ? 18 : Math.min(100, (list.length / workerLimit) * 100);

  function updateForm<Key extends keyof InviteForm>(key: Key, value: InviteForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function sendInvite() {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    if (!firstName || !lastName || !email) return;
    const invite = { ...form, firstName, lastName, email };
    addWorker({ name: `${firstName} ${lastName}`, email, role: form.role });
    setSentInvite(invite);
    setInviteOpen(false);
    setForm({ firstName: "", lastName: "", email: "", role: "Staff" });
  }

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-[#121320] p-6 text-white shadow-[var(--shadow-lg)]">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[var(--primary)]/35 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">/dashboard/team</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Команда</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Отдельный раздел для сотрудников: приглашения, роли, статусы доступа и повторная отправка писем.</p>
          </div>
          <Button disabled={workerLimitReached} onClick={() => setInviteOpen(true)}><Plus className="h-4 w-4" />Добавить сотрудника</Button>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <TeamMetric label="Всего сотрудников" value={String(list.length)} />
          <TeamMetric label="Активные" value={String(activeCount)} />
          <TeamMetric label="Приглашения" value={String(invitedCount)} />
        </div>
        <div className="relative mt-4 rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Лимит сотрудников по тарифу {business?.plan ?? "Complete"}</p>
              <p className="mt-1 text-sm text-slate-300">{workerLimit === null ? `${list.length} / без лимита` : `${list.length} / ${workerLimit} сотрудников`}</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-violet-100">{workerLimit === null ? "∞" : `${Math.round(workerUsagePercent)}%`}</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/12">
            <span className={workerLimitReached ? "block h-full rounded-full bg-[var(--warning)]" : "block h-full rounded-full bg-[var(--primary-bright)]"} style={{ width: `${workerUsagePercent}%` }} />
          </div>
          {workerLimitReached ? <p className="mt-3 text-sm font-semibold text-amber-200">Лимит сотрудников достигнут. Чтобы пригласить ещё людей, смените тариф.</p> : null}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Работники" description="Приглашённые сотрудники получают письмо с ролью и ссылкой входа." />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="p-4">Сотрудник</th>
                <th className="p-4">Должность</th>
                <th className="p-4">Филиал</th>
                <th className="p-4">Статус</th>
                <th className="p-4">Последнее действие</th>
                <th className="p-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {list.map((worker) => (
                <tr key={worker.id} className="border-b border-slate-100 last:border-0">
                  <td className="p-4"><b>{worker.name}</b><p className="text-xs text-slate-500">{worker.email}</p></td>
                  <td className="p-4">{worker.role}</td>
                  <td className="p-4">{worker.branch}</td>
                  <td className="p-4"><StatusBadge status={worker.status} /></td>
                  <td className="p-4 text-slate-500">{worker.lastAction}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => {
                        updateWorkerStatus(worker.id, "invited");
                        setSentInvite(splitWorkerToInvite(worker));
                      }}>Пригласить</Button>
                      <Button variant="secondary" onClick={() => updateWorkerStatus(worker.id, "disabled")}>Отключить</Button>
                      <Button variant="danger" onClick={() => setConfirm(worker.id)}>Удалить</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <InviteModal
        open={inviteOpen}
        form={form}
        businessName={business?.name ?? "MemberFlow Business"}
        onChange={updateForm}
        onClose={() => setInviteOpen(false)}
        onSend={sendInvite}
      />
      <InviteEmailPreview open={Boolean(sentInvite)} invite={sentInvite} businessName={business?.name ?? "MemberFlow Business"} brandColor={business?.brandColor ?? "#6D5DFB"} onClose={() => setSentInvite(null)} />
      <ConfirmModal open={Boolean(confirm)} title="Удалить сотрудника" text="Удаление сотрудника требует подтверждения." onClose={() => setConfirm(null)} onConfirm={() => confirm && deleteWorker(confirm)} />
    </div>
  );
}

function getWorkerLimit(plan?: string) {
  if (plan === "Loyalty") return 2;
  if (plan === "Membership") return 10;
  return null;
}

function TeamMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10"><p className="text-xs text-slate-300">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}

function InviteModal({ open, form, businessName, onChange, onClose, onSend }: { open: boolean; form: InviteForm; businessName: string; onChange: <Key extends keyof InviteForm>(key: Key, value: InviteForm[Key]) => void; onClose: () => void; onSend: () => void }) {
  const disabled = !form.firstName.trim() || !form.lastName.trim() || !form.email.trim();
  return (
    <Modal open={open} title="Пригласить сотрудника" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-2xl bg-[var(--primary-soft)] p-4 text-sm text-slate-700">
          <p className="flex items-center gap-2 font-semibold text-[var(--foreground)]"><Mail className="h-4 w-4 text-[var(--primary)]" />HTML-приглашение</p>
          <p className="mt-1">После отправки сотрудник появится в статусе invited, а ниже будет показан макет письма для {businessName}.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Имя"><input className={inputClass} value={form.firstName} onChange={(event) => onChange("firstName", event.target.value)} placeholder="Anna" /></Field>
          <Field label="Фамилия"><input className={inputClass} value={form.lastName} onChange={(event) => onChange("lastName", event.target.value)} placeholder="Ozola" /></Field>
          <Field label="Должность">
            <select className={inputClass} value={form.role} onChange={(event) => onChange("role", event.target.value as Worker["role"])}>
              <option value="Staff">Staff</option>
              <option value="Manager">Manager</option>
            </select>
          </Field>
          <Field label="Почта"><input type="email" className={inputClass} value={form.email} onChange={(event) => onChange("email", event.target.value)} placeholder="anna@example.com" /></Field>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
          <b>Manager</b> видит клиентов, программы и аналитику. <b>Staff</b> может сканировать карты, списывать услуги и начислять штампы.
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button disabled={disabled} onClick={onSend}><Send className="h-4 w-4" />Отправить приглашение</Button>
        </div>
      </div>
    </Modal>
  );
}

function InviteEmailPreview({ open, invite, businessName, brandColor, onClose }: { open: boolean; invite: InviteForm | null; businessName: string; brandColor: string; onClose: () => void }) {
  if (!invite) return null;
  return (
    <Modal open={open} title="Письмо-приглашение отправлено" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Demo-приглашение отправлено на {invite.email}</div>
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#F4F5F9] p-4 shadow-inner">
          <div className="mx-auto max-w-[520px] overflow-hidden rounded-[26px] bg-white shadow-[0_18px_50px_rgba(18,19,32,0.12)]">
            <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${brandColor}, #121320)` }}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/18 text-lg font-black ring-1 ring-white/20">{businessName[0]}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">MemberFlow Team Invite</p>
                  <h3 className="text-xl font-semibold">{businessName}</h3>
                </div>
              </div>
              <h2 className="mt-8 text-3xl font-semibold tracking-tight">Вас пригласили в команду</h2>
              <p className="mt-3 text-sm leading-6 text-white/76">{invite.firstName}, владелец бизнеса добавил вас в кабинет MemberFlow с ролью {invite.role}.</p>
            </div>
            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <EmailInfo icon={UserRound} label="Сотрудник" value={`${invite.firstName} ${invite.lastName}`} />
                <EmailInfo icon={ShieldCheck} label="Роль" value={invite.role} />
              </div>
              <a className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_32px_rgba(109,93,251,0.28)]">Принять приглашение</a>
              <p className="mt-5 text-center text-xs leading-5 text-slate-500">Ссылка действует 7 дней. Если вы не ожидали это письмо, просто проигнорируйте его.</p>
              <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">MemberFlow</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end"><Button onClick={onClose}>Готово</Button></div>
      </div>
    </Modal>
  );
}

function EmailInfo({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><Icon className="h-5 w-5 text-[var(--primary)]" /><p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-1 font-semibold text-[var(--foreground)]">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-slate-700"><span className="mb-2 block">{label}</span>{children}</label>;
}

function splitWorkerToInvite(worker: Worker): InviteForm {
  const [firstName, ...rest] = worker.name.split(" ");
  return { firstName, lastName: rest.join(" ") || "Staff", email: worker.email, role: worker.role };
}
