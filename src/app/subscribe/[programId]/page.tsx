import { ProgramSignupPage } from "@/components/customer/program-signup-page";

export default async function Page({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  return <ProgramSignupPage programId={programId} mode="subscription" />;
}
