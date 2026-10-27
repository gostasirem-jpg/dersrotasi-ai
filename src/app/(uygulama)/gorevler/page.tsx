"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, CheckSquare, Sparkles, Filter, AlertCircle, ArrowRight } from "lucide-react";
import { useVeriDeposu } from "@/lib/store";
import type { Gorev, Ders } from "@/lib/types";
import type { YeniGorevGirdisi } from "@/lib/store";
import { yerelTarihAyristir } from "@/lib/tarih";
import { GorevKarti } from "@/components/GorevKarti";
import { GorevFormModal } from "@/components/GorevFormModal";
import { OnayModali } from "@/components/OnayModali";
import { YukleniyorIskeleti } from "@/components/YukleniyorIskeleti";

type DurumFiltresi = "tumu" | "bekleyen" | "tamamlanan";

export default function GorevlerPage() {
  const {
    dersler,
    gorevler,
    yuklendi,
    gorevEkle,
    gorevGuncelle,
    gorevSil,
    gorevTamamlandiDegistir,
    ornekVerileriYukle,
  } = useVeriDeposu();

  // Filtre durumları
  const [durumFiltre, setDurumFiltre] = useState<DurumFiltresi>("tumu");
  const [seciliDersFiltre, setSeciliDersFiltre] = useState<string>("tumu");

  // Modal durumları
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenecekGorev, setDuzenlenecekGorev] = useState<Gorev | null>(null);
  const [silinecekGorev, setSilinecekGorev] = useState<Gorev | null>(null);

  // Ders haritası (hızlı erişim için)
  const dersMap = useMemo(() => {
    const map = new Map<string, Ders>();
    dersler.forEach((d) => map.set(d.id, d));
    return map;
  }, [dersler]);

  // Sayısal filtre göstergeleri
  const bekleyenSayisi = useMemo(
    () => gorevler.filter((g) => !g.tamamlandi).length,
    [gorevler]
  );
  const tamamlananSayisi = useMemo(
    () => gorevler.filter((g) => g.tamamlandi).length,
    [gorevler]
  );

  // Filtrelenmiş ve sonTarih'e göre sıralanmış görevler
  const filtrelenmisGorevler = useMemo(() => {
    return gorevler
      .filter((gorev) => {
        // Durum filtresi
        if (durumFiltre === "bekleyen" && gorev.tamamlandi) return false;
        if (durumFiltre === "tamamlanan" && !gorev.tamamlandi) return false;

        // Ders filtresi
        if (seciliDersFiltre !== "tumu" && gorev.dersId !== seciliDersFiltre) return false;

        return true;
      })
      .sort((a, b) => {
        // sonTarih'e göre sıralama (yerel tarih parse)
        const tarihA = yerelTarihAyristir(a.sonTarih).getTime();
        const tarihB = yerelTarihAyristir(b.sonTarih).getTime();
        return tarihA - tarihB;
      });
  }, [gorevler, durumFiltre, seciliDersFiltre]);

  // Hydration güvenliği için yükleniyor iskeleti
  if (!yuklendi) {
    return (
      <div className="space-y-6">
        <YukleniyorIskeleti baslik="Görevler yükleniyor..." adet={4} />
      </div>
    );
  }

  const handleYeniGorevAc = () => {
    setDuzenlenecekGorev(null);
    setFormAcik(true);
  };

  const handleDuzenleAc = (gorev: Gorev) => {
    setDuzenlenecekGorev(gorev);
    setFormAcik(true);
  };

  const handleFormKaydet = (girdi: YeniGorevGirdisi) => {
    if (duzenlenecekGorev) {
      gorevGuncelle(duzenlenecekGorev.id, girdi);
    } else {
      gorevEkle(girdi);
    }
    setFormAcik(false);
  };

  const handleSilOnayla = () => {
    if (silinecekGorev) {
      gorevSil(silinecekGorev.id);
      setSilinecekGorev(null);
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Üst Başlık ve Ekleme Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
            Görevler
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted">
            Ödevler, projeler ve sınav hazırlık görevleri takibi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleYeniGorevAc}
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:bg-accent-hover active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Görev Ekle</span>
          </button>
        </div>
      </div>

      {/* Eğer hiç ders yoksa kullanıcıya rehberlik kartı */}
      {dersler.length === 0 && (
        <div
          role="region"
          aria-label="Ders Bulunamadı Rehberliği"
          className="rounded-2xl border border-warning/30 bg-warning/5 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-sm sm:text-base text-main">
                Henüz kayıtlı dersiniz bulunmuyor
              </h2>
              <p className="text-xs sm:text-sm text-muted">
                Görev veya sınav ekleyebilmek için önce derslerinizi tanımlamanız gerekir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/dersler"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl bg-accent text-accent-foreground font-semibold text-xs sm:text-sm shadow-sm hover:bg-accent-hover transition-colors"
            >
              <span>Dersler Sayfasına Git</span>
              <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => ornekVerileriYukle()}
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded-xl border border-border bg-surface text-main font-semibold text-xs sm:text-sm hover:bg-surface-hover transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" aria-hidden="true" />
              Örnek Veri Yükle
            </button>
          </div>
        </div>
      )}

      {/* Filtre Barı (Durum ve Ders Seçimi) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-2xl bg-surface border border-border">
        {/* Durum Sekmeleri */}
        <div
          role="tablist"
          aria-label="Görev Durumu Filtresi"
          className="flex items-center gap-1 p-1 bg-surface-hover/80 rounded-xl overflow-x-auto max-w-full"
        >
          <button
            type="button"
            role="tab"
            aria-selected={durumFiltre === "tumu"}
            onClick={() => setDurumFiltre("tumu")}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent ${
              durumFiltre === "tumu"
                ? "bg-surface text-main shadow-2xs"
                : "text-muted hover:text-main"
            }`}
          >
            Tümü ({gorevler.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={durumFiltre === "bekleyen"}
            onClick={() => setDurumFiltre("bekleyen")}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent ${
              durumFiltre === "bekleyen"
                ? "bg-surface text-main shadow-2xs"
                : "text-muted hover:text-main"
            }`}
          >
            Bekleyen ({bekleyenSayisi})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={durumFiltre === "tamamlanan"}
            onClick={() => setDurumFiltre("tamamlanan")}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent ${
              durumFiltre === "tamamlanan"
                ? "bg-surface text-main shadow-2xs"
                : "text-muted hover:text-main"
            }`}
          >
            Tamamlanan ({tamamlananSayisi})
          </button>
        </div>

        {/* Ders Bazında Filtre */}
        <div className="flex items-center gap-2">
          <label htmlFor="ders-filtresi-select" className="text-xs font-medium text-muted shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ders:</span>
          </label>
          <select
            id="ders-filtresi-select"
            value={seciliDersFiltre}
            onChange={(e) => setSeciliDersFiltre(e.target.value)}
            className="min-h-[44px] px-3 py-2 rounded-xl border border-border bg-background text-main text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
          >
            <option value="tumu">Tüm Dersler</option>
            {dersler.map((ders) => (
              <option key={ders.id} value={ders.id}>
                {ders.ad} {ders.kod ? `(${ders.kod})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Görev Listesi veya Boş Durumlar */}
      {gorevler.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-surface/50 p-8 sm:p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto text-muted">
            <CheckSquare className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-main">
              Henüz eklenmiş bir görev bulunmuyor
            </h2>
            <p className="text-sm text-muted">
              Sınav, ödev veya projelerinizi ekleyerek teslim tarihlerini ve kalan günleri takip etmeye başlayın.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleYeniGorevAc}
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              İlk Görevini Ekle
            </button>

            {dersler.length === 0 && (
              <button
                type="button"
                onClick={() => ornekVerileriYukle()}
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl border border-border bg-surface text-main font-semibold text-sm hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
                Örnek Verileri Yükle
              </button>
            )}
          </div>
        </div>
      ) : filtrelenmisGorevler.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-3">
          <p className="text-base font-semibold text-main">
            Seçili filtrelerle eşleşen görev bulunamadı
          </p>
          <p className="text-xs text-muted">
            Filtre seçimlerini değiştirerek diğer görevlerinizi görüntüleyebilirsiniz.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setDurumFiltre("tumu");
                setSeciliDersFiltre("tumu");
              }}
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl border border-border bg-surface-hover text-xs font-semibold text-main hover:bg-border transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtrelenmisGorevler.map((gorev) => (
            <GorevKarti
              key={gorev.id}
              gorev={gorev}
              ders={dersMap.get(gorev.dersId)}
              onTamamlandiDegistir={gorevTamamlandiDegistir}
              onDuzenle={handleDuzenleAc}
              onSil={(g) => setSilinecekGorev(g)}
            />
          ))}
        </div>
      )}

      {/* Görev Ekleme / Düzenleme Modalı */}
      <GorevFormModal
        acik={formAcik}
        dersler={dersler}
        duzenlenecekGorev={duzenlenecekGorev}
        onKaydet={handleFormKaydet}
        onKapat={() => setFormAcik(false)}
      />

      {/* Görev Silme Onay Modalı */}
      <OnayModali
        acik={Boolean(silinecekGorev)}
        baslik="Görevi Sil"
        mesaj={
          silinecekGorev
            ? `"${silinecekGorev.baslik}" adlı görev kalıcı olarak silinecektir. Devam etmek istiyor musunuz?`
            : ""
        }
        onayButonMetni="Evet, Görevi Sil"
        iptalButonMetni="Vazgeç"
        tehlikeliMi={true}
        onOnay={handleSilOnayla}
        onKapat={() => setSilinecekGorev(null)}
      />
    </div>
  );
}
