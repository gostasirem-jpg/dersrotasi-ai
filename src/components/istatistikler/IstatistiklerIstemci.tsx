"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  BarChart2,
  BookOpen,
  CheckSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useVeriDeposu } from "@/lib/store";
import { yerelTarihDizgisi } from "@/lib/tarih";
import { YukleniyorIskeleti } from "@/components/YukleniyorIskeleti";
import {
  haftalikCalismaHesapla,
  derseGoreSureHesapla,
  gorevOzetiHesapla,
  planUyumuHesapla,
} from "@/lib/istatistik";

// Tarih tarayıcıda bilinir, sunucuda null döner → hydration hatası olmaz
const abonelikYok = () => () => {};

function sureMetni(dakika: number): string {
  const sa = Math.floor(dakika / 60);
  const dk = dakika % 60;
  if (sa === 0) return `${dk} dk`;
  if (dk === 0) return `${sa} sa`;
  return `${sa} sa ${dk} dk`;
}

const GOREV_TURU_METINLERI: Record<string, string> = {
  sinav: "Sınav",
  odev: "Ödev",
  proje: "Proje",
  quiz: "Quiz",
};

const GOREV_TURU_RENKLERI: Record<string, string> = {
  sinav: "#ef4444",
  odev: "#3b82f6",
  proje: "#8b5cf6",
  quiz: "#f59e0b",
};

/**
 * HTML + Tailwind sütun grafiği (SVG viewBox ölçekleme sorunu olmaz).
 * Grafik yüksekliği: mobilde 180px, masaüstünde 220px (Tailwind ile).
 */
function HaftalikGrafik({
  gunler,
}: {
  gunler: Array<{ tarih: string; kisaAd: string; dakika: number; bugunMu: boolean }>;
}) {
  const maxDakika = Math.max(...gunler.map((g) => g.dakika), 1);
  const toplamDakika = gunler.reduce((s, g) => s + g.dakika, 0);

  return (
    <div
      className="space-y-1"
      aria-label={`Son 7 günlük çalışma süresi grafiği. Toplam: ${sureMetni(toplamDakika)}`}
    >
      {/* Grafik alanı: sütunlar + değer etiketleri */}
      <div
        className="flex items-end gap-1.5 h-[180px] sm:h-[220px] w-full"
        aria-hidden="true"
      >
        {gunler.map((gun) => {
          const oranYuzde = (gun.dakika / maxDakika) * 100;
          // Veri varsa minimum görünür yükseklik 4px
          const cubukYuzde = gun.dakika > 0 ? Math.max(oranYuzde, 2) : 0;
          const etiket =
            gun.dakika === 0
              ? ""
              : gun.dakika < 60
              ? `${gun.dakika}dk`
              : `${Math.floor(gun.dakika / 60)}s${gun.dakika % 60 > 0 ? ` ${gun.dakika % 60}dk` : ""}`;

          return (
            <div
              key={gun.tarih}
              className="flex-1 flex flex-col items-center justify-end h-full gap-0.5"
            >
              {/* Dakika değeri etiketi (sütunun hemen üstü) */}
              <span className="text-[10px] sm:text-xs font-medium text-muted leading-none mb-0.5 h-4 flex items-end justify-center">
                {etiket}
              </span>

              {/* Sütun */}
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${cubukYuzde}%`,
                  backgroundColor: gun.bugunMu
                    ? "var(--color-accent, #3b82f6)"
                    : "var(--color-border, #d1d5db)",
                  opacity: gun.bugunMu ? 1 : 0.7,
                  minHeight: gun.dakika > 0 ? "4px" : "0px",
                }}
                title={`${gun.kisaAd}: ${gun.dakika > 0 ? sureMetni(gun.dakika) : "Çalışma yok"}`}
              />
            </div>
          );
        })}
      </div>

      {/* Gün etiketleri — grafik alanının dışında, normal HTML metin boyutunda */}
      <div className="flex gap-1.5" aria-hidden="true">
        {gunler.map((gun) => (
          <div key={gun.tarih} className="flex-1 text-center">
            <span
              className={`text-xs leading-none ${
                gun.bugunMu
                  ? "font-bold text-main"
                  : "font-medium text-muted"
              }`}
            >
              {gun.kisaAd}
            </span>
          </div>
        ))}
      </div>

      {/* Ekran okuyucu için görünmez tablo */}
      <table className="sr-only">
        <caption>Son 7 günlük çalışma süresi</caption>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Gün</th>
            <th>Çalışma Süresi</th>
          </tr>
        </thead>
        <tbody>
          {gunler.map((gun) => (
            <tr key={gun.tarih}>
              <td>{gun.tarih}</td>
              <td>
                {gun.kisaAd}
                {gun.bugunMu ? " (bugün)" : ""}
              </td>
              <td>{gun.dakika > 0 ? sureMetni(gun.dakika) : "Çalışma yok"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IstatistiklerIstemci() {
  const { dersler, gorevler, planBloklari, oturumlar, yuklendi } =
    useVeriDeposu();

  // Bugünün tarihi sadece tarayıcıda bilinir
  const bugunMetni = useSyncExternalStore(
    abonelikYok,
    () => new Date().toDateString(),
    () => null
  );

  const bugunStr = useMemo(() => {
    if (!bugunMetni) return null;
    const d = new Date(bugunMetni);
    return yerelTarihDizgisi(d, 0);
  }, [bugunMetni]);

  const haftalikCalisma = useMemo(
    () => (bugunStr ? haftalikCalismaHesapla(oturumlar, bugunStr) : null),
    [oturumlar, bugunStr]
  );

  const derseSure = useMemo(
    () => (bugunStr ? derseGoreSureHesapla(oturumlar, dersler, bugunStr) : []),
    [oturumlar, dersler, bugunStr]
  );

  const gorevOzeti = useMemo(
    () => (bugunStr ? gorevOzetiHesapla(gorevler, bugunStr) : null),
    [gorevler, bugunStr]
  );

  const planUyumu = useMemo(
    () => (bugunStr ? planUyumuHesapla(planBloklari, bugunStr) : null),
    [planBloklari, bugunStr]
  );

  // Yükleniyor durumu
  if (!yuklendi || !bugunStr) {
    return (
      <div className="space-y-6">
        <YukleniyorIskeleti baslik="İstatistikler yükleniyor..." adet={3} />
      </div>
    );
  }

  // BOŞ DURUM: Hiç oturum yoksa
  const hicOturumYok = oturumlar.length === 0;

  return (
    <div className="space-y-6">
      {/* SAYFA BAŞLIĞI */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
          İstatistikler
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted">
          Çalışma sürelerinizi ve tamamlanan görevlerinizi inceleyin.
        </p>
      </div>

      {/* 3 ÖZET KARTI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Bu hafta toplam çalışma */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Bu hafta çalışma
            </span>
          </div>
          <p className="text-2xl font-extrabold text-main">
            {sureMetni(haftalikCalisma?.toplamDakika ?? 0)}
          </p>
          <p className="text-xs text-muted">son 7 günde toplam</p>
        </div>

        {/* Tamamlanan görevler */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <CheckSquare className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Tamamlanan
            </span>
          </div>
          <p className="text-2xl font-extrabold text-main">
            {gorevOzeti?.tamamlanan ?? 0}
            <span className="text-sm font-normal text-muted ml-1">
              / {gorevOzeti?.toplam ?? 0} görev
            </span>
          </p>
          <p className="text-xs text-muted">toplam görevler arasında</p>
        </div>

        {/* Plan uyumu */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <BarChart2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Plan uyumu
            </span>
          </div>
          <p className="text-2xl font-extrabold text-main">
            %{planUyumu?.yuzde ?? 0}
          </p>
          <p className="text-xs text-muted">
            {planUyumu && planUyumu.planlananDakika > 0
              ? `${sureMetni(planUyumu.tamamlananDakika)} / ${sureMetni(planUyumu.planlananDakika)} planlanan`
              : "Henüz plan kaydı yok"}
          </p>
        </div>
      </div>

      {/* SON 7 GÜN GRAFİĞİ */}
      <section
        aria-labelledby="haftalik-grafik-baslik"
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4"
      >
        <h2 id="haftalik-grafik-baslik" className="text-base font-bold text-main">
          Son 7 gün
        </h2>

        {hicOturumYok ? (
          <div className="py-8 text-center space-y-3">
            <BarChart2 className="w-10 h-10 text-muted mx-auto" aria-hidden="true" />
            <p className="text-sm text-muted max-w-sm mx-auto">
              Henüz çalışma kaydı yok. Plan sayfasında blokları &quot;Tamamladım&quot;
              olarak işaretledikçe istatistiklerin burada oluşacak.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors"
            >
              Plan sayfasına git
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          haftalikCalisma && <HaftalikGrafik gunler={haftalikCalisma.gunler} />
        )}
      </section>

      {/* DERSLERE AYRILAN ZAMAN */}
      <section
        aria-labelledby="ders-sure-baslik"
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4"
      >
        <h2 id="ders-sure-baslik" className="text-base font-bold text-main">
          Derslere ayrılan zaman{" "}
          <span className="text-xs font-normal text-muted">(son 7 gün)</span>
        </h2>

        {derseSure.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-muted mx-auto" aria-hidden="true" />
            <p className="text-sm text-muted">
              Son 7 günde hiçbir derse çalışma kaydedilmedi.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Derslere ayrılan zaman listesi">
            {derseSure.map((bilgi) => (
              <li key={bilgi.dersId} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: bilgi.dersRenk }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-main truncate">
                      {bilgi.dersAd}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-muted">%{bilgi.yuzde}</span>
                    <span className="text-sm font-bold text-main">
                      {sureMetni(bilgi.dakika)}
                    </span>
                  </div>
                </div>
                {/* Yatay ilerleme çubuğu */}
                <div
                  className="w-full h-2.5 rounded-full bg-surface-hover overflow-hidden"
                  role="progressbar"
                  aria-valuenow={bilgi.yuzde}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${bilgi.dersAd}: %${bilgi.yuzde}`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${bilgi.yuzde}%`,
                      backgroundColor: bilgi.dersRenk,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* GÖREV TÜRLERİ */}
      {gorevOzeti && gorevOzeti.toplam > 0 && (
        <section
          aria-labelledby="gorev-turleri-baslik"
          className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4"
        >
          <h2 id="gorev-turleri-baslik" className="text-base font-bold text-main">
            Görev türleri
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["sinav", "odev", "proje", "quiz"] as const).map((tur) => {
              const veri = gorevOzeti.tureDagilimlari[tur];
              const yuzde =
                veri.toplam === 0
                  ? 0
                  : Math.round((veri.tamamlanan / veri.toplam) * 100);
              const renk = GOREV_TURU_RENKLERI[tur];

              return (
                <div
                  key={tur}
                  className="rounded-xl border border-border p-4 space-y-2"
                  style={{ borderTopColor: renk, borderTopWidth: "3px" }}
                >
                  <p className="text-xs font-semibold text-muted">
                    {GOREV_TURU_METINLERI[tur]}
                  </p>
                  <p className="text-xl font-extrabold text-main">
                    {veri.tamamlanan}
                    <span className="text-sm font-normal text-muted">
                      {" "}/ {veri.toplam}
                    </span>
                  </p>
                  <div
                    className="w-full h-1.5 rounded-full bg-surface-hover overflow-hidden"
                    role="progressbar"
                    aria-valuenow={yuzde}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${GOREV_TURU_METINLERI[tur]}: %${yuzde} tamamlandı`}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${yuzde}%`, backgroundColor: renk }}
                    />
                  </div>
                  <p className="text-xs text-muted">%{yuzde} tamamlandı</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Görev istatistikleri yok ama ders var */}
      {gorevOzeti && gorevOzeti.toplam === 0 && (
        <section className="rounded-2xl border-2 border-dashed border-border bg-surface/50 p-8 text-center space-y-3">
          <CheckSquare className="w-10 h-10 text-muted mx-auto" aria-hidden="true" />
          <p className="text-sm text-muted">
            Henüz görev eklenmemiş. Görevler sayfasından sınav, ödev veya projelerini ekle.
          </p>
          <Link
            href="/gorevler"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors"
          >
            Görevler sayfasına git
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      )}
    </div>
  );
}
