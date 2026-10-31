import type { Metadata } from "next";
import { AsistanIstemci } from "@/components/asistan/AsistanIstemci";

export const metadata: Metadata = {
  title: "Yapay Zeka Asistanı",
  description: "Dersleriniz, konu özetleriniz ve sınav hazırlıklarınız için akıllı akademik rehber.",
};

export default function AsistanPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
          Asistan
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted">
          Derslerine, görevlerine ve günlük hedefine göre kısa ve uygulanabilir çalışma önerileri al.
        </p>
      </div>

      <AsistanIstemci />
    </div>
  );
}
