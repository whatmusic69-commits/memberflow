import { notFound } from "next/navigation";
import { CustomersPage } from "@/features/customers/customers-page";
import { UsagePage } from "@/features/usage/usage-page";
import { TeamPage } from "@/features/team/team-page";
import { CampaignsPage } from "@/features/campaigns/campaigns-page";
import { ModulePage } from "@/features/workspace/module-page";
import { SettingsPage } from "@/features/workspace/settings-page";
import { IntegrationsPage } from "@/features/workspace/integrations-page";
import type { ModuleId } from "@/features/workspace/types";
const sections = [
  "billing",
  "team",
  "campaigns",
  "customers",
  "loyalty",
  "memberships",
  "offers",
  "automations",
  "integrations",
  "settings",
];
export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  if (section === "billing") return <UsagePage />;
  if (section === "customers") return <CustomersPage />;
  if (section === "team") return <TeamPage />;
  if (section === "campaigns") return <CampaignsPage />;
  if (section === "settings") return <SettingsPage />;
  if (section === "integrations") return <IntegrationsPage />;
  return <ModulePage key={section} feature={section as ModuleId} />;
}
