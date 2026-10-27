import type { Metadata } from "next";

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
          Ders notlarınız, takıldığınız konular veya çalışma stratejileriniz hakkında anında destek alabileceğiniz yapay zeka asistanı.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">
          Asistan sohbet ve soru-cevap arayüzü sonraki aşamada buraya eklenecektir.
        </p>
      </div>
    </div>
  );
}
