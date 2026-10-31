import type { AsistanOzeti } from "./kuralTabanliOneri";

function nesne(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function metin(v: unknown, sinir: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= sinir;
}
function tarih(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

export function asistanGirdisiniDogrula(v: unknown): { soru?: string; ozet: AsistanOzeti } | null {
  if (!nesne(v) || (v.soru !== undefined && (typeof v.soru !== "string" || v.soru.length > 500))) return null;
  const o = v.ozet;
  if (!nesne(o) || !tarih(o.bugun) || typeof o.gunlukSaat !== "number" || !Number.isFinite(o.gunlukSaat) || o.gunlukSaat < 0 || o.gunlukSaat > 24) return null;
  if (!Array.isArray(o.dersler) || o.dersler.length > 30 || !Array.isArray(o.gorevler) || o.gorevler.length > 100) return null;
  for (const d of o.dersler) {
    if (!nesne(d) || !metin(d.ad, 200) || typeof d.zorluk !== "number" || !Number.isInteger(d.zorluk) || d.zorluk < 1 || d.zorluk > 5) return null;
  }
  for (const g of o.gorevler) {
    if (!nesne(g) || !metin(g.baslik, 300) || !tarih(g.sonTarih) || !["sinav", "odev", "proje", "quiz"].includes(String(g.tur)) || typeof g.tur !== "string" || typeof g.dersIndex !== "number" || !Number.isInteger(g.dersIndex) || g.dersIndex < 0 || g.dersIndex >= o.dersler.length || typeof g.tahminiSaat !== "number" || !Number.isFinite(g.tahminiSaat) || g.tahminiSaat <= 0 || g.tahminiSaat > 10000) return null;
  }
  // Yalnızca izin verilen alanları yeniden oluştur; fazladan alanlar sağlayıcıya gitmez.
  return {
    soru: typeof v.soru === "string" ? v.soru.trim() : undefined,
    ozet: {
      bugun: o.bugun, gunlukSaat: o.gunlukSaat,
      dersler: o.dersler.map((d) => ({ ad: d.ad, zorluk: d.zorluk })),
      gorevler: o.gorevler.map((g) => ({ dersIndex: g.dersIndex, baslik: g.baslik, tur: g.tur, sonTarih: g.sonTarih, tahminiSaat: g.tahminiSaat })),
    },
  };
}
