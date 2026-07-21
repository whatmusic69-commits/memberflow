import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <Card className="flex flex-col items-center justify-center p-10 text-center">
      <Inbox className="h-10 w-10 text-slate-300" />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
    </Card>
  );
}

export function Skeleton() {
  return <div className="h-24 animate-pulse rounded-lg bg-slate-200" />;
}
