/**
 * YEREL TARİH YARDIMCILARI
 *
 * "YYYY-MM-DD" dizgilerini UTC kayması yaşamadan tamamen yerel saat diliminde işler.
 * new Date("YYYY-MM-DD") tarayıcılarda UTC saat 00:00 olarak değerlendirildiğinden
 * yerel saat dilimlerinde bir önceki güne kayma hatası yaratabilir.
 */

/**
 * "YYYY-MM-DD" formatındaki metni yerel Date nesnesine dönüştürür.
 * Saat bilgisi yerel 00:00:00.000 olarak ayarlanır.
 */
export function yerelTarihAyristir(tarihDizgisi: string): Date {
  if (!tarihDizgisi || typeof tarihDizgisi !== "string") {
    return new Date();
  }
  const parcalar = tarihDizgisi.split("-").map((p) => parseInt(p, 10));
  const yil = parcalar[0] || new Date().getFullYear();
  const ay = (parcalar[1] || 1) - 1; // JS Date ay indeksi 0-11
  const gun = parcalar[2] || 1;

  return new Date(yil, ay, gun, 0, 0, 0, 0);
}

/**
 * Verilen Date veya gün farkına göre "YYYY-MM-DD" formatında yerel tarih dizesi üretir.
 */
export function yerelTarihDizgisi(tarih: Date = new Date(), gunEkle: number = 0): string {
  const d = new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate() + gunEkle);
  const yil = d.getFullYear();
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return `${yil}-${ay}-${gun}`;
}

/**
 * bugünden kaç gün kaldığını tam sayı olarak verir (bugün = 0, geçmiş = negatif).
 */
export function kalanGun(sonTarihDizgisi: string): number {
  const hedef = yerelTarihAyristir(sonTarihDizgisi);
  const simdi = new Date();
  const bugun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate(), 0, 0, 0, 0);

  const farkMs = hedef.getTime() - bugun.getTime();
  const birGunMs = 1000 * 60 * 60 * 24;

  return Math.round(farkMs / birGunMs);
}

/**
 * Kalan güne göre kullanıcı dostu Türkçe etiket döndürür:
 * - 0: "Bugün"
 * - 1: "Yarın"
 * - > 1: "X gün kaldı"
 * - -1: "1 gün geçti"
 * - < -1: "X gün geçti"
 */
export function kalanGunEtiketi(sonTarihDizgisi: string): string {
  const gun = kalanGun(sonTarihDizgisi);

  if (gun === 0) {
    return "Bugün";
  }
  if (gun === 1) {
    return "Yarın";
  }
  if (gun > 1) {
    return `${gun} gün kaldı`;
  }
  if (gun === -1) {
    return "1 gün geçti";
  }
  return `${Math.abs(gun)} gün geçti`;
}

/**
 * Türkçe tarih biçimi: "30 Ekim 2026, Cuma"
 */
const turkceTarihBicimlendirici = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
});

export function formatTarih(sonTarihDizgisi: string): string {
  if (!sonTarihDizgisi) return "";
  const tarih = yerelTarihAyristir(sonTarihDizgisi);
  return turkceTarihBicimlendirici.format(tarih);
}

/**
 * Kısa Türkçe tarih biçimi: "30 Eki 2026"
 */
const kisaTurkceTarihBicimlendirici = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatKisaTarih(sonTarihDizgisi: string): string {
  if (!sonTarihDizgisi) return "";
  const tarih = yerelTarihAyristir(sonTarihDizgisi);
  return kisaTurkceTarihBicimlendirici.format(tarih);
}
