import { ProgramMaterialsPage } from "@/components/poster/program-materials-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProgramMaterialsPage programId={id} />;
}
