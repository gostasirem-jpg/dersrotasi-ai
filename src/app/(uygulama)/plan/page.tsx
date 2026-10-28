import { Suspense } from "react";
import type { Metadata } from "next";
import { PlanIstemci } from "@/components/plan/PlanIstemci";
import { YukleniyorIskeleti } from "@/components/YukleniyorIskeleti";

export const metadata: Metadata = {
  title: "Akıllı Plan",
  description: "Öncelik algoritması ile hazırlanan kişiselleştirilmiş 7 günlük akıllı çalışma planı.",
};

export default function PlanPage() {
  return (
    <Suspense fallback={<YukleniyorIskeleti baslik="Çalışma planı yükleniyor..." adet={4} />}>
      <PlanIstemci />
    </Suspense>
  );
}

