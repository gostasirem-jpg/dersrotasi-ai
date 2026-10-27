import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İstatistikler",
  description: "Ders çalışma sürelerinizi, görev tamamlama başarılarınızı ve gelişim grafiklerinizi inceleyin.",
};

export default function IstatistiklerPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
          İstatistikler
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted">
          Haftalık odaklanma süreleriniz, ders bazında harcanan saatler ve hedef tamamlama oranlarınız grafiklerle raporlanır.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">
          Gelişim grafikleri ve çalışma analitiği tabloları sonraki aşamada buraya eklenecektir.
        </p>
      </div>
    </div>
  );
}
