"use client";
import Link from "next/link";
import { Check, Circle, ArrowRight } from "lucide-react";
import { useWorkspace } from "./workspace";
import { prototypeContent } from "@/content/prototype";
import { readBusinessProfile } from "@/features/workspace/business-profile";
import { readLocalRecords } from "@/features/workspace/repository";
import { readPageDraft } from "@/features/customer-page/service";
import { readPrototypeLedger } from "@/features/prototype/repository";
import { readQrPreview } from "@/features/customer-connection/preview-state";
import type { Permission } from "@/features/access/types";
export function SetupChecklist() {
  const { data, locale, href, can } = useWorkspace();
  if (!data || data.source !== "demo") return null;
  const id = data.business.id;
  const c = prototypeContent[locale];
  const profile = readBusinessProfile(id);
  const page = readPageDraft(id);
  const steps = [
    {
      done:
        !!profile?.business.name.trim() &&
        !!profile.business.category.trim() &&
        !!profile.business.city.trim() &&
        !!profile.business.description.trim(),
      href: href("settings"),
      permission: "business.settings.read",
    },
    {
      done:
        !!page &&
        !!page.business.name.trim() &&
        !!page.business.description.trim(),
      href: href("customer-page"),
      permission: "customer-page.read",
    },
    {
      done: readLocalRecords(id, "loyalty").some((p) => !p.archived),
      href: href("loyalty"),
      permission: "loyalty.read",
    },
    {
      done: page?.status === "ACTIVE",
      href: href("customer-page"),
      permission: "customer-page.read",
    },
    {
      done: !!page && readQrPreview(id, page.slug),
      href: href("customers").replace("?", "/connection?"),
      permission: "customer-page.read",
    },
    {
      done: readPrototypeLedger(id).progress.some((p) =>
        readLocalRecords(id, "customers").some(
          (c) => c.id === p.customerId && !c.archived,
        ),
      ),
      href: href("customers"),
      permission: "customer.read",
    },
  ];
  if (steps.every((s) => s.done)) return null;
  return (
    <section className="mf-panel mf-setup-checklist">
      <div className="mf-panel-heading">
        <h2>{c.setup}</h2>
        <span>
          {steps.filter((s) => s.done).length} / {steps.length}
        </span>
      </div>
      <p className="mf-draft-notice">{c.notice}</p>
      <ol>
        {steps.map((s, i) => (
          <li key={s.permission + ":" + i}>
            {s.done ? (
              <Check size={17} aria-hidden="true" />
            ) : (
              <Circle size={17} aria-hidden="true" />
            )}
            {can(s.permission as Permission) ? (
              <Link href={s.href}>
                {c.steps[i]}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ) : (
              <span>{c.steps[i]}</span>
            )}
            <span className="sr-only">{s.done ? "✓" : "—"}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
