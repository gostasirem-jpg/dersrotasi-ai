"use client";

import { useState } from "react";
import { Plus, BookOpen, Sparkles, Trash2 } from "lucide-react";
import { useVeriDeposu } from "@/lib/store";
import { ornekVeriMi } from "@/lib/ornek-veri";
import type { Ders } from "@/lib/types";
import type { YeniDersGirdisi } from "@/lib/store";
import { DersKarti } from "@/components/DersKarti";
import { DersFormModal } from "@/components/DersFormModal";
import { OnayModali } from "@/components/OnayModali";
import { YukleniyorIskeleti } from "@/components/YukleniyorIskeleti";

export function DerslerIstemci() {
  const {
    dersler,
    gorevler,
    yuklendi,
    dersEkle,
    dersGuncelle,
    dersSil,
    ornekVerileriYukle,
    tumVerileriSil,
  } = useVeriDeposu();

  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenecekDers, setDuzenlenecekDers] = useState<Ders | null>(null);
  // Her açılışta formun temizlenmesini garanti eden sayaç
  const [formAnahtari, setFormAnahtari] = useState(0);

  // Silme Onay Modal Durumu
  const [silinecekDers, setSilinecekDers] = useState<{ ders: Ders; bagliGorevSayisi: number } | null>(null);
  const [tumunuSilOnayAcik, setTumunuSilOnayAcik] = useState(false);

  // Hydration hatasını önleyen yükleniyor iskeleti
  if (!yuklendi) {
    return (
      <div className="space-y-6">
        <YukleniyorIskeleti baslik="Dersler yükleniyor..." adet={4} />
      </div>
    );
  }

  const ornekVeriAktif = ornekVeriMi(dersler);

  const handleYeniDersAc = () => {
    setDuzenlenecekDers(null);
    setFormAnahtari((prev) => prev + 1);
    setFormAcik(true);
  };

  const handleDuzenleAc = (ders: Ders) => {
    setDuzenlenecekDers(ders);
    setFormAnahtari((prev) => prev + 1);
    setFormAcik(true);
  };

  const handleFormKaydet = (girdi: YeniDersGirdisi) => {
    if (duzenlenecekDers) {
      dersGuncelle(duzenlenecekDers.id, girdi);
    } else {
      dersEkle(girdi);
    }
    setFormAcik(false);
  };

  const handleSilTikla = (ders: Ders, bagliGorevSayisi: number) => {
    setSilinecekDers({ ders, bagliGorevSayisi });
  };

  const handleSilOnayla = () => {
    if (silinecekDers) {
      dersSil(silinecekDers.ders.id);
      setSilinecekDers(null);
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Başlık ve İşlem Alanı */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
            Dersler
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted">
            Derslerinizi ve zorluk seviyelerini yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {dersler.length > 0 && (
            <button
              type="button"
              onClick={() => setTumunuSilOnayAcik(true)}
              aria-label="Tüm verileri temizle"
              className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-muted hover:text-danger hover:border-danger/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            >
              <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Tümünü temizle
            </button>
          )}

          <button
            type="button"
            onClick={handleYeniDersAc}
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:bg-accent-hover active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Ders ekle</span>
          </button>
        </div>
      </div>

      {/* Örnek Veri Seti Bilgilendirme Rozeti */}
      {ornekVeriAktif && (
        <div
          role="note"
          aria-label="Örnek Veri Seti Uyarısı"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-main"
        >
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
              Örnek veri seti
            </span>
            <p className="text-xs sm:text-sm text-muted">
              Şu an görüntülenen dersler tanıtım amaçlı oluşturulmuş örnek verilerdir.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => ornekVerileriYukle()}
              className="inline-flex items-center font-semibold text-primary hover:underline min-h-[44px] px-2"
            >
              Örnekleri yenile
            </button>
          </div>
        </div>
      )}

      {/* Ders Kartları veya Boş Durum */}
      {dersler.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-surface/50 p-8 sm:p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto text-muted">
            <BookOpen className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-main">
              Henüz eklenmiş bir ders bulunmuyor
            </h2>
            <p className="text-sm text-muted">
              Çalışma planınızı oluşturabilmek için dönem boyunca aldığınız dersleri ekleyin veya örnek verileri yükleyerek sistemi keşfedin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleYeniDersAc}
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              İlk dersini ekle
            </button>

            <button
              type="button"
              onClick={() => ornekVerileriYukle()}
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl border border-border bg-surface text-main font-semibold text-sm hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
              Örnek verileri yükle
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {dersler.map((ders) => (
            <DersKarti
              key={ders.id}
              ders={ders}
              gorevler={gorevler}
              onDuzenle={handleDuzenleAc}
              onSil={handleSilTikla}
            />
          ))}
        </div>
      )}

      {/* Ders Ekleme / Düzenleme Modalı */}
      <DersFormModal
        acik={formAcik}
        anahtar={formAnahtari}
        duzenlenecekDers={duzenlenecekDers}
        onKaydet={handleFormKaydet}
        onKapat={() => setFormAcik(false)}
      />

      {/* Tekil Ders Silme Onay Modalı */}
      <OnayModali
        acik={Boolean(silinecekDers)}
        baslik="Dersi sil"
        mesaj={
          silinecekDers
            ? `"${silinecekDers.ders.ad}" dersi ve bu derse ait ${silinecekDers.bagliGorevSayisi} adet görev kalıcı olarak silinecektir. Devam etmek istiyor musunuz?`
            : ""
        }
        onayButonMetni="Evet, dersi sil"
        iptalButonMetni="Vazgeç"
        tehlikeliMi={true}
        onOnay={handleSilOnayla}
        onKapat={() => setSilinecekDers(null)}
      />

      {/* Tüm Verileri Sıfırlama Onay Modalı */}
      <OnayModali
        acik={tumunuSilOnayAcik}
        baslik="Tüm verileri temizle"
        mesaj="Kayıtlı tüm dersleriniz, ödev ve sınav görevleriniz sıfırlanacaktır. Bu işlem geri alınamaz."
        onayButonMetni="Tüm verileri sil"
        iptalButonMetni="Vazgeç"
        tehlikeliMi={true}
        onOnay={() => {
          tumVerileriSil();
          setTumunuSilOnayAcik(false);
        }}
        onKapat={() => setTumunuSilOnayAcik(false)}
      />
    </div>
  );
}
