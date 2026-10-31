import { gorevOncelikHesapla, hesaplaKalanGun } from "./oncelik";
import type { Ders, Gorev, GorevTuru, ZorlukDerecesi } from "./types";

export interface AsistanOzeti {
  bugun: string;
  gunlukSaat: number;
  dersler: { ad: string; zorluk: ZorlukDerecesi }[];
  gorevler: { dersIndex: number; baslik: string; tur: GorevTuru; sonTarih: string; tahminiSaat: number }[];
}

export interface AsistanYaniti {
  kaynak: "gemini" | "kural";
  metin: string;
  uyari?: string;
}

/** Saat veya depoya erişmez; aynı özet her zaman aynı öneriyi üretir. */
export function kuralTabanliOneri(ozet: AsistanOzeti): string {
  const dersler: Ders[] = ozet.dersler.map((d, i) => ({ ...d, id: String(i), renk: "", olusturmaTarihi: "" }));
  const sirali = ozet.gorevler.map((g, i) => {
    const gorev: Gorev = { ...g, id: String(i), dersId: String(g.dersIndex), tamamlandi: false };
    return { ...g, gun: hesaplaKalanGun(g.sonTarih, ozet.bugun), puan: gorevOncelikHesapla(gorev, dersler[g.dersIndex], ozet.bugun).toplam };
  }).sort((a, b) => b.puan - a.puan || a.sonTarih.localeCompare(b.sonTarih));
  const maddeler: string[] = [];
  const sinav = sirali.find((g) => g.tur === "sinav" && g.gun >= 0 && g.gun < 3);
  if (sinav) maddeler.push(`“${sinav.baslik}” sınavına ${sinav.gun === 0 ? "bugün girilecek" : `${sinav.gun} gün kaldı`}; ilk önceliği bu sınavın tekrarına ver.`);
  const geciken = sirali.filter((g) => g.gun < 0);
  if (geciken.length) maddeler.push(`${geciken.length} görevin son tarihi geçmiş. “${geciken[0].baslik}” için bugün bir blok ayırmayı ve teslim durumunu kontrol etmeyi düşün.`);
  if (sirali.length) {
    const ilk = sirali[0];
    maddeler.push(`Mevcut öncelik puanına göre “${ilk.baslik}” ${ilk.puan}/100 puanla önde. Tahmini ${ilk.tahminiSaat} saatlik işi küçük bloklara böl.`);
    const zor = sirali.find((g) => dersler[g.dersIndex].zorluk >= 4);
    if (zor) maddeler.push(`Zorluğu ${dersler[zor.dersIndex].zorluk}/5 olan “${dersler[zor.dersIndex].ad}” dersini günün ilk çalışma bloğuna almayı dene.`);
    // Her son tarih için birikimli ihtiyacı karşılaştır; uzak tarih erken sıkışıklığı gizlemesin.
    const tariheGore = [...sirali].sort((a, b) => a.sonTarih.localeCompare(b.sonTarih));
    let toplam = 0;
    const yetersiz = tariheGore.find((g) => {
      toplam += g.tahminiSaat;
      return toplam > ozet.gunlukSaat * Math.max(1, g.gun + 1);
    });
    if (yetersiz) maddeler.push(`Her gün ${ozet.gunlukSaat} saat çalışsan bile ${yetersiz.sonTarih} tarihine kadarki tahmini ${toplam} saatlik ihtiyaç bu süreyi aşıyor. Günlük süreyi artırmayı veya görevleri önceliklendirmeyi düşün.`);
    else maddeler.push(`Her gün ${ozet.gunlukSaat} saat çalışma varsayımıyla, girilen tahmini süreler son tarihlere kadar ayrılabilecek süreye sığıyor görünüyor; bu, yetiştirme garantisi değildir.`);
  } else {
    maddeler.push("Tamamlanmamış görev yok. Derslerine sınav, ödev veya proje ekleyerek somut bir çalışma listesi oluştur.");
    maddeler.push("Görev eklerken son tarihi ve tahmini çalışma süresini belirt; öncelik hesabı bu bilgilere dayanır.");
  }
  maddeler.push(`Günlük ${ozet.gunlukSaat} saatlik hedefini kısa molalar içeren çalışma bloklarına ayırmayı dene.`);
  maddeler.push("Günün sonunda ilerlemeni kontrol et; tahmini süreleri ve sonraki günün önceliklerini gerekirse güncelle.");
  return maddeler.slice(0, 8).map((m) => `- ${m}`).join("\n");
}
