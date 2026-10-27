import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Görevler",
  description: "Ders ödevlerinizi, proje teslimlerinizi ve sınav hazırlık görevlerinizi takip edin.",
};

export default function GorevlerPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
          Görevler
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted">
          Ödevler, laboratuvar raporları, proje teslimleri ve çalışma görevlerinizi öncelik sırasına göre buradan takip edebilirsiniz.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">
          Görev listesi, filtreler ve yeni görev ekleme alanı sonraki aşamada buraya eklenecektir.
        </p>
      </div>
    </div>
  );
}
