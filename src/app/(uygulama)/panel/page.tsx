import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel",
  description: "DersRotası AI genel kontrol paneli ile günlük derslerinizi ve haftalık hedeflerinizi yönetin.",
};

export default function PanelPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
          Panel
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted">
          Günlük çalışma programınız, yaklaşan sınavlarınız ve haftalık çalışma durumunuz bu ekranda özetlenir.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">
          Panel bileşenleri ve özet kartları sonraki aşamada buraya eklenecektir.
        </p>
      </div>
    </div>
  );
}
