import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Çalışma Planı",
  description: "Yapay zeka tarafından hazırlanan kişiselleştirilmiş haftalık ve dönemlik çalışma planı.",
};

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
          Çalışma Planı
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted">
          Yapay zeka algoritması derslerinizin zorluk seviyesine ve sınav takviminize göre en ideal çalışma rotasını çıkarır.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">
          Akıllı rota oluşturucu ve çalışma blokları sonraki aşamada buraya eklenecektir.
        </p>
      </div>
    </div>
  );
}
