import type { Metadata } from "next";
import { TakvimIstemci } from "@/components/takvim/TakvimIstemci";

export const metadata: Metadata = {
  title: "Takvim",
  description: "Sınav, ödev ve çalışma bloklarınızı tarihe göre görüntüleyin.",
};

export default function TakvimPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
          Takvim
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted">
          Sınav, ödev ve çalışma bloklarınızı takvim görünümünde tarihe göre takip edebilirsiniz.
        </p>
      </div>

      <TakvimIstemci />
    </div>
  );
}
