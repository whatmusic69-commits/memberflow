"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import type { DashboardContent } from "@/content/dashboard";
import { createPermissions } from "@/features/access/permissions";
import type { Permission } from "@/features/access/types";
import type { Section } from "./types";
const actions = [
  "campaigns",
  "offers",
  "customers",
  "loyalty",
  "memberships",
] as const;
export function CreateMenu({
  c,
  href,
  can,
}: {
  c: DashboardContent;
  href: (section?: Section) => string;
  can: (permission: Permission) => boolean;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  function close(returnFocus = false) {
    if (!menu.current) return;
    menu.current.open = false;
    if (returnFocus)
      menu.current.querySelector("summary")?.focus({ preventScroll: true });
  }
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (
        menu.current?.open &&
        event.target instanceof Node &&
        !menu.current.contains(event.target)
      )
        menu.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const available = actions.filter((action) => can(createPermissions[action]));
  if (!available.length) return null;
  return (
    <details
      ref={menu}
      className="mf-create"
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close(true);
          return;
        }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        if (menu.current) menu.current.open = true;
        const links = Array.from(
          menu.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [],
        );
        const index = links.indexOf(
          document.activeElement as HTMLAnchorElement,
        );
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? links.length - 1
              : event.key === "ArrowUp"
                ? index <= 0
                  ? links.length - 1
                  : index - 1
                : (index + 1) % links.length;
        links[next]?.focus({ preventScroll: true });
      }}
    >
      <summary className="button button-primary">
        <Plus size={16} />
        {c.create}
      </summary>
      <nav className="mf-popover" aria-label={c.create}>
        {available.map((action) => (
          <Link key={action} href={href(action)} onClick={() => close(true)}>
            <span>{c.createActions[action]}</span>
            <ArrowUpRight size={15} />
          </Link>
        ))}
      </nav>
    </details>
  );
}
