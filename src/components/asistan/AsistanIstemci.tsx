"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { LoaderCircle, Sparkles } from "lucide-react";
import { useVeriDeposu } from "@/lib/store";
import { yerelTarihDizgisi } from "@/lib/tarih";
import { GOREV_TURU_METINLERI } from "@/lib/types";
import { kuralTabanliOneri, type AsistanOzeti, type AsistanYaniti } from "@/lib/kuralTabanliOneri";
import { YukleniyorIskeleti } from "@/components/YukleniyorIskeleti";

const abonelikYok = () => () => {};
const sorular = ["Bu hafta nasıl çalışmalıyım?", "En acil işim ne?", "Zamanım yetecek mi?"];
const odak = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const kart = "min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6";

function YanitMetni({ metin }: { metin: string }) {
  const satirlar = metin.split(/\r?\n/);
  const bolumler = [];
  for (let i = 0; i < satirlar.length; i++) {
    if (/^[-*] /.test(satirlar[i])) {
      const maddeler = [];
      const baslangic = i;
      while (i < satirlar.length && /^[-*] /.test(satirlar[i])) {
        maddeler.push(<li key={i} className="whitespace-pre-wrap">{satirlar[i].slice(2)}</li>);
        i++;
      }
      i--;
      bolumler.push(<ul key={baslangic} className="list-disc space-y-2 pl-5">{maddeler}</ul>);
    } else if (satirlar[i].trim()) {
      bolumler.push(<p key={i} className="whitespace-pre-wrap">{satirlar[i]}</p>);
    }
  }
  return <div className="space-y-3 text-sm leading-relaxed [overflow-wrap:anywhere]">{bolumler}</div>;
}

export function AsistanIstemci() {
  const { dersler, gorevler, ayarlar, yuklendi } = useVeriDeposu();
  const bugun = useSyncExternalStore(abonelikYok, () => yerelTarihDizgisi(), () => null);
  const [soru, setSoru] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const istekSuruyor = useRef(false);
  const [yanit, setYanit] = useState<AsistanYaniti | null>(null);
  const [hata, setHata] = useState("");

  if (!yuklendi || !bugun) return <YukleniyorIskeleti baslik="Asistan yükleniyor..." adet={2} />;
  if (dersler.length === 0) return (
    <div className={kart}>
      <h2 className="font-semibold">Öneri almak için bir ders ekle</h2>
      <p className="mt-2 text-sm text-muted">Asistan önerilerini derslerine ve görevlerine göre hazırlar.</p>
      <Link href="/dersler" className={`mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground ${odak}`}>Dersler sayfasına git</Link>
    </div>
  );

  const ozet: AsistanOzeti = {
    bugun, gunlukSaat: ayarlar.gunlukSaat,
    dersler: dersler.map((d) => ({ ad: d.ad, zorluk: d.zorluk })),
    gorevler: gorevler.filter((g) => !g.tamamlandi).map((g) => ({
      dersIndex: dersler.findIndex((d) => d.id === g.dersId),
      baslik: g.baslik, tur: g.tur, sonTarih: g.sonTarih, tahminiSaat: g.tahminiSaat,
    })),
  };
  const sinirAsildi = ozet.dersler.length > 30 || ozet.gorevler.length > 100;

  async function oneriAl() {
    if (istekSuruyor.current || sinirAsildi) return;
    istekSuruyor.current = true;
    setBekliyor(true);
    setHata("");
    setYanit(null);
    const kontrol = new AbortController();
    const zamanlayici = setTimeout(() => kontrol.abort(), 25000);
    try {
      const cevap = await fetch("/api/asistan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soru, ozet }), signal: kontrol.signal,
      });
      if (!cevap.ok) {
        setHata("İstek tamamlanamadı. En fazla 30 ders ve 100 görev gönderebilirsin; ders, görev ve süre bilgilerini kontrol edip yeniden dene.");
        return;
      }
      const veri: unknown = await cevap.json();
      if (!veri || typeof veri !== "object" || !("kaynak" in veri) || !("metin" in veri) || (veri.kaynak !== "gemini" && veri.kaynak !== "kural") || typeof veri.metin !== "string" || ("uyari" in veri && typeof veri.uyari !== "string")) throw new Error();
      setYanit(veri as AsistanYaniti);
    } catch {
      setYanit({ kaynak: "kural", metin: kuralTabanliOneri(ozet), uyari: "Sunucuya ulaşılamadı. Cihazındaki verilerle kural tabanlı öneriler hazırlandı; serbest sorun bu önerilerde değerlendirilmez." });
    } finally {
      clearTimeout(zamanlayici);
      istekSuruyor.current = false;
      setBekliyor(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      <section className={kart} aria-labelledby="gonderilen-veriler">
        <h2 id="gonderilen-veriler" className="text-lg font-semibold">Gönderilecek veriler</h2>
        <p className="mt-2 text-sm text-muted">Bu özet ve yazarsan sorun, öneri almak için sunucuya; hizmet kullanılabiliyorsa Gemini’ye gönderilir. Kimlik ve iletişim bilgilerin gönderilmez. Ders, görev veya soru metnine kişisel bilgi yazma.</p>
        <p className="mt-2 text-sm">Günlük çalışma süresi: <strong>{ozet.gunlukSaat} saat</strong> · Bugün: {bugun}</p>
        <details className="mt-3 text-sm">
          <summary className={`cursor-pointer rounded py-2 ${odak}`}>Dersleri ({ozet.dersler.length}) ve tamamlanmamış görevleri ({ozet.gorevler.length}) incele</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 [overflow-wrap:anywhere]">
            {ozet.dersler.map((d, i) => <li key={i}>{d.ad} — zorluk {d.zorluk}/5</li>)}
          </ul>
          {ozet.gorevler.length ? <ul className="mt-3 list-disc space-y-2 pl-5 [overflow-wrap:anywhere]">
            {ozet.gorevler.map((g, i) => <li key={i}>{g.baslik} · {ozet.dersler[g.dersIndex]?.ad} · {GOREV_TURU_METINLERI[g.tur]} · {g.sonTarih} · tahmini {g.tahminiSaat} saat</li>)}
          </ul> : <p className="mt-2 text-muted">Tamamlanmamış görev yok.</p>}
        </details>
        <p className="mt-3 text-xs text-muted">Görev açıklamaları, tamamlanmış görevler ve çalışma geçmişi gönderilmez. Görevlerin hangi derse ait olduğu özete dahildir.</p>
      </section>

      <form className={`${kart} space-y-4`} onSubmit={(e) => { e.preventDefault(); void oneriAl(); }} aria-busy={bekliyor}>
        <h2 className="text-lg font-semibold">Çalışma önerisi al</h2>
        <div className="flex flex-wrap gap-2">
          {sorular.map((s) => <button key={s} type="button" disabled={bekliyor} aria-pressed={soru === s} onClick={() => setSoru(s)} className={`min-h-11 max-w-full rounded-xl border px-3 py-2 text-left text-sm disabled:opacity-50 ${soru === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-hover"} ${odak}`}>{s}</button>)}
        </div>
        <div>
          <label htmlFor="asistan-soru" className="mb-2 block text-sm font-medium">Soru (isteğe bağlı)</label>
          <textarea id="asistan-soru" value={soru} onChange={(e) => setSoru(e.target.value)} maxLength={500} rows={3} disabled={bekliyor} aria-describedby="soru-sayaci" placeholder="Boş bırakırsan genel çalışma önerisi hazırlanır." className={`block w-full min-w-0 resize-y rounded-xl border border-border bg-background p-3 text-sm disabled:opacity-50 ${odak}`} />
          <p id="soru-sayaci" className="mt-1 text-right text-xs text-muted">{soru.length}/500 karakter</p>
        </div>
        {sinirAsildi && <p role="alert" className="text-sm text-warning">Bir istekte en fazla 30 ders ve 100 tamamlanmamış görev gönderilebilir. Veriler bu sınırı aşıyor.</p>}
        <button type="submit" disabled={bekliyor || sinirAsildi} className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 sm:w-auto ${odak}`}>
          {bekliyor ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
          {bekliyor ? "Öneri hazırlanıyor..." : "Öneri al"}
        </button>
      </form>
      <div aria-live="polite" aria-atomic="true">
        {hata && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">{hata}</p>}
        {yanit && <section className={`${kart} space-y-4`} aria-labelledby="asistan-yanit">
          <h2 id="asistan-yanit" className="text-lg font-semibold">Çalışma önerilerin</h2>
          <span className={`inline-block max-w-full rounded-lg px-3 py-2 text-sm font-semibold ${yanit.kaynak === "gemini" ? "bg-primary/10 text-primary" : "border border-warning/40 bg-warning/10 text-main"}`}>
            {yanit.kaynak === "gemini" ? "Gemini ile üretildi" : "Kural tabanlı öneri – yapay zekâ değil"}
          </span>
          {yanit.uyari && <p className="text-sm text-muted [overflow-wrap:anywhere]">{yanit.uyari}</p>}
          {yanit.kaynak === "kural" && <p className="text-xs text-muted">Bu öneriler ders ve görev kurallarına dayanır; serbest sorunu yorumlamaz.</p>}
          <YanitMetni metin={yanit.metin} />
        </section>}
      </div>
      <p className="text-xs text-muted">Yapay zekâ önerileri hatalı olabilir; kararları kendi değerlendirmenle ver.</p>
    </div>
  );
}
