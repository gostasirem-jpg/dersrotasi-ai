import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İstatistikler",
  description: "Çalışma sürelerinizi ve tamamlanan görevlerinizi inceleyin.",
};

export default function IstatistiklerPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
          İstatistikler
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted">
          Çalışma süreniz ve tamamlanan görevleriniz bu ekranda raporlanır.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">
          Çalışma süresi ve görev tamamlama istatistikleri sonraki aşamada buraya eklenecektir.
        </p>
      </div>
    </div>
  );
}
