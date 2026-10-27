import type { VeriDurumu, Ders, Gorev } from "./types";
import { VARSAYILAN_AYARLAR } from "./types";
import { yerelTarihDizgisi } from "./tarih";

/**
 * Dinamik tarihlerle her zaman güncel kalan örnek veri seti üretir.
 */
export function ornekVeriUret(): VeriDurumu {
  const bugun = new Date();

  const ornekDersler: Ders[] = [
    {
      id: "ornek-ders-lineer-cebir",
      ad: "Lineer Cebir",
      kod: "MAT201",
      zorluk: 4,
      renk: "#2563eb", // Mavi
      olusturmaTarihi: bugun.toISOString(),
    },
    {
      id: "ornek-ders-python",
      ad: "Python ile Programlama",
      kod: "CENG101",
      zorluk: 2,
      renk: "#059669", // Zümrüt
      olusturmaTarihi: bugun.toISOString(),
    },
    {
      id: "ornek-ders-istatistik",
      ad: "Olasılık ve İstatistik",
      kod: "MAT205",
      zorluk: 4,
      renk: "#7c3aed", // Mor
      olusturmaTarihi: bugun.toISOString(),
    },
    {
      id: "ornek-ders-yapay-zeka",
      ad: "Operasyonel Yapay Zekâ",
      kod: "AI302",
      zorluk: 3,
      renk: "#ea580c", // Turuncu
      olusturmaTarihi: bugun.toISOString(),
    },
  ];

  const ornekGorevler: Gorev[] = [
    {
      id: "ornek-gorev-quiz-lineer",
      dersId: "ornek-ders-lineer-cebir",
      baslik: "Özdeğerler ve Özvektörler Quiz",
      tur: "quiz",
      sonTarih: yerelTarihDizgisi(bugun, 1), // Yarın
      tahminiSaat: 2,
      tamamlandi: false,
      aciklama: "Matris çarpanlarına ayırma ve karakteristik polinom sorularını kapsar.",
    },
    {
      id: "ornek-gorev-sinav-lineer",
      dersId: "ornek-ders-lineer-cebir",
      baslik: "Lineer Cebir 1. Ara Sınavı",
      tur: "sinav",
      sonTarih: yerelTarihDizgisi(bugun, 4), // 4 gün sonra
      tahminiSaat: 8,
      tamamlandi: false,
      aciklama: "Vektör uzayları, taban değişimi ve Gauss eliminasyonu konuları dahil.",
    },
    {
      id: "ornek-gorev-odev-python",
      dersId: "ornek-ders-python",
      baslik: "Veri Yapıları & Nesne Yönelimli Kodlama",
      tur: "odev",
      sonTarih: yerelTarihDizgisi(bugun, 7), // 7 gün sonra
      tahminiSaat: 4,
      tamamlandi: false,
      aciklama: "Python sınıfları ve özel metotlar (dunder) ile kütüphane yönetim sistemi kurma.",
    },
    {
      id: "ornek-gorev-sinav-istatistik",
      dersId: "ornek-ders-istatistik",
      baslik: "Olasılık ve Dağılımlar Vizesi",
      tur: "sinav",
      sonTarih: yerelTarihDizgisi(bugun, 10), // 10 gün sonra
      tahminiSaat: 10,
      tamamlandi: false,
      aciklama: "Koşullu olasılık, Bayes teoremi, Poisson ve Normal dağılım hesaplamaları.",
    },
    {
      id: "ornek-gorev-odev-yapay-zeka",
      dersId: "ornek-ders-yapay-zeka",
      baslik: "Model Eğitimi ve Performans Değerlendirme",
      tur: "odev",
      sonTarih: yerelTarihDizgisi(bugun, 14), // 14 gün sonra
      tahminiSaat: 6,
      tamamlandi: false,
      aciklama: "F1 skoru, karışıklık matrisi ve hiperparametre optimizasyonu raporu.",
    },
    {
      id: "ornek-gorev-proje-python",
      dersId: "ornek-ders-python",
      baslik: "Dönem Sonu Veri Analizi Projesi (Faz 1)",
      tur: "proje",
      sonTarih: yerelTarihDizgisi(bugun, 18), // 18 gün sonra
      tahminiSaat: 12,
      tamamlandi: false,
      aciklama: "Pandas ve Matplotlib kullanarak gerçek veri seti üzerinde keşifçi veri analizi.",
    },
  ];

  return {
    surum: 1,
    dersler: ornekDersler,
    gorevler: ornekGorevler,
    ayarlar: VARSAYILAN_AYARLAR,
    planBloklari: [],
    oturumlar: [],
  };
}

/**
 * Mevcut verinin örnek veri seti olup olmadığını belirler.
 */
export function ornekVeriMi(dersler: Ders[]): boolean {
  if (dersler.length === 0) return false;
  return dersler.some((d) => d.id.startsWith("ornek-ders-"));
}
