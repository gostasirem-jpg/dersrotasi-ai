"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckSquare,
  Clock,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Check,
  Trophy,
} from "lucide-react";
import { useVeriDeposu } from "@/lib/store";
import { yerelTarihDizgisi } from "@/lib/tarih";
import { YukleniyorIskeleti } from "@/components/YukleniyorIskeleti";
import {
  bugunkuHedefHesapla,
  haftalikCalismaHesapla,
  dersIlerlemesiHesapla,
  yaklasanlariHesapla,
  gorevOzetiHesapla,
  enYakinSinavBul,
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

function kalanGunEtiketi(kalanGun: number): string {
  if (kalanGun < 0) return `${Math.abs(kalanGun)} gün geçti`;
  if (kalanGun === 0) return "Bugün";
  if (kalanGun === 1) return "Yarın";
  return `${kalanGun} gün kaldı`;
}

function kalanGunRenk(kalanGun: number): string {
  if (kalanGun < 0) return "bg-error/10 text-error";
  if (kalanGun <= 2) return "bg-warning/10 text-warning";
  if (kalanGun <= 7) return "bg-primary/10 text-primary";
  return "bg-surface-hover text-muted";
}

/** İlerleme çubuğu */
function IlerlemeCubugu({
  yuzde,
  renk,
  kalın = false,
}: {
  yuzde: number;
  renk?: string;
  kalın?: boolean;
}) {
  const h = kalın ? "h-3" : "h-2";
  return (
    <div
      className={`w-full ${h} rounded-full bg-surface-hover overflow-hidden`}
      role="progressbar"
      aria-valuenow={yuzde}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`İlerleme: %${yuzde}`}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, yuzde)}%`,
          backgroundColor: renk ?? "var(--color-accent)",
        }}
      />
    </div>
  );
}

export function PanelIstemci() {
  const {
    dersler,
    gorevler,
    planBloklari,
    oturumlar,
    yuklendi,
    blokTamamla,
    blokTamamlamayiGeriAl,
    ornekVerileriYukle,
  } = useVeriDeposu();

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

  // Türkçe tarih başlığı: "29 Ekim 2026, Perşembe"
  const tarihBasligi = useMemo(() => {
    if (!bugunMetni) return "";
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    }).format(new Date(bugunMetni));
  }, [bugunMetni]);

  // İstatistikler
  const bugunkuHedef = useMemo(
    () => (bugunStr ? bugunkuHedefHesapla(planBloklari, bugunStr) : null),
    [planBloklari, bugunStr]
  );

  const haftalikCalisma = useMemo(
    () => (bugunStr ? haftalikCalismaHesapla(oturumlar, bugunStr) : null),
    [oturumlar, bugunStr]
  );

  const gorevOzeti = useMemo(
    () => (bugunStr ? gorevOzetiHesapla(gorevler, bugunStr) : null),
    [gorevler, bugunStr]
  );

  const dersIlerlemesi = useMemo(
    () => dersIlerlemesiHesapla(gorevler, dersler),
    [gorevler, dersler]
  );

  const yaklasanlar = useMemo(
    () => (bugunStr ? yaklasanlariHesapla(gorevler, dersler, bugunStr) : []),
    [gorevler, dersler, bugunStr]
  );

  const enYakinSinav = useMemo(
    () => (bugunStr ? enYakinSinavBul(gorevler, dersler, bugunStr) : null),
    [gorevler, dersler, bugunStr]
  );

  // Bugünün plan blokları
  const bugunBloklari = useMemo(
    () => (bugunStr ? planBloklari.filter((b) => b.tarih === bugunStr) : []),
    [planBloklari, bugunStr]
  );

  // Ders haritası (hızlı erişim için)
  const dersMap = useMemo(
    () => new Map(dersler.map((d) => [d.id, d])),
    [dersler]
  );
  const gorevMap = useMemo(
    () => new Map(gorevler.map((g) => [g.id, g])),
    [gorevler]
  );

  // Yükleniyor durumu
  if (!yuklendi || !bugunStr) {
    return (
      <div className="space-y-6">
        <YukleniyorIskeleti baslik="Panel yükleniyor..." adet={4} />
      </div>
    );
  }

  // BOŞ DURUM: Hiç ders yoksa
  if (dersler.length === 0) {
    return (
      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
            Panel
          </h1>
          <p className="mt-1 text-sm text-muted">{tarihBasligi}</p>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-border bg-surface/50 p-8 sm:p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto text-muted">
            <BookOpen className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-main">
              Hoş geldin! İlk dersini ekle
            </h2>
            <p className="text-sm text-muted">
              Paneli kullanabilmek için önce en az bir ders eklemelisin.
              Derslerini ekledikten sonra görev ve plan oluşturabilirsin.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dersler"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:bg-accent-hover transition-colors"
            >
              <span>İlk dersini ekle</span>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SAYFA BAŞLIĞI */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
          Bugün
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted">{tarihBasligi}</p>
      </div>

      {/* 4 ÖZET KARTI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Bugünkü Hedef */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Bugünkü hedef
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {bugunkuHedef && bugunkuHedef.planlananDakika > 0 ? (
            <>
              <div>
                <p className="text-2xl font-extrabold text-main leading-none">
                  {sureMetni(bugunkuHedef.tamamlananDakika)}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  / {sureMetni(bugunkuHedef.planlananDakika)} planlandı
                </p>
              </div>
              <IlerlemeCubugu yuzde={bugunkuHedef.yuzde} kalın />
              <p className="text-xs font-semibold text-muted">
                %{bugunkuHedef.yuzde} tamamlandı
              </p>
            </>
          ) : (
            <div className="pt-1">
              <p className="text-sm text-muted">Bugün için plan yok</p>
              <Link
                href="/plan"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Plan oluştur
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* 2. Bekleyen Görevler */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Bekleyen görevler
            </span>
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <CheckSquare className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          <p className="text-2xl font-extrabold text-main leading-none">
            {gorevOzeti?.bekleyen ?? 0}
          </p>

          {(gorevOzeti?.gecikmiş ?? 0) > 0 ? (
            <p className="text-xs font-semibold text-error flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {gorevOzeti!.gecikmiş} görev gecikmiş
            </p>
          ) : (
            <p className="text-xs text-muted">Gecikmiş görev yok</p>
          )}
        </div>

        {/* 3. En Yakın Sınav */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              En yakın sınav
            </span>
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center text-error">
              <CalendarDays className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {enYakinSinav ? (
            <>
              <div>
                <p
                  className="text-base font-bold text-main leading-tight truncate"
                  title={enYakinSinav.gorev.baslik}
                >
                  {enYakinSinav.gorev.baslik}
                </p>
                <p className="text-xs text-muted mt-0.5">{enYakinSinav.dersAd}</p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${kalanGunRenk(enYakinSinav.kalanGun)}`}
              >
                {kalanGunEtiketi(enYakinSinav.kalanGun)}
              </span>
            </>
          ) : (
            <p className="text-sm text-muted pt-1">Yaklaşan sınav yok</p>
          )}
        </div>

        {/* 4. Bu Hafta Çalışılan Süre */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Bu hafta
            </span>
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          <p className="text-2xl font-extrabold text-main leading-none">
            {sureMetni(haftalikCalisma?.toplamDakika ?? 0)}
          </p>

          <p className="text-xs text-muted">
            son 7 günde çalışıldı
          </p>
        </div>
      </div>

      {/* İKİ KOLON DÜZENİ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOL: Bugünün Planı */}
        <section
          aria-labelledby="bugun-plani-baslik"
          className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 id="bugun-plani-baslik" className="text-base font-bold text-main">
              Bugünün planı
            </h2>
            <Link
              href="/plan"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Tümü
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {bugunBloklari.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-muted">Bugün için plan yok.</p>
              <Link
                href="/plan"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                Plan oluştur
              </Link>
            </div>
          ) : (
            <ul className="space-y-2.5" aria-label="Bugünün plan blokları">
              {bugunBloklari.map((blok) => {
                const ders = dersMap.get(blok.dersId);
                const gorev = blok.gorevId ? gorevMap.get(blok.gorevId) : undefined;
                const renk = ders?.renk ?? "#6b7280";

                return (
                  <li
                    key={blok.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      blok.tamamlandi
                        ? "border-border opacity-60 bg-surface-hover/50"
                        : "border-border bg-background hover:bg-surface-hover/30"
                    }`}
                    style={{ borderLeftColor: renk, borderLeftWidth: "4px" }}
                  >
                    {/* Onay Kutusu */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={blok.tamamlandi}
                      aria-label={`${gorev?.baslik ?? ders?.ad ?? "Blok"} ${
                        blok.tamamlandi ? "tamamlanmadı yap" : "tamamlandı yap"
                      }`}
                      onClick={() => {
                        if (blok.tamamlandi) {
                          blokTamamlamayiGeriAl(blok.id);
                        } else {
                          blokTamamla(blok.id);
                        }
                      }}
                      className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          blok.tamamlandi
                            ? "bg-success border-success text-white"
                            : "border-border bg-background hover:border-primary"
                        }`}
                      >
                        {blok.tamamlandi && (
                          <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                        )}
                      </div>
                    </button>

                    {/* Bilgi */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: renk }}
                      >
                        {ders?.ad ?? "Bilinmeyen Ders"}
                      </p>
                      <p
                        className={`text-sm font-medium text-main truncate ${
                          blok.tamamlandi ? "line-through text-muted" : ""
                        }`}
                      >
                        {gorev?.baslik ?? "Genel Çalışma"}
                      </p>
                    </div>

                    {/* Süre */}
                    <span className="shrink-0 text-xs font-semibold text-muted bg-surface-hover px-2 py-1 rounded-lg">
                      {blok.dakika} dk
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* SAĞ: Yaklaşan Görevler */}
        <section
          aria-labelledby="yaklasan-gorevler-baslik"
          className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 id="yaklasan-gorevler-baslik" className="text-base font-bold text-main">
              Yaklaşan görevler
            </h2>
            <Link
              href="/gorevler"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Tümü
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {yaklasanlar.length === 0 ? (
            <div className="text-center py-6">
              <Trophy className="w-10 h-10 text-success mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-muted">
                Tüm görevler tamamlandı veya bekleyen görev yok.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5" aria-label="Yaklaşan görevler listesi">
              {yaklasanlar.map(({ gorev, dersAd, dersRenk, kalanGun }) => (
                <li
                  key={gorev.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background hover:bg-surface-hover/30 transition-colors"
                  style={{ borderLeftColor: dersRenk, borderLeftWidth: "4px" }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: dersRenk }}
                    >
                      {dersAd}
                    </p>
                    <p className="text-sm font-medium text-main truncate">
                      {gorev.baslik}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${kalanGunRenk(kalanGun)}`}
                  >
                    {kalanGunEtiketi(kalanGun)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* DERS İLERLEMESİ */}
      {dersIlerlemesi.some((d) => d.toplamGorev > 0) && (
        <section
          aria-labelledby="ders-ilerlemesi-baslik"
          className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4"
        >
          <h2 id="ders-ilerlemesi-baslik" className="text-base font-bold text-main border-b border-border pb-3">
            Ders ilerlemesi
          </h2>

          <ul className="space-y-4" aria-label="Derslere göre görev ilerlemesi">
            {dersIlerlemesi.map((ilerleme) => (
              <li key={ilerleme.dersId} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: ilerleme.dersRenk }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-main truncate">
                      {ilerleme.dersAd}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-bold text-main">%{ilerleme.yuzde}</span>
                    <span className="text-xs text-muted ml-1">
                      ({ilerleme.tamamlananGorev}/{ilerleme.toplamGorev})
                    </span>
                  </div>
                </div>
                <IlerlemeCubugu yuzde={ilerleme.yuzde} renk={ilerleme.dersRenk} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
