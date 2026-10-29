/**
 * İSTATİSTİK HESAPLAMALARI
 *
 * Saf (pure) fonksiyonlar — React içermesin.
 * Tüm tarih işlemleri src/lib/tarih.ts yardımcıları üzerinden yerel saat diliminde yapılır.
 */

import type { Ders, Gorev, PlanBlogu, CalismaOturumu } from "./types";
import { yerelTarihDizgisi, yerelTarihAyristir } from "./tarih";

// ─────────────────────────────────────────────────────────────────────────────
// YARDIMCI TİPLER
// ─────────────────────────────────────────────────────────────────────────────

export interface BugunkuHedef {
  planlananDakika: number;
  tamamlananDakika: number;
  yuzde: number; // 0–100
}

export interface GunlukCalisma {
  tarih: string; // "YYYY-MM-DD"
  kisaAd: string; // "Pzt", "Sal" vb.
  dakika: number;
  bugunMu: boolean;
}

export interface HaftalikCalisma {
  gunler: GunlukCalisma[];
  toplamDakika: number;
}

export interface DerseSureBilgi {
  dersId: string;
  dersAd: string;
  dersRenk: string;
  dakika: number;
  yuzde: number; // 0–100
}

export interface GorevTuruDagilim {
  sinav: { toplam: number; tamamlanan: number };
  odev: { toplam: number; tamamlanan: number };
  proje: { toplam: number; tamamlanan: number };
  quiz: { toplam: number; tamamlanan: number };
}

export interface GorevOzeti {
  toplam: number;
  tamamlanan: number;
  bekleyen: number;
  gecikmiş: number;
  tureDagilimlari: GorevTuruDagilim;
}

export interface DersIlerlemesi {
  dersId: string;
  dersAd: string;
  dersRenk: string;
  toplamGorev: number;
  tamamlananGorev: number;
  yuzde: number; // 0–100
}

export interface YaklasanGorev {
  gorev: Gorev;
  dersAd: string;
  dersRenk: string;
  kalanGun: number;
}

export interface PlanUyumu {
  planlananDakika: number;
  tamamlananDakika: number;
  yuzde: number; // 0–100
}

// ─────────────────────────────────────────────────────────────────────────────
// YARDIMCI SABITLER
// ─────────────────────────────────────────────────────────────────────────────

const KISA_GUN_ADLARI: Record<number, string> = {
  0: "Paz",
  1: "Pzt",
  2: "Sal",
  3: "Çar",
  4: "Per",
  5: "Cum",
  6: "Cmt",
};

// ─────────────────────────────────────────────────────────────────────────────
// HESAPLAMALAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bugünün plan bloklarına göre hedef / tamamlanan dakika ve yüzde hesaplar.
 */
export function bugunkuHedefHesapla(
  planBloklari: PlanBlogu[],
  bugun: string // "YYYY-MM-DD"
): BugunkuHedef {
  const bugununBloklari = planBloklari.filter((b) => b.tarih === bugun);
  const planlananDakika = bugununBloklari.reduce((s, b) => s + b.dakika, 0);
  const tamamlananDakika = bugununBloklari
    .filter((b) => b.tamamlandi)
    .reduce((s, b) => s + b.dakika, 0);
  const yuzde =
    planlananDakika === 0 ? 0 : Math.round((tamamlananDakika / planlananDakika) * 100);

  return { planlananDakika, tamamlananDakika, yuzde };
}

/**
 * Son 7 günün (bugün dahil) her gününe ait çalışma oturumu dakika toplamları.
 */
export function haftalikCalismaHesapla(
  oturumlar: CalismaOturumu[],
  bugun: string // "YYYY-MM-DD"
): HaftalikCalisma {
  const bugunDate = yerelTarihAyristir(bugun);

  const gunler: GunlukCalisma[] = Array.from({ length: 7 }, (_, i) => {
    // Geçmişe doğru: i=0 → bugün, i=6 → 6 gün önce
    const tarih = yerelTarihDizgisi(bugunDate, -(6 - i));
    const tarihDate = yerelTarihAyristir(tarih);
    const haftaninGunu = tarihDate.getDay();
    const dakika = oturumlar
      .filter((o) => o.tarih === tarih)
      .reduce((s, o) => s + o.dakika, 0);

    return {
      tarih,
      kisaAd: KISA_GUN_ADLARI[haftaninGunu] ?? "?",
      dakika,
      bugunMu: tarih === bugun,
    };
  });

  const toplamDakika = gunler.reduce((s, g) => s + g.dakika, 0);

  return { gunler, toplamDakika };
}

/**
 * Son 7 günde her derse ayrılan oturum dakikası ve toplam içindeki yüzde.
 */
export function derseGoreSureHesapla(
  oturumlar: CalismaOturumu[],
  dersler: Ders[],
  bugun: string // "YYYY-MM-DD"
): DerseSureBilgi[] {
  const bugunDate = yerelTarihAyristir(bugun);
  // Son 7 günün tarih kümesi
  const son7TarihSet = new Set<string>(
    Array.from({ length: 7 }, (_, i) => yerelTarihDizgisi(bugunDate, -(6 - i)))
  );

  // Derse göre dakika topla
  const dersMap = new Map<string, number>();
  oturumlar
    .filter((o) => son7TarihSet.has(o.tarih))
    .forEach((o) => {
      dersMap.set(o.dersId, (dersMap.get(o.dersId) ?? 0) + o.dakika);
    });

  const toplamDakika = Array.from(dersMap.values()).reduce((s, d) => s + d, 0);

  const dersHaritasi = new Map<string, Ders>(dersler.map((d) => [d.id, d]));

  return Array.from(dersMap.entries())
    .map(([dersId, dakika]) => {
      const ders = dersHaritasi.get(dersId);
      return {
        dersId,
        dersAd: ders?.ad ?? "Bilinmeyen Ders",
        dersRenk: ders?.renk ?? "#6b7280",
        dakika,
        yuzde: toplamDakika === 0 ? 0 : Math.round((dakika / toplamDakika) * 100),
      };
    })
    .sort((a, b) => b.dakika - a.dakika);
}

/**
 * Görev özeti: toplam / tamamlanan / bekleyen / gecikmiş ve türe göre dağılım.
 */
export function gorevOzetiHesapla(gorevler: Gorev[], bugun: string): GorevOzeti {
  const tureDagilimlari: GorevTuruDagilim = {
    sinav: { toplam: 0, tamamlanan: 0 },
    odev: { toplam: 0, tamamlanan: 0 },
    proje: { toplam: 0, tamamlanan: 0 },
    quiz: { toplam: 0, tamamlanan: 0 },
  };

  let tamamlanan = 0;
  let gecikmiş = 0;

  gorevler.forEach((g) => {
    const tur = g.tur as keyof GorevTuruDagilim;
    if (tureDagilimlari[tur]) {
      tureDagilimlari[tur].toplam++;
      if (g.tamamlandi) {
        tureDagilimlari[tur].tamamlanan++;
        tamamlanan++;
      } else if (g.sonTarih < bugun) {
        gecikmiş++;
      }
    }
  });

  return {
    toplam: gorevler.length,
    tamamlanan,
    bekleyen: gorevler.length - tamamlanan,
    gecikmiş,
    tureDagilimlari,
  };
}

/**
 * Her ders için tamamlanan görev / toplam görev yüzdesi.
 */
export function dersIlerlemesiHesapla(
  gorevler: Gorev[],
  dersler: Ders[]
): DersIlerlemesi[] {
  return dersler
    .map((ders) => {
      const dersGorevleri = gorevler.filter((g) => g.dersId === ders.id);
      const tamamlananGorev = dersGorevleri.filter((g) => g.tamamlandi).length;
      const toplamGorev = dersGorevleri.length;
      const yuzde =
        toplamGorev === 0 ? 0 : Math.round((tamamlananGorev / toplamGorev) * 100);

      return {
        dersId: ders.id,
        dersAd: ders.ad,
        dersRenk: ders.renk,
        toplamGorev,
        tamamlananGorev,
        yuzde,
      };
    })
    .sort((a, b) => b.yuzde - a.yuzde);
}

/**
 * Tamamlanmamış görevlerden son tarihi en yakın 5 tanesi.
 */
export function yaklasanlariHesapla(
  gorevler: Gorev[],
  dersler: Ders[],
  bugun: string // "YYYY-MM-DD"
): YaklasanGorev[] {
  const bugunDate = yerelTarihAyristir(bugun);
  const dersHaritasi = new Map<string, Ders>(dersler.map((d) => [d.id, d]));

  return gorevler
    .filter((g) => !g.tamamlandi)
    .map((gorev) => {
      const hedef = yerelTarihAyristir(gorev.sonTarih);
      const farkMs = hedef.getTime() - bugunDate.getTime();
      const kalanGun = Math.round(farkMs / (1000 * 60 * 60 * 24));
      const ders = dersHaritasi.get(gorev.dersId);
      return {
        gorev,
        dersAd: ders?.ad ?? "Bilinmeyen Ders",
        dersRenk: ders?.renk ?? "#6b7280",
        kalanGun,
      };
    })
    .sort((a, b) => a.kalanGun - b.kalanGun)
    .slice(0, 5);
}

/**
 * Bugün ve geçmiş günlerdeki planlanan blok dakikalarına göre tamamlanan dakika yüzdesi.
 * Sadece bugün ve öncesi ele alınır (gelecek plan bloklarını dahil etme).
 */
export function planUyumuHesapla(
  planBloklari: PlanBlogu[],
  bugun: string // "YYYY-MM-DD"
): PlanUyumu {
  const gegmisBloklari = planBloklari.filter((b) => b.tarih <= bugun);
  const planlananDakika = gegmisBloklari.reduce((s, b) => s + b.dakika, 0);
  const tamamlananDakika = gegmisBloklari
    .filter((b) => b.tamamlandi)
    .reduce((s, b) => s + b.dakika, 0);
  const yuzde =
    planlananDakika === 0 ? 0 : Math.round((tamamlananDakika / planlananDakika) * 100);

  return { planlananDakika, tamamlananDakika, yuzde };
}

/**
 * Sınav türündeki yaklaşan ilk görevi döndürür.
 */
export function enYakinSinavBul(
  gorevler: Gorev[],
  dersler: Ders[],
  bugun: string
): YaklasanGorev | null {
  const dersHaritasi = new Map<string, Ders>(dersler.map((d) => [d.id, d]));
  const bugunDate = yerelTarihAyristir(bugun);

  const sinavlar = gorevler
    .filter((g) => !g.tamamlandi && g.tur === "sinav" && g.sonTarih >= bugun)
    .map((gorev) => {
      const hedef = yerelTarihAyristir(gorev.sonTarih);
      const farkMs = hedef.getTime() - bugunDate.getTime();
      const kalanGun = Math.round(farkMs / (1000 * 60 * 60 * 24));
      const ders = dersHaritasi.get(gorev.dersId);
      return {
        gorev,
        dersAd: ders?.ad ?? "Bilinmeyen Ders",
        dersRenk: ders?.renk ?? "#6b7280",
        kalanGun,
      };
    })
    .sort((a, b) => a.kalanGun - b.kalanGun);

  return sinavlar[0] ?? null;
}
