import type { WorkspaceContent } from "@/content/workspace";
export function localizedPlan(
  name: string | null,
  c: WorkspaceContent,
): string {
  if (!name) return c.unknown;
  const placeholder = name.match(/^PLAN ([ABC])$/);
  return placeholder
    ? c.planPlaceholder.replace("{id}", placeholder[1])
    : name === "Demo plan"
      ? c.demoPlan
      : name;
}
