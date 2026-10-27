import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dersler",
  description: "Kayıtlı derslerinizi, kredi bilgilerinizi ve ders izlencelerinizi düzenleyin.",
};

export default function DerslerPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
          Dersler
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted">
          Dönem boyunca aldığınız dersleri, AKTS/kredi bilgilerini ve ders materyallerini bu ekranda yönetebilirsiniz.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm text-muted">
          Ders listesi ve yeni ders ekleme arayüzü sonraki aşamada buraya eklenecektir.
        </p>
      </div>
    </div>
  );
}
