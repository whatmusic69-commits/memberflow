"use client";
import { useRef, useState } from "react";
import type { Locale } from "@/content";
import {
  moduleRepository,
  readLocalRecords,
} from "@/features/workspace/repository";
import { readPageDraft } from "@/features/customer-page/service";
import { executePrototype } from "./repository";
import { prototypePersonal } from "./customer-model";
import type { CustomerPagePersonal } from "@/features/customer-page/types";
import { prototypeContent } from "@/content/prototype";
export function PrototypeJoin({
  businessId,
  locale,
  onJoined,
}: {
  businessId: string;
  locale: Locale;
  onJoined: (p: CustomerPagePersonal) => void;
}) {
  const c = prototypeContent[locale];
  const [name, setName] = useState(c.customer);
  const [programmeId, setProgramme] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const createdCustomer = useRef<string | null>(null);
  const operationKey = useRef<string | null>(null);
  const programmes = readLocalRecords(businessId, "loyalty").filter(
    (p) => !p.archived,
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    let saved = false;
    try {
      if (
        readPageDraft(businessId)?.status !== "ACTIVE" ||
        !programmes.some((p) => p.id === programmeId) ||
        !name.trim()
      )
        throw new Error("invalid");
      const customer = await moduleRepository("customers", true).save(
        businessId,
        { name: name.trim(), email: "", phone: "", notes: "" },
        createdCustomer.current ?? undefined,
      );
      createdCustomer.current = customer.id;
      operationKey.current ??= crypto.randomUUID();
      executePrototype({
        businessId,
        customerId: customer.id,
        programmeId,
        type: "join",
        key: operationKey.current,
        actorName: null,
        memberId: "preview-customer",
      });
      saved = true;
      onJoined(prototypePersonal(businessId, customer.id));
    } catch {
      setError(c.error);
    } finally {
      if (!saved) {
        lock.current = false;
        setBusy(false);
      }
    }
  }
  return (
    <form onSubmit={submit}>
      <p>{c.notice}</p>
      <label className="mf-form-field">
        <span>{c.customer}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
        />
      </label>
      <label className="mf-form-field">
        <span>{c.programme}</span>
        <select
          value={programmeId}
          onChange={(e) => setProgramme(e.target.value)}
          required
        >
          <option value="">{c.choose}</option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      <button className="button" disabled={busy || !programmes.length}>
        {c.join}
      </button>
    </form>
  );
}
