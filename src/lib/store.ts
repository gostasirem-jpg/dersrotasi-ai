"use client";

import { useSyncExternalStore } from "react";
import type {
  VeriDurumu,
  Ders,
  Gorev,
  Ayarlar,
  CalismaOturumu,
  ZorlukDerecesi,
  GorevTuru,
} from "./types";
import { VARSAYILAN_VERI } from "./types";
import { ornekVeriUret } from "./ornek-veri";
import { planOlusturSaf, type PlanlayiciSonucu } from "./planlayici";
import { yerelTarihDizgisi } from "./tarih";

export const STORAGE_KEY = "dersrotasi-veri";

// Benzersiz kimlik üretici (Yeni paket kurmadan crypto.randomUUID kullanımı)
export function benzersizId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);
}

// Bellekteki anlık durum önbelleği ve dinleyiciler
let bellekDurumu: VeriDurumu | null = null;
const dinleyiciler = new Set<() => void>();

function dinleyicileriTetikle() {
  dinleyiciler.forEach((dinleyici) => dinleyici());
}

/**
 * localStorage'dan güvenle veriyi okur, bozuk/eksikse varsayılana döner.
 */
export function localStorageOku(): VeriDurumu {
  if (typeof window === "undefined") {
    return VARSAYILAN_VERI;
  }

  try {
    const ham = window.localStorage.getItem(STORAGE_KEY);
    if (!ham) {
      return VARSAYILAN_VERI;
    }

    const ayrismis = JSON.parse(ham) as Partial<VeriDurumu>;
    if (!ayrismis || typeof ayrismis !== "object" || ayrismis.surum !== 1) {
      return VARSAYILAN_VERI;
    }

    return {
      surum: 1,
      dersler: Array.isArray(ayrismis.dersler) ? ayrismis.dersler : [],
      gorevler: Array.isArray(ayrismis.gorevler) ? ayrismis.gorevler : [],
      ayarlar: ayrismis.ayarlar || VARSAYILAN_VERI.ayarlar,
      planBloklari: Array.isArray(ayrismis.planBloklari) ? ayrismis.planBloklari : [],
      oturumlar: Array.isArray(ayrismis.oturumlar) ? ayrismis.oturumlar : [],
    };
  } catch (hata) {
    console.error("[DersRotasi] localStorage okuma hatası:", hata);
    return VARSAYILAN_VERI;
  }
}

/**
 * Veriyi hem belleğe hem localStorage'a yazar ve tüm dinleyicileri haberdar eder.
 */
export function veriKaydet(yeniDurum: VeriDurumu) {
  bellekDurumu = yeniDurum;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(yeniDurum));
    } catch (hata) {
      console.error("[DersRotasi] localStorage yazma hatası:", hata);
    }
  }

  dinleyicileriTetikle();
}

/**
 * useSyncExternalStore için Snapshot fonksiyonları
 */
function getSnapshot(): VeriDurumu {
  if (bellekDurumu === null) {
    bellekDurumu = localStorageOku();
  }
  return bellekDurumu;
}

function getServerSnapshot(): VeriDurumu {
  return VARSAYILAN_VERI;
}

function subscribe(callback: () => void): () => void {
  dinleyiciler.add(callback);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      bellekDurumu = localStorageOku();
      callback();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    dinleyiciler.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

// -------------------------------------------------------------
// VERİ İŞLEMLERİ
// -------------------------------------------------------------

export interface YeniDersGirdisi {
  ad: string;
  kod?: string;
  zorluk: ZorlukDerecesi;
  renk: string;
}

export function dersEkle(girdi: YeniDersGirdisi): Ders {
  const guncel = getSnapshot();
  const yeniDers: Ders = {
    id: benzersizId(),
    ad: girdi.ad.trim(),
    kod: girdi.kod ? girdi.kod.trim().toUpperCase() : undefined,
    zorluk: girdi.zorluk,
    renk: girdi.renk,
    olusturmaTarihi: new Date().toISOString(),
  };

  const yeniDurum: VeriDurumu = {
    ...guncel,
    dersler: [...guncel.dersler, yeniDers],
  };

  veriKaydet(yeniDurum);
  return yeniDers;
}

export function dersGuncelle(id: string, girdi: Partial<YeniDersGirdisi>): void {
  const guncel = getSnapshot();
  const yeniDersler = guncel.dersler.map((ders) => {
    if (ders.id !== id) return ders;
    return {
      ...ders,
      ad: girdi.ad !== undefined ? girdi.ad.trim() : ders.ad,
      kod: girdi.kod !== undefined ? (girdi.kod ? girdi.kod.trim().toUpperCase() : undefined) : ders.kod,
      zorluk: girdi.zorluk !== undefined ? girdi.zorluk : ders.zorluk,
      renk: girdi.renk !== undefined ? girdi.renk : ders.renk,
    };
  });

  veriKaydet({
    ...guncel,
    dersler: yeniDersler,
  });
}

/**
 * Dersi ve ona bağlı TÜM görevleri siler.
 */
export function dersSil(id: string): void {
  const guncel = getSnapshot();
  const yeniDersler = guncel.dersler.filter((d) => d.id !== id);
  const yeniGorevler = guncel.gorevler.filter((g) => g.dersId !== id);
  const yeniPlanBloklari = guncel.planBloklari.filter((p) => p.dersId !== id);
  const yeniOturumlar = guncel.oturumlar.filter((o) => o.dersId !== id);

  veriKaydet({
    ...guncel,
    dersler: yeniDersler,
    gorevler: yeniGorevler,
    planBloklari: yeniPlanBloklari,
    oturumlar: yeniOturumlar,
  });
}

export interface YeniGorevGirdisi {
  dersId: string;
  baslik: string;
  tur: GorevTuru;
  sonTarih: string; // "YYYY-MM-DD"
  tahminiSaat: number;
  aciklama?: string;
  tamamlandi?: boolean;
}

export function gorevEkle(girdi: YeniGorevGirdisi): Gorev {
  const guncel = getSnapshot();
  const yeniGorev: Gorev = {
    id: benzersizId(),
    dersId: girdi.dersId,
    baslik: girdi.baslik.trim(),
    tur: girdi.tur,
    sonTarih: girdi.sonTarih,
    tahminiSaat: Number(girdi.tahminiSaat),
    tamamlandi: Boolean(girdi.tamamlandi),
    aciklama: girdi.aciklama ? girdi.aciklama.trim() : undefined,
  };

  veriKaydet({
    ...guncel,
    gorevler: [...guncel.gorevler, yeniGorev],
  });

  return yeniGorev;
}

export function gorevGuncelle(id: string, girdi: Partial<YeniGorevGirdisi>): void {
  const guncel = getSnapshot();
  const yeniGorevler = guncel.gorevler.map((gorev) => {
    if (gorev.id !== id) return gorev;
    return {
      ...gorev,
      dersId: girdi.dersId !== undefined ? girdi.dersId : gorev.dersId,
      baslik: girdi.baslik !== undefined ? girdi.baslik.trim() : gorev.baslik,
      tur: girdi.tur !== undefined ? girdi.tur : gorev.tur,
      sonTarih: girdi.sonTarih !== undefined ? girdi.sonTarih : gorev.sonTarih,
      tahminiSaat: girdi.tahminiSaat !== undefined ? Number(girdi.tahminiSaat) : gorev.tahminiSaat,
      tamamlandi: girdi.tamamlandi !== undefined ? Boolean(girdi.tamamlandi) : gorev.tamamlandi,
      aciklama: girdi.aciklama !== undefined ? (girdi.aciklama ? girdi.aciklama.trim() : undefined) : gorev.aciklama,
    };
  });

  veriKaydet({
    ...guncel,
    gorevler: yeniGorevler,
  });
}

export function gorevSil(id: string): void {
  const guncel = getSnapshot();
  const yeniGorevler = guncel.gorevler.filter((g) => g.id !== id);
  const yeniPlanBloklari = guncel.planBloklari.filter((p) => p.gorevId !== id);

  veriKaydet({
    ...guncel,
    gorevler: yeniGorevler,
    planBloklari: yeniPlanBloklari,
  });
}

export function gorevTamamlandiDegistir(id: string, tamamlandi?: boolean): void {
  const guncel = getSnapshot();
  const yeniGorevler = guncel.gorevler.map((gorev) => {
    if (gorev.id !== id) return gorev;
    const yeniDurum = tamamlandi !== undefined ? tamamlandi : !gorev.tamamlandi;
    return {
      ...gorev,
      tamamlandi: yeniDurum,
    };
  });

  veriKaydet({
    ...guncel,
    gorevler: yeniGorevler,
  });
}

export function ornekVerileriYukle(): void {
  const ornekVeri = ornekVeriUret();
  veriKaydet(ornekVeri);
}

export function tumVerileriSil(): void {
  veriKaydet(VARSAYILAN_VERI);
}

// -------------------------------------------------------------
// ÇALIŞMA PLANI VE AYAR EYLEMLERİ
// -------------------------------------------------------------

export function ayarlariGuncelle(yeniAyarlar: Partial<Ayarlar>): void {
  const guncel = getSnapshot();
  veriKaydet({
    ...guncel,
    ayarlar: {
      ...guncel.ayarlar,
      ...yeniAyarlar,
    },
  });
}

/**
 * 7 günlük akıllı plan oluşturur:
 * Bugün ve sonrasındaki TAMAMLANMAMIŞ blokları silip yenilerini ekler;
 * tamamlanmış bloklar ve geçmiş günler korunur.
 */
export function planOlustur(bugununTarihi?: string): PlanlayiciSonucu {
  const guncel = getSnapshot();
  const bugunStr = bugununTarihi || yerelTarihDizgisi(new Date(), 0);

  // Korunan bloklar: tamamlanmış olanlar VEYA geçmiş günlere ait olanlar
  const korunanBloklar = guncel.planBloklari.filter(
    (b) => b.tamamlandi || b.tarih < bugunStr
  );

  const planSonucu = planOlusturSaf({
    gorevler: guncel.gorevler,
    dersler: guncel.dersler,
    ayarlar: guncel.ayarlar,
    mevcutPlanBloklari: guncel.planBloklari,
    bugununTarihi: bugunStr,
  });

  veriKaydet({
    ...guncel,
    planBloklari: [...korunanBloklar, ...planSonucu.yeniBloklar],
  });

  return planSonucu;
}

/**
 * Plan bloğunu günceller (dakika veya tarih değiştirme).
 */
export function blokGuncelle(id: string, girdi: { dakika?: number; tarih?: string }): void {
  const guncel = getSnapshot();
  const yeniPlanBloklari = guncel.planBloklari.map((blok) => {
    if (blok.id !== id) return blok;
    return {
      ...blok,
      dakika:
        girdi.dakika !== undefined
          ? Math.max(5, Math.min(120, girdi.dakika))
          : blok.dakika,
      tarih: girdi.tarih !== undefined ? girdi.tarih : blok.tarih,
    };
  });

  // Eğer blok daha önce tamamlanmışsa ve süresi/tarihi değiştiyse ilişkili oturumu da güncelle
  const yeniOturumlar = guncel.oturumlar.map((oturum) => {
    if (oturum.id !== `oturum-blok-${id}`) return oturum;
    return {
      ...oturum,
      dakika:
        girdi.dakika !== undefined
          ? Math.max(5, Math.min(120, girdi.dakika))
          : oturum.dakika,
      tarih: girdi.tarih !== undefined ? girdi.tarih : oturum.tarih,
    };
  });

  veriKaydet({
    ...guncel,
    planBloklari: yeniPlanBloklari,
    oturumlar: yeniOturumlar,
  });
}

/**
 * Plan bloğunu siler ve ilişkili çalışma oturumu varsa onu da kaldırır.
 */
export function blokSil(id: string): void {
  const guncel = getSnapshot();
  veriKaydet({
    ...guncel,
    planBloklari: guncel.planBloklari.filter((b) => b.id !== id),
    oturumlar: guncel.oturumlar.filter((o) => o.id !== `oturum-blok-${id}`),
  });
}

/**
 * Bloğu tamamlandı yapar ve aynı dakikayla bir CalismaOturumu kaydı ekler.
 */
export function blokTamamla(id: string): void {
  const guncel = getSnapshot();
  const hedefBlok = guncel.planBloklari.find((b) => b.id === id);
  if (!hedefBlok || hedefBlok.tamamlandi) return;

  const yeniPlanBloklari = guncel.planBloklari.map((b) =>
    b.id === id ? { ...b, tamamlandi: true } : b
  );

  const yeniOturum: CalismaOturumu = {
    id: `oturum-blok-${id}`,
    dersId: hedefBlok.dersId,
    tarih: hedefBlok.tarih,
    dakika: hedefBlok.dakika,
  };

  // Varsa eskisi çıkarılır, yenisi eklenir
  const filtrelenmisOturumlar = guncel.oturumlar.filter(
    (o) => o.id !== `oturum-blok-${id}`
  );

  veriKaydet({
    ...guncel,
    planBloklari: yeniPlanBloklari,
    oturumlar: [...filtrelenmisOturumlar, yeniOturum],
  });
}

/**
 * Blok tamamlamayı geri alır (bloğu tamamlanmadı yapar ve oturum kaydını da siler).
 */
export function blokTamamlamayiGeriAl(id: string): void {
  const guncel = getSnapshot();
  const yeniPlanBloklari = guncel.planBloklari.map((b) =>
    b.id === id ? { ...b, tamamlandi: false } : b
  );

  veriKaydet({
    ...guncel,
    planBloklari: yeniPlanBloklari,
    oturumlar: guncel.oturumlar.filter((o) => o.id !== `oturum-blok-${id}`),
  });
}

// -------------------------------------------------------------
// REACT HOOK
// -------------------------------------------------------------

const bosAbonelik = () => () => {};

/**
 * React 19 uyumlu istemci hidrasyon kontrolü (useEffect + setState yerine useSyncExternalStore kullanımı)
 */
export function useHidrasyon(): boolean {
  return useSyncExternalStore(
    bosAbonelik,
    () => true,
    () => false
  );
}

export function useVeriDeposu() {
  const veri = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const yuklendi = useHidrasyon();

  return {
    veri,
    yuklendi,
    // Pratik erişimciler
    dersler: veri.dersler,
    gorevler: veri.gorevler,
    ayarlar: veri.ayarlar,
    planBloklari: veri.planBloklari,
    oturumlar: veri.oturumlar,
    // Eylemler
    dersEkle,
    dersGuncelle,
    dersSil,
    gorevEkle,
    gorevGuncelle,
    gorevSil,
    gorevTamamlandiDegistir,
    ornekVerileriYukle,
    tumVerileriSil,
    ayarlariGuncelle,
    planOlustur,
    blokGuncelle,
    blokSil,
    blokTamamla,
    blokTamamlamayiGeriAl,
  };
}
