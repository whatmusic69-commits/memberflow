import { CustomerCard } from "@/components/customer/customer-card";
export default async function Page({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <CustomerCard token={token} />; }
