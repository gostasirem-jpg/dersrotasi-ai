import type { Metadata } from "next";

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

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">
          İnteraktif haftalık ve aylık takvim görünümü sonraki aşamada buraya eklenecektir.
        </p>
      </div>
    </div>
  );
}
