import { PublicBusinessPage } from "@/components/business/business-page";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicBusinessPage slug={slug} />;
}
