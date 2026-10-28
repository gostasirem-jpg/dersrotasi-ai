/**
 * AKILLI PLANLAYICI ALGORİTMASI
 *
 * Adım Adım Çalışma Mantığı:
 * 1. Başlangıç Değerleri ve Zaman Penceresi:
 *    - Bugünden başlayarak ileriye doğru 7 takvim günü (Bugün, Yarın ... Gün 6) belirlenir.
 *    - Ayarlardaki çalışma günleri (calismaGunleri) kontrol edilir; çalışma günü olmayan günlere (dinlenme günleri) hiçbir blok eklenmez.
 *
 * 2. Görev İhtiyaçlarının Belirlenmesi:
 *    - Tamamlanmamış görevler filtrelenir.
 *    - Her görevin kalan ihtiyacı: (tahminiSaat * 60) - (o görev için TAMAMLANMIŞ blokların dakikaları toplamı).
 *    - Kalan ihtiyacı <= 0 olan görevler karşılanmış kabul edilerek planlamaya dahil edilmez.
 *
 * 3. Günlük Görev Uygunluğu ve Öncelik Dağıtımı:
 *    - Bir görev, son teslim/sınav tarihinden sonraki günlere planlanamaz.
 *    - Gecikmiş görevler yalnızca bugüne (1. gün) planlanabilir.
 *    - Her çalışma gününde kullanılabilir dakika = gunlukSaat * 60 olarak hesaplanır.
 *    - O gün için uygun görevlerin öncelik puanları toplanır ve dakikalar puanlarla ORANTILI olarak dağıtılır.
 *    - Hiçbir göreve kalan ihtiyacından fazla süre verilmez.
 *    - Yuvarlamadan kalan artık dakikalar en yüksek öncelikli uygun göreve aktarılır.
 *
 * 4. Blok Sürelerinin Düzenlenmesi:
 *    - Blok süreleri 5'in katı, en az 25, en fazla 50 dakika olacak şekilde oluşturulur.
 *    - 50 dakikayı aşan büyük paylar birden fazla 25-50 dk arası bloğa bölünür.
 *
 * 5. Kapasite Uyarısı Üretimi:
 *    - Bir görevin kalan ihtiyacı son tarihine kadar planlanabilen süreye sığmıyorsa Türkçe kapasite uyarısı üretilir.
 *    - Örn: "Lineer Cebir 1. Ara Sınavı için 8 saat gerekiyor, son tarihe kadar planlanabilen süre 5 saat 30 dakika."
 */

import type { Ders, Gorev, Ayarlar, PlanBlogu } from "./types";
import { yerelTarihAyristir, yerelTarihDizgisi } from "./tarih";
import { tumOncelikleriHesapla } from "./oncelik";
import { benzersizId } from "./store";

export interface PlanlayiciGirdisi {
  gorevler: Gorev[];
  dersler: Ders[];
  ayarlar: Ayarlar;
  mevcutPlanBloklari: PlanBlogu[];
  bugununTarihi?: Date | string;
}

export interface PlanlayiciSonucu {
  yeniBloklar: PlanBlogu[];
  kapasiteUyarilari: string[];
}

/**
 * Süreyi kullanıcı dostu Türkçe metne dönüştürür.
 * Örn: 90 -> "1 saat 30 dakika", 120 -> "2 saat", 45 -> "45 dakika"
 */
export function sureFormatla(dakika: number): string {
  const saat = Math.floor(dakika / 60);
  const dk = dakika % 60;
  if (saat === 0) return `${dk} dakika`;
  if (dk === 0) return `${saat} saat`;
  return `${saat} saat ${dk} dakika`;
}

/**
 * Verilen toplam dakikayı 25-50 dakika arası, 5'in katı bloklara böler.
 * Toplam süre 25 dakikanın altındaysa (kalan son ihtiyaç gibi) tek blok olarak döner.
 */
export function dakikayiBloklaraBol(toplamDakika: number): number[] {
  if (toplamDakika <= 0) return [];
  if (toplamDakika <= 50) return [toplamDakika];

  // Blok adedi tespiti (en az ceil(toplam / 50), en fazla floor(toplam / 25))
  let adet = Math.ceil(toplamDakika / 50);
  while (Math.floor(toplamDakika / adet) < 25 && adet > 1) {
    adet--;
  }

  // 5 dakikalık birimler üzerinden dengeli bölüştürme
  const birimAdet5 = Math.floor(toplamDakika / 5);
  const tabanBirim = Math.floor(birimAdet5 / adet);
  let artikBirim = birimAdet5 % adet;

  const bloklar: number[] = [];
  for (let i = 0; i < adet; i++) {
    const carpan = tabanBirim + (artikBirim > 0 ? 1 : 0);
    if (artikBirim > 0) artikBirim--;
    bloklar.push(carpan * 5);
  }

  return bloklar;
}

/**
 * Öncelik algoritmasına dayalı 7 günlük akıllı çalışma planı üretir.
 */
export function planOlusturSaf({
  gorevler,
  dersler,
  ayarlar,
  mevcutPlanBloklari,
  bugununTarihi,
}: PlanlayiciGirdisi): PlanlayiciSonucu {
  // Tarih hazırlığı
  let bugunDate: Date;
  if (!bugununTarihi) {
    bugunDate = new Date();
  } else if (typeof bugununTarihi === "string") {
    bugunDate = yerelTarihAyristir(bugununTarihi);
  } else {
    bugunDate = bugununTarihi;
  }

  const bugunStr = yerelTarihDizgisi(bugunDate, 0);

  // 1. Görevlerin tamamlanmış blok dakikalarını hesapla
  const tamamlananDakikaHaritasi = new Map<string, number>();
  mevcutPlanBloklari.forEach((blok) => {
    if (blok.tamamlandi && blok.gorevId) {
      const simdiki = tamamlananDakikaHaritasi.get(blok.gorevId) || 0;
      tamamlananDakikaHaritasi.set(blok.gorevId, simdiki + blok.dakika);
    }
  });

  // 2. Kalan ihtiyaç dakikalarını belirle
  const gorevKalanIhtiyac = new Map<string, number>();
  const gorevIlkIhtiyac = new Map<string, number>();

  gorevler.forEach((gorev) => {
    if (gorev.tamamlandi) return;
    const bitenDk = tamamlananDakikaHaritasi.get(gorev.id) || 0;
    const kalanDk = Math.max(0, Math.round(gorev.tahminiSaat * 60) - bitenDk);
    if (kalanDk > 0) {
      gorevKalanIhtiyac.set(gorev.id, kalanDk);
      gorevIlkIhtiyac.set(gorev.id, kalanDk);
    }
  });

  // Öncelik puanlarını hesapla (bugün referans alınarak)
  const oncelikListesi = tumOncelikleriHesapla(gorevler, dersler, bugunDate);
  const oncelikHaritasi = new Map<string, number>();
  oncelikListesi.forEach((item) => oncelikHaritasi.set(item.gorevId, item.toplam));

  const dersHaritasi = new Map<string, Ders>();
  dersler.forEach((d) => dersHaritasi.set(d.id, d));

  const gorevHaritasi = new Map<string, Gorev>();
  gorevler.forEach((g) => gorevHaritasi.set(g.id, g));

  const yeniBloklar: PlanBlogu[] = [];
  const gunlukHedefDakika = Math.max(0, Math.round((ayarlar.gunlukSaat || 0) * 60));

  // 3. 7 günlük takvim döngüsü
  for (let gunIndeks = 0; gunIndeks < 7; gunIndeks++) {
    const oGununTarihi = yerelTarihDizgisi(bugunDate, gunIndeks);
    const oGununDate = yerelTarihAyristir(oGununTarihi);
    const haftaninGunu = oGununDate.getDay(); // 0: Pazar, 1: Pazartesi ...

    // Çalışma günü değilse bu günü dinlenme günü olarak atla
    if (!ayarlar.calismaGunleri.includes(haftaninGunu)) {
      continue;
    }

    if (gunlukHedefDakika <= 0) {
      continue;
    }

    // O gün için uygun görevleri belirle
    const uygunGorevler = gorevler.filter((gorev) => {
      if (gorev.tamamlandi) return false;
      const kalan = gorevKalanIhtiyac.get(gorev.id) || 0;
      if (kalan <= 0) return false;

      // Gecikmiş görev kuralı: Sadece bugüne (gunIndeks === 0) planlanabilir
      const gecikmis = gorev.sonTarih < bugunStr;
      if (gecikmis) {
        return gunIndeks === 0;
      }

      // Son tarihinden sonraki günlere planlanamaz
      return oGununTarihi <= gorev.sonTarih;
    });

    if (uygunGorevler.length === 0) {
      continue;
    }

    // Öncelik puanına göre sırala
    uygunGorevler.sort((a, b) => {
      const puanA = oncelikHaritasi.get(a.id) || 0;
      const puanB = oncelikHaritasi.get(b.id) || 0;
      return puanB - puanA;
    });

    // Puan toplamı
    const toplamPuan = uygunGorevler.reduce(
      (sum, g) => sum + (oncelikHaritasi.get(g.id) || 1),
      0
    );

    // Orantılı dağıtım ve 5'in katına yuvarlama
    const gunlukGorevPaylari = new Map<string, number>();
    let toplamDagitilanDk = 0;

    uygunGorevler.forEach((g) => {
      const puan = oncelikHaritasi.get(g.id) || 1;
      const hamPay = (puan / (toplamPuan || 1)) * gunlukHedefDakika;
      const kalanIhtiyac = gorevKalanIhtiyac.get(g.id) || 0;

      // İhtiyaçtan fazlasını verme ve 5'in katına yuvarla
      const sinirliPay = Math.min(hamPay, kalanIhtiyac);
      const pay5 = Math.floor(sinirliPay / 5) * 5;

      gunlukGorevPaylari.set(g.id, pay5);
      toplamDagitilanDk += pay5;
    });

    // Yuvarlamadan kalan dakikaları en yüksek öncelikli uygun görevlere 5'er dk olarak aktar
    let kalanDakika = gunlukHedefDakika - toplamDagitilanDk;
    let ilerlemeOldu = true;

    while (kalanDakika >= 5 && ilerlemeOldu) {
      ilerlemeOldu = false;
      for (const g of uygunGorevler) {
        if (kalanDakika < 5) break;
        const oankiPay = gunlukGorevPaylari.get(g.id) || 0;
        const kalanIhtiyac = gorevKalanIhtiyac.get(g.id) || 0;

        if (oankiPay + 5 <= kalanIhtiyac) {
          gunlukGorevPaylari.set(g.id, oankiPay + 5);
          kalanDakika -= 5;
          ilerlemeOldu = true;
        }
      }
    }

    // Her görev için ayrılan süreyi 25-50 dk'lık bloklara böl ve listeye ekle
    uygunGorevler.forEach((g) => {
      const ayrilanDk = gunlukGorevPaylari.get(g.id) || 0;
      if (ayrilanDk <= 0) return;

      const blokDakikalari = dakikayiBloklaraBol(ayrilanDk);
      blokDakikalari.forEach((dk) => {
        yeniBloklar.push({
          id: benzersizId(),
          tarih: oGununTarihi,
          dersId: g.dersId,
          gorevId: g.id,
          dakika: dk,
          tamamlandi: false,
        });
      });

      // Kalan ihtiyacı düş
      const guncelKalan = (gorevKalanIhtiyac.get(g.id) || 0) - ayrilanDk;
      gorevKalanIhtiyac.set(g.id, Math.max(0, guncelKalan));
    });
  }

  // 4. Kapasite Uyarılarının Hesaplanması
  // Bir görevin ihtiyacı son tarihine kadar planlanabilen süreye sığmıyorsa uyarı üretilir
  const kapasiteUyarilari: string[] = [];

  gorevler.forEach((gorev) => {
    if (gorev.tamamlandi) return;
    const ilkIhtiyac = gorevIlkIhtiyac.get(gorev.id);
    if (!ilkIhtiyac || ilkIhtiyac <= 0) return;

    const kalan = gorevKalanIhtiyac.get(gorev.id) || 0;
    // Eğer ihtiyacın bir kısmı son tarihe kadar planlanamadıysa
    if (kalan > 0) {
      const planlanabilenDakika = ilkIhtiyac - kalan;
      const gerekenMetin = sureFormatla(ilkIhtiyac);
      const planlananMetin = sureFormatla(planlanabilenDakika);

      // Görev başlığında ders adı zaten geçmiyorsa ders adını ekle
      const ders = dersHaritasi.get(gorev.dersId);
      const dersAdi = ders ? ders.ad : "";
      const baslikMetni =
        dersAdi && !gorev.baslik.toLowerCase().includes(dersAdi.toLowerCase())
          ? `${dersAdi} - ${gorev.baslik}`
          : gorev.baslik;

      kapasiteUyarilari.push(
        `${baslikMetni} için ${gerekenMetin} gerekiyor, son tarihe kadar planlanabilen süre ${planlananMetin}.`
      );
    }
  });

  return {
    yeniBloklar,
    kapasiteUyarilari,
  };
}
