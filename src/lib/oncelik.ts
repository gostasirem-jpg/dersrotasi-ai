/**
 * ÖNCELİK ALGORİTMASI
 *
 * Formül:
 * - zorlukPuani = (ders.zorluk / 5) * 30
 * - aciliyetPuani = Math.max(0, 1 - kalanGun / 14) * 50 ; kalanGun < 0 (gecikmiş) ise aciliyetPuani = 50
 * - turPuani = agirlik * 20 ; agirliklar: sinav 1.0, proje 0.8, odev 0.6, quiz 0.5
 * - toplam = Math.round(zorlukPuani + aciliyetPuani + turPuani), 0-100 arası
 *
 * Örnek Hesaplamalar:
 * - zorluk 4, 3 gün, sınav → 83
 *   zorlukPuani = (4/5) * 30 = 24
 *   aciliyetPuani = (1 - 3/14) * 50 = (11/14) * 50 ≈ 39.29
 *   turPuani = 1.0 * 20 = 20
 *   toplam = Math.round(24 + 39.29 + 20) = Math.round(83.29) = 83
 *
 * - zorluk 2, 10 gün, ödev → 38
 *   zorlukPuani = (2/5) * 30 = 12
 *   aciliyetPuani = (1 - 10/14) * 50 = (4/14) * 50 ≈ 14.29
 *   turPuani = 0.6 * 20 = 12
 *   toplam = Math.round(12 + 14.29 + 12) = Math.round(38.29) = 38
 */

import type { Ders, Gorev, GorevTuru } from "./types";
import { GOREV_TURU_METINLERI } from "./types";
import { yerelTarihAyristir } from "./tarih";

export interface GorevOncelikPuani {
  gorevId: string;
  toplam: number;
  zorlukPuani: number; // 1 ondalıklı
  aciliyetPuani: number; // 1 ondalıklı
  turPuani: number; // 1 ondalıklı
  gerekce: string[];
}

export const GOREV_TURU_AGIRLIKLARI: Record<GorevTuru, number> = {
  sinav: 1.0,
  proje: 0.8,
  odev: 0.6,
  quiz: 0.5,
};

function turYonelmeHali(tur: GorevTuru): string {
  switch (tur) {
    case "sinav":
      return "Sınava";
    case "odev":
      return "Ödeve";
    case "proje":
      return "Projeye";
    case "quiz":
      return "Quize";
  }
}

/**
 * Belirli bir tarihe göre kalan gün sayısını tam sayı olarak hesaplar.
 */
export function hesaplaKalanGun(sonTarihDizgisi: string, referansTarih?: Date | string): number {
  const hedef = yerelTarihAyristir(sonTarihDizgisi);
  let ref: Date;

  if (!referansTarih) {
    ref = new Date();
  } else if (typeof referansTarih === "string") {
    ref = yerelTarihAyristir(referansTarih);
  } else {
    ref = referansTarih;
  }

  const bugun = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 0, 0, 0, 0);
  const farkMs = hedef.getTime() - bugun.getTime();
  const birGunMs = 1000 * 60 * 60 * 24;

  return Math.round(farkMs / birGunMs);
}

/**
 * Tek bir tamamlanmamış görev için öncelik puanı ve gerekçelerini hesaplar.
 */
export function gorevOncelikHesapla(
  gorev: Gorev,
  ders: Ders,
  referansTarih?: Date | string
): GorevOncelikPuani {
  // 1. Zorluk Puanı: (ders.zorluk / 5) * 30
  const hamZorluk = (ders.zorluk / 5) * 30;

  // 2. Aciliyet Puanı: max(0, 1 - kalanGun / 14) * 50 ; kalanGun < 0 ise 50
  const gun = hesaplaKalanGun(gorev.sonTarih, referansTarih);
  let hamAciliyet = 0;
  if (gun < 0) {
    hamAciliyet = 50;
  } else {
    hamAciliyet = Math.max(0, 1 - gun / 14) * 50;
  }

  // 3. Tür Puanı: agirlik * 20
  const agirlik = GOREV_TURU_AGIRLIKLARI[gorev.tur] ?? 0.5;
  const hamTur = agirlik * 20;

  // 4. Toplam Puan: 0-100 arası yuvarlanmış tam sayı
  const hamToplam = hamZorluk + hamAciliyet + hamTur;
  const toplam = Math.min(100, Math.max(0, Math.round(hamToplam)));

  // 1 ondalıklı formatlama
  const zorlukPuani = Math.round(hamZorluk * 10) / 10;
  const aciliyetPuani = Math.round(hamAciliyet * 10) / 10;
  const turPuani = Math.round(hamTur * 10) / 10;

  // Gerekçeler dizisi
  const gerekce: string[] = [];

  // Tarih / Aciliyet gerekçesi
  if (gun < 0) {
    gerekce.push(`Son tarih ${Math.abs(gun)} gün geçti`);
  } else if (gun === 0) {
    gerekce.push(`${GOREV_TURU_METINLERI[gorev.tur]} bugün`);
  } else {
    gerekce.push(`${turYonelmeHali(gorev.tur)} ${gun} gün kaldı`);
  }

  // Zorluk gerekçesi
  gerekce.push(`Ders zorluğu ${ders.zorluk}/5`);

  // Tür gerekçesi
  gerekce.push(`Tür: ${GOREV_TURU_METINLERI[gorev.tur]}`);

  return {
    gorevId: gorev.id,
    toplam,
    zorlukPuani,
    aciliyetPuani,
    turPuani,
    gerekce,
  };
}

/**
 * Tamamlanmamış görevlerin öncelik puanlarını hesaplar ve yüksek puandan düşüğe sıralar.
 */
export function tumOncelikleriHesapla(
  gorevler: Gorev[],
  dersler: Ders[],
  referansTarih?: Date | string
): GorevOncelikPuani[] {
  const dersHaritasi = new Map<string, Ders>();
  dersler.forEach((d) => dersHaritasi.set(d.id, d));

  return gorevler
    .filter((g) => !g.tamamlandi)
    .map((gorev) => {
      const ders = dersHaritasi.get(gorev.dersId) || {
        id: gorev.dersId,
        ad: "Bilinmeyen Ders",
        zorluk: 3,
        renk: "#6b7280",
        olusturmaTarihi: new Date().toISOString(),
      };
      return gorevOncelikHesapla(gorev, ders, referansTarih);
    })
    .sort((a, b) => b.toplam - a.toplam);
}
