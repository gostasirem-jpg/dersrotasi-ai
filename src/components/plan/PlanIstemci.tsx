"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Compass,
  Clock,
  Sparkles,
  AlertTriangle,
  BookOpen,
  CheckSquare,
  ArrowRight,
  Check,
  Trash2,
  ChevronDown,
  Info,
  CalendarDays,
  Plus,
  Minus,
} from "lucide-react";
import { useVeriDeposu } from "@/lib/store";
import type { Ders, Gorev } from "@/lib/types";
import { yerelTarihAyristir, yerelTarihDizgisi } from "@/lib/tarih";
import { tumOncelikleriHesapla } from "@/lib/oncelik";
import { YukleniyorIskeleti } from "@/components/YukleniyorIskeleti";

// Tarih dışarıdan değişmediği için abone olunacak bir şey yok.
// Fonksiyon bileşen dışında tanımlı ki her render'da yeniden oluşmasın.
const abonelikYok = () => () => {};

const HAFTANIN_GUNLERI = [
  { no: 1, kisa: "Pzt", uzun: "Pazartesi" },
  { no: 2, kisa: "Sal", uzun: "Salı" },
  { no: 3, kisa: "Çar", uzun: "Çarşamba" },
  { no: 4, kisa: "Per", uzun: "Perşembe" },
  { no: 5, kisa: "Cum", uzun: "Cuma" },
  { no: 6, kisa: "Cmt", uzun: "Cumartesi" },
  { no: 0, kisa: "Paz", uzun: "Pazar" },
];

function sureMetni(dakika: number): string {
  const sa = Math.floor(dakika / 60);
  const dk = dakika % 60;
  if (sa === 0) return `${dk} dk`;
  if (dk === 0) return `${sa} sa`;
  return `${sa} sa ${dk} dk`;
}

export function PlanIstemci() {
  const {
    dersler,
    gorevler,
    ayarlar,
    planBloklari,
    yuklendi,
    ayarlariGuncelle,
    planOlustur,
    blokGuncelle,
    blokSil,
    blokTamamla,
    blokTamamlamayiGeriAl,
    ornekVerileriYukle,
  } = useVeriDeposu();

  const [kapasiteUyarilari, setKapasiteUyarilari] = useState<string[]>([]);
  const [olusturulduBildirimi, setOlusturulduBildirimi] = useState(false);
  // Bugünün tarihi sadece tarayıcıda bilinir. Sunucuda null döner,
  // böylece sayfa önce yükleniyor iskeletini gösterir (hydration hatası olmaz).
  const bugunMetni = useSyncExternalStore(
    abonelikYok,
    () => new Date().toDateString(),
    () => null,
  );
  const bugunDate = useMemo(
    () => (bugunMetni ? new Date(bugunMetni) : null),
    [bugunMetni],
  );
  // Hızlı erişim için ders haritası
  const dersMap = useMemo(() => {
    const map = new Map<string, Ders>();
    dersler.forEach((d) => map.set(d.id, d));
    return map;
  }, [dersler]);

  // Hızlı erişim için görev haritası
  const gorevMap = useMemo(() => {
    const map = new Map<string, Gorev>();
    gorevler.forEach((g) => map.set(g.id, g));
    return map;
  }, [gorevler]);

  // Bugünden başlayan 7 günlük takvim listesi
  const gunler = useMemo(() => {
    if (!bugunDate) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const tarihStr = yerelTarihDizgisi(bugunDate, i);
      const tarihDate = yerelTarihAyristir(tarihStr);
      let baslik = "";
      if (i === 0) {
        baslik = "Bugün";
      } else if (i === 1) {
        baslik = "Yarın";
      } else {
        baslik = new Intl.DateTimeFormat("tr-TR", {
          day: "numeric",
          month: "long",
          weekday: "long",
        }).format(tarihDate);
      }
      return {
        tarihStr,
        tarihDate,
        baslik,
        haftaninGunu: tarihDate.getDay(),
      };
    });
  }, [bugunDate]);

  // 7 gün içinde kayıtlı plan bloğu var mı?
  const planMevcut = useMemo(() => {
    if (!bugunDate || gunler.length === 0) return false;
    const gunSet = new Set(gunler.map((g) => g.tarihStr));
    return planBloklari.some((b) => gunSet.has(b.tarih));
  }, [bugunDate, planBloklari, gunler]);

  // Öncelik hesaplaması (tamamlanmamış görevler)
  const oncelikListesi = useMemo(() => {
    if (!bugunDate) return [];
    return tumOncelikleriHesapla(gorevler, dersler, bugunDate);
  }, [bugunDate, gorevler, dersler]);

  // Plan oluşturma işleyicisi
  const handlePlanOlustur = () => {
    const sonuc = planOlustur();
    setKapasiteUyarilari(sonuc.kapasiteUyarilari);
    setOlusturulduBildirimi(true);
    setTimeout(() => setOlusturulduBildirimi(false), 3000);
  };

  // Çalışma gününü aç/kapat
  const handleGunTetikle = (gunNo: number) => {
    const simdiki = ayarlar.calismaGunleri || [];
    let yeni: number[];
    if (simdiki.includes(gunNo)) {
      if (simdiki.length === 1) {
        // En az bir çalışma günü kalmalı
        return;
      }
      yeni = simdiki.filter((g) => g !== gunNo);
    } else {
      yeni = [...simdiki, gunNo];
    }
    ayarlariGuncelle({ calismaGunleri: yeni });
  };

  // Günlük saat değişimi
  const handleSaatDegisimi = (yeniSaat: number) => {
    const sinirli = Math.max(0.5, Math.min(12, Math.round(yeniSaat * 2) / 2));
    ayarlariGuncelle({ gunlukSaat: sinirli });
  };

  if (!yuklendi || !bugunDate) {
    return (
      <div className="space-y-6">
        <YukleniyorIskeleti baslik="Çalışma planı yükleniyor..." adet={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Sayfa Başlığı */}
      <div className="border-b border-border pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
              Akıllı plan
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted">
              Ders zorlukları, sınav takvimi ve çalışma hedeflerine göre hazırlanmış 7 günlük çalışma rotası.
            </p>
          </div>
        </div>
      </div>

      {/* BOŞ DURUM 1: Hiç ders yoksa */}
      {dersler.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-surface/50 p-8 sm:p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto text-muted">
            <BookOpen className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-main">
              Önce derslerinizi eklemelisiniz
            </h2>
            <p className="text-sm text-muted">
              Akıllı çalışma planı oluşturabilmek için en az bir ders tanımlamış olmanız gerekir.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dersler"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:bg-accent-hover transition-colors"
            >
              <span>Dersler sayfasına git</span>
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => ornekVerileriYukle()}
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl border border-border bg-surface text-main font-semibold text-sm hover:bg-surface-hover transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
              <span>Örnek verileri yükle</span>
            </button>
          </div>
        </div>
      ) : gorevler.length === 0 ? (
        /* BOŞ DURUM 2: Ders var ama hiç görev yoksa */
        <div className="rounded-2xl border-2 border-dashed border-border bg-surface/50 p-8 sm:p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto text-muted">
            <CheckSquare className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-main">
              Önce görevlerinizi eklemelisiniz
            </h2>
            <p className="text-sm text-muted">
              Planlayıcının çalışma blokları oluşturabilmesi için sınav, ödev veya projelerinizi ekleyin.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/gorevler"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:bg-accent-hover transition-colors"
            >
              <span>Görevler sayfasına git</span>
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => ornekVerileriYukle()}
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl border border-border bg-surface text-main font-semibold text-sm hover:bg-surface-hover transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
              <span>Örnek verileri yükle</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* BÖLÜM 1: AYARLAR KARTI */}
          <section
            aria-labelledby="plan-ayarlari-baslik"
            className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 id="plan-ayarlari-baslik" className="text-lg font-bold text-main">
                  Planlama ayarları
                </h2>
                <p className="text-xs sm:text-sm text-muted">
                  Haftalık çalışma temposunu ve hedeflenen günlük süreyi belirleyin.
                </p>
              </div>

              {olusturulduBildirimi && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success/10 text-success text-xs font-semibold">
                  <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                  <span>Plan güncellendi</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Günlük Çalışma Süresi (0.5 - 12 saat) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="gunluk-saat-input" className="text-sm font-semibold text-main">
                    Günlük çalışma süresi
                  </label>
                  <span className="text-sm font-bold text-primary">
                    {ayarlar.gunlukSaat} saat ({ayarlar.gunlukSaat * 60} dakika)
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    id="gunluk-saat-slider"
                    type="range"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={ayarlar.gunlukSaat}
                    onChange={(e) => handleSaatDegisimi(parseFloat(e.target.value))}
                    aria-label="Günlük çalışma süresi kaydırıcısı"
                    className="flex-1 accent-primary h-2 bg-surface-hover rounded-lg cursor-pointer"
                  />
                  <input
                    id="gunluk-saat-input"
                    type="number"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={ayarlar.gunlukSaat}
                    onChange={(e) => handleSaatDegisimi(parseFloat(e.target.value) || 0.5)}
                    className="w-20 min-h-[44px] px-2.5 py-1.5 text-center rounded-xl border border-border bg-background text-main text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <p className="text-xs text-muted">
                  0.5 ile 12 saat arasında, 30 dakikalık adımlarla belirleyebilirsiniz.
                </p>
              </div>

              {/* Çalışma Günleri Seçimi */}
              <div className="space-y-3">
                <span id="calisma-gunleri-etiket" className="block text-sm font-semibold text-main">
                  Çalışma günleri
                </span>

                <div
                  role="group"
                  aria-labelledby="calisma-gunleri-etiket"
                  className="grid grid-cols-7 gap-1.5 sm:gap-2"
                >
                  {HAFTANIN_GUNLERI.map((gun) => {
                    const aktif = (ayarlar.calismaGunleri || []).includes(gun.no);
                    return (
                      <button
                        key={gun.no}
                        type="button"
                        onClick={() => handleGunTetikle(gun.no)}
                        aria-pressed={aktif}
                        aria-label={`${gun.uzun} gününü ${aktif ? "dinlenme yap" : "çalışma günü yap"}`}
                        className={`min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          aktif
                            ? "bg-accent text-accent-foreground shadow-xs"
                            : "bg-surface-hover text-muted hover:text-main border border-border"
                        }`}
                      >
                        {gun.kisa}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted">
                  Aktif seçilen günlere çalışma blokları atanır; diğer günler dinlenme günü kalır.
                </p>
              </div>
            </div>

            {/* Plan Oluştur Butonu */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border">
              <div className="text-xs text-muted">
                {planMevcut ? (
                  <span>Tamamlanmış bloklar ve geçmiş günler korunarak yeni bloklar üretilir.</span>
                ) : (
                  <span>Öncelik algoritması bugünden başlayarak 7 günlük programınızı oluşturur.</span>
                )}
              </div>

              <button
                type="button"
                onClick={handlePlanOlustur}
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:bg-accent-hover active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Compass className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>{planMevcut ? "Planı yeniden oluştur" : "Planımı oluştur"}</span>
              </button>
            </div>
          </section>

          {/* BÖLÜM 4: KAPASİTE UYARILARI (Varsa sarı uyarı kartı) */}
          {kapasiteUyarilari.length > 0 && (
            <div
              role="alert"
              className="rounded-2xl border border-warning/40 bg-warning/10 p-4 sm:p-5 text-main space-y-2.5"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base text-main">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0" aria-hidden="true" />
                <span>Kapasite uyarıları</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-muted pl-7 list-disc">
                {kapasiteUyarilari.map((uyari, index) => (
                  <li key={index} className="leading-relaxed">
                    {uyari}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* İki Kolonlu Düzen: Masaüstünde Öncelik Sıralaması ve Program Yan Yana / Alt Alta */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* SOL KOLON: ÖNCELİK SIRALAMASI VE NASIL HESAPLANIYOR (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* BÖLÜM 2: ÖNCELİK SIRALAMASI */}
              <section
                aria-labelledby="oncelik-siralamasi-baslik"
                className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div>
                    <h2 id="oncelik-siralamasi-baslik" className="text-lg font-bold text-main">
                      Öncelik sıralaması
                    </h2>
                    <p className="text-xs text-muted">
                      Tamamlanmamış {oncelikListesi.length} görev öncelik puanına göre dizilmiştir.
                    </p>
                  </div>
                </div>

                {oncelikListesi.length === 0 ? (
                  <p className="text-sm text-muted py-4 text-center">
                    Tüm görevler tamamlandı veya bekleyen görev bulunmuyor.
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {oncelikListesi.map((item, index) => {
                      const gorev = gorevMap.get(item.gorevId);
                      if (!gorev) return null;
                      const ders = dersMap.get(gorev.dersId);
                      const renk = ders?.renk || "#3b82f6";

                      return (
                        <article
                          key={item.gorevId}
                          className="p-3.5 rounded-xl border border-border bg-surface-hover/50 hover:bg-surface-hover transition-colors space-y-2.5"
                          style={{ borderLeftColor: renk, borderLeftWidth: "4px" }}
                        >
                          {/* Üst Satır: Sıra No + Başlık + Toplam Puan */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-border text-[11px] font-bold text-muted">
                                  {index + 1}
                                </span>
                                {ders && (
                                  <span
                                    className="text-xs font-semibold truncate max-w-[150px]"
                                    style={{ color: renk }}
                                  >
                                    {ders.ad}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-bold text-main break-words">
                                {gorev.baslik}
                              </h3>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-xl font-extrabold text-main leading-none">
                                {item.toplam}
                              </div>
                              <span className="text-[10px] uppercase font-semibold text-muted">
                                Puan
                              </span>
                            </div>
                          </div>

                          {/* Puanın 3 Parçasını Gösteren Yatay Yığılmış Çubuk */}
                          <div className="space-y-1">
                            <div
                              className="w-full h-2 rounded-full bg-surface overflow-hidden flex"
                              role="progressbar"
                              aria-label={`Öncelik dağılımı: Zorluk ${item.zorlukPuani}, Aciliyet ${item.aciliyetPuani}, Tür ${item.turPuani}`}
                              aria-valuenow={item.toplam}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                style={{ width: `${item.zorlukPuani}%` }}
                                className="bg-blue-500 h-full transition-all"
                                title={`Zorluk: ${item.zorlukPuani} puan`}
                              />
                              <div
                                style={{ width: `${item.aciliyetPuani}%` }}
                                className="bg-amber-500 h-full transition-all"
                                title={`Aciliyet: ${item.aciliyetPuani} puan`}
                              />
                              <div
                                style={{ width: `${item.turPuani}%` }}
                                className="bg-purple-500 h-full transition-all"
                                title={`Tür: ${item.turPuani} puan`}
                              />
                            </div>

                            {/* Çubuk Açıklama Rozetleri */}
                            <div className="flex items-center justify-between text-[11px] text-muted">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                                Zorluk: {item.zorlukPuani}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                                Aciliyet: {item.aciliyetPuani}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                                Tür: {item.turPuani}
                              </span>
                            </div>
                          </div>

                          {/* Gerekçe Etiketleri */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {item.gerekce.map((gerekceMetni, gIndex) => (
                              <span
                                key={gIndex}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface border border-border text-muted"
                              >
                                {gerekceMetni}
                              </span>
                            ))}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* BÖLÜM 3: NASIL HESAPLANIYOR? AÇILIR BÖLÜMÜ */}
              <details className="group rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs transition-colors">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-sm sm:text-base text-main list-none select-none">
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span>Nasıl hesaplanıyor?</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>

                <div className="mt-4 pt-4 border-t border-border space-y-3 text-xs sm:text-sm text-muted leading-relaxed">
                  <p>
                    <strong className="text-main font-semibold">Bu plan kural tabanlı bir öncelik algoritmasıyla oluşturulur; yapay zekâ kullanılmaz.</strong>
                  </p>

                  <div className="space-y-1.5">
                    <p className="font-semibold text-main">Öncelik Puanı Formülü (0-100 Puan):</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong className="text-main">Zorluk Puanı (en fazla 30 puan):</strong> (Ders zorluğu / 5) * 30.
                      </li>
                      <li>
                        <strong className="text-main">Aciliyet Puanı (en fazla 50 puan):</strong> Kalan gün 14 günden azaldıkça artar. Gecikmiş görevlerde tam 50 puandır.
                      </li>
                      <li>
                        <strong className="text-main">Görev Türü Puanı (en fazla 20 puan):</strong> Sınavlar 20 puan (ağırlık 1.0), projeler 16 puan (0.8), ödevler 12 puan (0.6), quizler 10 puan (0.5).
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-hover border border-border text-xs">
                    <span className="font-bold text-main block mb-1">Hesaplama Örneği:</span>
                    <span>
                      Ders zorluğu 4 olan bir dersin 3 gün sonraki sınavı için:
                      <br />
                      Zorluk: (4 / 5) * 30 = <strong>24 puan</strong>
                      <br />
                      Aciliyet: (1 - 3 / 14) * 50 = <strong>39.3 puan</strong>
                      <br />
                      Tür: Sınav ağırlığı 1.0 * 20 = <strong>20 puan</strong>
                      <br />
                      Toplam: 24 + 39.3 + 20 ≈ <strong>83 puan</strong>
                    </span>
                  </div>
                </div>
              </details>
            </div>

            {/* SAĞ KOLON: 7 GÜNLÜK PROGRAM (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-lg font-bold text-main flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" aria-hidden="true" />
                    <span>7 günlük çalışma programı</span>
                  </h2>
                  <p className="text-xs text-muted">
                    Günlük hedeflere göre dağıtılan çalışma blokları ve işlem kontrolleri.
                  </p>
                </div>
              </div>

              {!planMevcut ? (
                /* Plan Henüz Yoksa Çağrı Kartı */
                <div className="rounded-2xl border-2 border-dashed border-border bg-surface p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Compass className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-main">
                      Henüz bir çalışma planı oluşturmadınız
                    </h3>
                    <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto">
                      Yukarıdaki ayarlardan günlük hedefinizi belirleyin ve &quot;Planımı oluştur&quot; butonuna tıklayarak haftalık programınızı çıkarın.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePlanOlustur}
                    className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:bg-accent-hover transition-colors"
                  >
                    <Compass className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span>Planımı oluştur</span>
                  </button>
                </div>
              ) : (
                /* 7 Günlük Kartlar */
                <div className="space-y-4">
                  {gunler.map((gun) => {
                    const calismaGunuMu = (ayarlar.calismaGunleri || []).includes(gun.haftaninGunu);
                    const gunBloklari = planBloklari.filter((b) => b.tarih === gun.tarihStr);
                    const gunToplamDakika = gunBloklari.reduce((sum, b) => sum + b.dakika, 0);
                    const gunHedefDakika = calismaGunuMu ? ayarlar.gunlukSaat * 60 : 0;

                    return (
                      <div
                        key={gun.tarihStr}
                        className={`rounded-2xl border transition-all p-4 sm:p-5 space-y-3.5 ${
                          !calismaGunuMu
                            ? "border-border/60 bg-surface/40 opacity-70"
                            : "border-border bg-surface shadow-2xs"
                        }`}
                      >
                        {/* Gün Başlığı ve Hedef Göstergesi */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-main">
                              {gun.baslik}
                            </h3>
                            <span className="text-xs text-muted">
                              ({gun.tarihStr})
                            </span>
                          </div>

                          <div className="text-xs font-semibold">
                            {!calismaGunuMu ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-hover text-muted border border-border">
                                Dinlenme günü
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full ${
                                  gunToplamDakika >= gunHedefDakika
                                    ? "bg-success/10 text-success"
                                    : "bg-primary/10 text-primary"
                                }`}
                              >
                                {sureMetni(gunToplamDakika)} / {sureMetni(gunHedefDakika)} hedef
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Günün Blokları veya Dinlenme Durumu */}
                        {!calismaGunuMu ? (
                          <p className="text-xs sm:text-sm text-muted italic py-1">
                            Bu gün için çalışma planlanmadı (Dinlenme günü).
                          </p>
                        ) : gunBloklari.length === 0 ? (
                          <p className="text-xs text-muted italic py-1">
                            Bu gün için atanmış bir çalışma bloğu bulunmuyor.
                          </p>
                        ) : (
                          <div className="space-y-2.5">
                            {gunBloklari.map((blok) => {
                              const ders = dersMap.get(blok.dersId);
                              const gorev = blok.gorevId ? gorevMap.get(blok.gorevId) : undefined;
                              const renk = ders?.renk || "#3b82f6";

                              return (
                                <div
                                  key={blok.id}
                                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                    blok.tamamlandi
                                      ? "bg-surface-hover/80 border-border opacity-70"
                                      : "bg-surface border-border hover:border-text-muted/40 shadow-xs"
                                  }`}
                                  style={{
                                    borderLeftColor: renk,
                                    borderLeftWidth: "4px",
                                  }}
                                >
                                  {/* Blok Bilgisi & Tamamlandı Butonu */}
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {/* Tamamlandı Onay Kutusu */}
                                    <button
                                      type="button"
                                      role="checkbox"
                                      aria-checked={blok.tamamlandi}
                                      aria-label={`${gorev?.baslik || ders?.ad || "Bloğu"} ${
                                        blok.tamamlandi ? "tamamlanmadı yap" : "tamamlandı yap"
                                      }`}
                                      onClick={() => {
                                        if (blok.tamamlandi) {
                                          blokTamamlamayiGeriAl(blok.id);
                                        } else {
                                          blokTamamla(blok.id);
                                        }
                                      }}
                                      className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                        blok.tamamlandi ? "text-success" : "text-muted hover:text-main"
                                      }`}
                                    >
                                      <div
                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                                          blok.tamamlandi
                                            ? "bg-success border-success text-white"
                                            : "border-border bg-background hover:border-primary"
                                        }`}
                                      >
                                        {blok.tamamlandi && (
                                          <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                                        )}
                                      </div>
                                    </button>

                                    {/* Ders Adı ve Görev Başlığı */}
                                    <div className="space-y-0.5 min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                          className="text-xs font-bold truncate max-w-[150px]"
                                          style={{ color: renk }}
                                        >
                                          {ders?.ad || "Bilinmeyen Ders"}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-hover text-muted">
                                          <Clock className="w-3 h-3" aria-hidden="true" />
                                          <span>{blok.dakika} dk</span>
                                        </span>
                                      </div>
                                      <p
                                        className={`text-sm font-semibold text-main break-words ${
                                          blok.tamamlandi ? "line-through text-muted" : ""
                                        }`}
                                      >
                                        {gorev?.baslik || "Genel Çalışma"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Blok İşlemleri: Süre Değiştir (-5/+5), Başka Güne Taşı, Sil */}
                                  <div className="flex items-center gap-2 flex-wrap justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                                    {/* Süre Değiştir Butonları (-5 dk / +5 dk) */}
                                    <div className="flex items-center rounded-xl border border-border bg-background p-0.5">
                                      <button
                                        type="button"
                                        disabled={blok.dakika <= 5}
                                        onClick={() =>
                                          blokGuncelle(blok.id, {
                                            dakika: Math.max(5, blok.dakika - 5),
                                          })
                                        }
                                        aria-label="Süreyi 5 dakika azalt"
                                        className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg text-muted hover:text-main disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                      >
                                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                                      </button>
                                      <span className="text-xs font-semibold px-2 min-w-[44px] text-center text-main">
                                        {blok.dakika} dk
                                      </span>
                                      <button
                                        type="button"
                                        disabled={blok.dakika >= 120}
                                        onClick={() =>
                                          blokGuncelle(blok.id, {
                                            dakika: Math.min(120, blok.dakika + 5),
                                          })
                                        }
                                        aria-label="Süreyi 5 dakika artır"
                                        className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg text-muted hover:text-main disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                      >
                                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                      </button>
                                    </div>

                                    {/* Başka Güne Taşı Dropdown */}
                                    <label htmlFor={`tasi-select-${blok.id}`} className="sr-only">
                                      Bloğu başka güne taşı
                                    </label>
                                    <select
                                      id={`tasi-select-${blok.id}`}
                                      value={blok.tarih}
                                      onChange={(e) =>
                                        blokGuncelle(blok.id, { tarih: e.target.value })
                                      }
                                      aria-label="Bloğu başka güne taşı"
                                      className="min-h-[44px] px-2.5 py-1.5 rounded-xl border border-border bg-background text-main text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                      {gunler.map((g) => (
                                        <option key={g.tarihStr} value={g.tarihStr}>
                                          {g.baslik} ({g.tarihStr.slice(5)})
                                        </option>
                                      ))}
                                    </select>

                                    {/* Sil Butonu */}
                                    <button
                                      type="button"
                                      onClick={() => blokSil(blok.id)}
                                      aria-label="Bloğu sil"
                                      className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-muted hover:text-danger hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
