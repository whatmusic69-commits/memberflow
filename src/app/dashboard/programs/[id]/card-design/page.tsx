import { DashboardCardDesignPage } from "@/components/wallet/wallet-card-designer";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DashboardCardDesignPage programId={id} />;
}
