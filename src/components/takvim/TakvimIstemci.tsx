"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useVeriDeposu } from "@/lib/store";
import { formatTarih, yerelTarihAyristir, yerelTarihDizgisi } from "@/lib/tarih";
import { GOREV_TURU_METINLERI, type Gorev } from "@/lib/types";
import { YukleniyorIskeleti } from "@/components/YukleniyorIskeleti";

const abonelikYok = () => () => {};
const HAFTA = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const ayBicimi = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" });
const gunBicimi = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });
const odakSinifi = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function TakvimIstemci() {
  const { dersler, gorevler, planBloklari, yuklendi, blokTamamla, blokTamamlamayiGeriAl } = useVeriDeposu();
  const bugun = useSyncExternalStore(abonelikYok, () => yerelTarihDizgisi(), () => null);
  // Null değerleri, tarayıcının yerel tarihi bilindiğinde bugüne çözülür.
  const [secilenTarih, setSecilenTarih] = useState<string | null>(null);
  const [gorunenAy, setGorunenAy] = useState<string | null>(null);
  const seciliGun = secilenTarih ?? bugun;
  const ay = gorunenAy ?? bugun;

  const dersMap = useMemo(() => new Map(dersler.map((ders) => [ders.id, ders])), [dersler]);
  const gorevMap = useMemo(() => new Map(gorevler.map((gorev) => [gorev.id, gorev])), [gorevler]);
  const gunOzeti = useMemo(() => {
    const ozet = new Map<string, { gorevler: Gorev[]; dakika: number }>();
    function gunAl(tarih: string) {
      let gun = ozet.get(tarih);
      if (!gun) {
        gun = { gorevler: [], dakika: 0 };
        ozet.set(tarih, gun);
      }
      return gun;
    }
    for (const gorev of gorevler) {
      if (!gorev.tamamlandi) gunAl(gorev.sonTarih).gorevler.push(gorev);
    }
    for (const blok of planBloklari) gunAl(blok.tarih).dakika += blok.dakika;
    return ozet;
  }, [gorevler, planBloklari]);

  if (!yuklendi || !bugun || !ay || !seciliGun) {
    return <YukleniyorIskeleti baslik="Takvim yükleniyor..." adet={2} />;
  }

  const ayTarihi = yerelTarihAyristir(ay);
  const ayBasi = new Date(ayTarihi.getFullYear(), ayTarihi.getMonth(), 1);
  const baslangicFarki = (ayBasi.getDay() + 6) % 7;
  const ayinGunSayisi = new Date(ayBasi.getFullYear(), ayBasi.getMonth() + 1, 0).getDate();
  const hucreSayisi = Math.ceil((baslangicFarki + ayinGunSayisi) / 7) * 7;
  const gunler = Array.from({ length: hucreSayisi }, (_, i) => yerelTarihDizgisi(ayBasi, i - baslangicFarki));
  const gununGorevleri = gorevler.filter((gorev) => gorev.sonTarih === seciliGun);
  const gununBloklari = planBloklari.filter((blok) => blok.tarih === seciliGun);

  function ayDegistir(fark: number) {
    setGorunenAy(yerelTarihDizgisi(new Date(ayBasi.getFullYear(), ayBasi.getMonth() + fark, 1)));
  }

  return (
    <div className="min-w-0 space-y-4">
      {dersler.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          Takvime görev eklemek için önce <Link href="/dersler" className={`inline-flex min-h-10 items-center font-medium text-primary underline ${odakSinifi}`}>Dersler sayfasından ders ekleyin</Link>.
        </p>
      ) : gorevler.length > 0 && planBloklari.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          Görevleriniz hazır. <Link href="/plan" className={`inline-flex min-h-10 items-center font-medium text-primary underline ${odakSinifi}`}>Plan sayfasından çalışma planı oluşturun</Link>.
        </p>
      ) : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="takvim-ay" className="min-w-0 rounded-2xl border border-border bg-surface pb-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-0 sm:pb-4">
            <h2 id="takvim-ay" aria-live="polite" className="text-lg font-bold text-main">{ayBicimi.format(ayBasi)}</h2>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Önceki ay" onClick={() => ayDegistir(-1)} className={`flex size-10 items-center justify-center rounded-lg text-muted hover:bg-surface-hover ${odakSinifi}`}>
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => { setGorunenAy(bugun); setSecilenTarih(bugun); }} className={`min-h-10 rounded-lg border border-border px-3 text-sm font-medium hover:bg-surface-hover ${odakSinifi}`}>Bugün</button>
              <button type="button" aria-label="Sonraki ay" onClick={() => ayDegistir(1)} className={`flex size-10 items-center justify-center rounded-lg text-muted hover:bg-surface-hover ${odakSinifi}`}>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px">
            {HAFTA.map((gun) => <div key={gun} className="py-2 text-center text-xs font-medium text-muted">{gun}</div>)}
            {gunler.map((tarih) => {
              const tarihNesnesi = yerelTarihAyristir(tarih);
              const ozet = gunOzeti.get(tarih);
              const gorevSayisi = ozet?.gorevler.length ?? 0;
              const dakika = ozet?.dakika ?? 0;
              const buAy = tarihNesnesi.getMonth() === ayBasi.getMonth();
              const secili = tarih === seciliGun;
              const bugunMu = tarih === bugun;
              return (
                <button
                  key={tarih}
                  type="button"
                  aria-label={`${gunBicimi.format(tarihNesnesi)}, ${gorevSayisi} görev, ${dakika} dakika plan`}
                  aria-pressed={secili}
                  aria-current={bugunMu ? "date" : undefined}
                  onClick={() => { setSecilenTarih(tarih); setGorunenAy(tarih); }}
                  className={`flex min-h-16 min-w-0 flex-col items-center gap-1 rounded-lg border p-1 sm:min-h-24 sm:p-2 ${odakSinifi} ${secili ? "border-primary bg-primary/10" : "border-transparent hover:bg-surface-hover"} ${buAy ? "text-main" : "text-muted"}`}
                >
                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm ${bugunMu ? "bg-primary font-bold text-primary-foreground" : buAy ? "" : "opacity-50"}`}>{tarihNesnesi.getDate()}</span>
                  <span aria-hidden="true" className={`flex max-w-full flex-wrap justify-center gap-1 ${buAy ? "" : "opacity-50"}`}>
                    {ozet?.gorevler.slice(0, 3).map((gorev) => (
                      <span key={gorev.id} className={`size-1.5 shrink-0 sm:size-2 ${gorev.tur === "sinav" ? "rounded-none rotate-45" : "rounded-full"}`} style={{ backgroundColor: dersMap.get(gorev.dersId)?.renk ?? "var(--color-primary)" }} />
                    ))}
                    {gorevSayisi > 3 && <span className="hidden text-[10px] leading-none sm:inline">+{gorevSayisi - 3}</span>}
                  </span>
                  {dakika > 0 && <span aria-hidden="true" className="hidden max-w-full rounded bg-surface-hover px-1 text-[10px] text-muted sm:block">{dakika} dk</span>}
                </button>
              );
            })}
          </div>
          <p className="px-3 pt-3 text-xs text-muted sm:px-0">◆ Sınav · ● Diğer görevler · Renkler dersleri gösterir.</p>
        </section>

        <section aria-labelledby="takvim-gun" className="min-w-0 space-y-5 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <h2 id="takvim-gun" aria-live="polite" className="text-lg font-bold text-main">{formatTarih(seciliGun)}</h2>
          {gununGorevleri.length === 0 && gununBloklari.length === 0 ? (
            <p className="text-sm text-muted">Bu gün için görev veya plan yok.</p>
          ) : (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-main">Son tarihi bu gün olan görevler</h3>
                {gununGorevleri.length === 0 ? <p className="text-sm text-muted">Bu gün son tarihi olan görev yok.</p> : (
                  <ul className="space-y-2">
                    {gununGorevleri.map((gorev) => {
                      const ders = dersMap.get(gorev.dersId);
                      return (
                        <li key={gorev.id} className="space-y-2 rounded-xl border border-border border-l-4 p-3" style={{ borderLeftColor: ders?.renk ?? "var(--color-primary)" }}>
                          <p className="break-words text-xs text-muted">{ders?.ad ?? "Ders bulunamadı"}</p>
                          <p className={`break-words text-sm font-medium ${gorev.tamamlandi ? "text-muted line-through" : "text-main"}`}>{gorev.baslik}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-md bg-surface-hover px-2 py-1 text-muted">{GOREV_TURU_METINLERI[gorev.tur]}</span>
                            <span className={gorev.tamamlandi ? "text-success" : "text-muted"}>{gorev.tamamlandi ? "Tamamlandı" : "Tamamlanmadı"}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-main">Bu günün çalışma planı</h3>
                {gununBloklari.length === 0 ? <p className="text-sm text-muted">Bu gün için plan bloğu yok.</p> : (
                  <ul className="space-y-2">
                    {gununBloklari.map((blok) => {
                      const ders = dersMap.get(blok.dersId);
                      const gorev = blok.gorevId ? gorevMap.get(blok.gorevId) : undefined;
                      return (
                        <li key={blok.id} className="rounded-xl border border-border border-l-4" style={{ borderLeftColor: ders?.renk ?? "var(--color-primary)" }}>
                          <label className="flex min-h-10 cursor-pointer items-start gap-3 p-3">
                            <input type="checkbox" checked={blok.tamamlandi} onChange={(event) => { if (event.target.checked) blokTamamla(blok.id); else blokTamamlamayiGeriAl(blok.id); }} className={`mt-1 size-5 shrink-0 accent-primary ${odakSinifi}`} />
                            <span className="min-w-0 space-y-1">
                              <span className="block break-words text-xs text-muted">{ders?.ad ?? "Ders bulunamadı"}</span>
                              <span className={`block break-words text-sm font-medium ${blok.tamamlandi ? "text-muted line-through" : "text-main"}`}>{gorev?.baslik ?? "Genel çalışma"}</span>
                              <span className="block text-xs text-muted">{blok.dakika} dk · {blok.tamamlandi ? "Tamamlandı" : "Tamamlanmadı"}</span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
