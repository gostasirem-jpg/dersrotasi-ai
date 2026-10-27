export type ZorlukDerecesi = 1 | 2 | 3 | 4 | 5;

export type GorevTuru = "sinav" | "odev" | "proje" | "quiz";

export interface Ders {
  id: string;
  ad: string;
  kod?: string;
  zorluk: ZorlukDerecesi;
  renk: string; // Hex renk kodu örn: #3b82f6
  olusturmaTarihi: string; // ISO dizesi
}

export interface Gorev {
  id: string;
  dersId: string;
  baslik: string;
  tur: GorevTuru;
  sonTarih: string; // "YYYY-MM-DD"
  tahminiSaat: number;
  tamamlandi: boolean;
  aciklama?: string;
}

export interface Ayarlar {
  gunlukSaat: number;
  calismaGunleri: number[]; // 0: Pazar, 1: Pazartesi ... 6: Cumartesi
}

export interface PlanBlogu {
  id: string;
  tarih: string; // "YYYY-MM-DD"
  dersId: string;
  gorevId?: string;
  dakika: number;
  tamamlandi: boolean;
}

export interface CalismaOturumu {
  id: string;
  dersId: string;
  tarih: string; // "YYYY-MM-DD"
  dakika: number;
}

export interface VeriDurumu {
  surum: 1;
  dersler: Ders[];
  gorevler: Gorev[];
  ayarlar: Ayarlar;
  planBloklari: PlanBlogu[];
  oturumlar: CalismaOturumu[];
}

export const VARSAYILAN_AYARLAR: Ayarlar = {
  gunlukSaat: 3,
  calismaGunleri: [0, 1, 2, 3, 4, 5, 6], // Tüm günler
};

export const VARSAYILAN_VERI: VeriDurumu = {
  surum: 1,
  dersler: [],
  gorevler: [],
  ayarlar: VARSAYILAN_AYARLAR,
  planBloklari: [],
  oturumlar: [],
};

// Sabit Renk Paleti
export interface RenkSecenegi {
  hex: string;
  ad: string;
  aciklama: string;
}

export const DERS_RENK_PALETI: RenkSecenegi[] = [
  { hex: "#2563eb", ad: "Mavi", aciklama: "Klasik Mavi" },
  { hex: "#059669", ad: "Zümrüt", aciklama: "Zümrüt Yeşili" },
  { hex: "#7c3aed", ad: "Mor", aciklama: "Kraliyet Moru" },
  { hex: "#ea580c", ad: "Turuncu", aciklama: "Sıcak Turuncu" },
  { hex: "#db2777", ad: "Gül Kurusu", aciklama: "Pembe / Gül Kurusu" },
  { hex: "#0891b2", ad: "Camgöbeği", aciklama: "Teal / Camgöbeği" },
  { hex: "#d97706", ad: "Kehribar", aciklama: "Kehribar Sarısı" },
  { hex: "#4f46e5", ad: "İndigo", aciklama: "Derin İndigo" },
];

export const ZORLUK_METINLERI: Record<ZorlukDerecesi, string> = {
  1: "Çok Kolay",
  2: "Kolay",
  3: "Orta",
  4: "Zor",
  5: "Çok Zor",
};

export const GOREV_TURU_METINLERI: Record<GorevTuru, string> = {
  sinav: "Sınav",
  odev: "Ödev",
  proje: "Proje",
  quiz: "Quiz",
};
