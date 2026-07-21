"use client";

import { ArrowLeft } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PosterBuilder } from "@/components/poster/poster-builder";
import { useDemoStore } from "@/store/demo-store";

export function ProgramMaterialsPage({ programId }: { programId: string }) {
  const { businesses, programs } = useDemoStore();
  const program = programs.find((item) => item.id === programId);
  const business = businesses.find((item) => item.id === program?.businessId);

  if (!program) {
    return (
      <div className="space-y-4">
        <LinkButton href="/dashboard/programs" variant="secondary"><ArrowLeft className="h-4 w-4" />Назад</LinkButton>
        <h1 className="text-2xl font-semibold">Программа не найдена</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <LinkButton href="/dashboard/programs" variant="secondary"><ArrowLeft className="h-4 w-4" />Назад к программам</LinkButton>
          <h1 className="mt-4 text-2xl font-semibold">Материалы: {program.name}</h1>
          <p className="text-sm text-slate-500">Создайте A4-плакат с QR-кодом для стойки, печати или размещения в заведении.</p>
        </div>
      </div>
      <PosterBuilder business={business} program={program} source="dashboard" />
    </div>
  );
}
