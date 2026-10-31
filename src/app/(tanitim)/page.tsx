import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BarChart3, BookOpen, CalendarDays, Check, Clock,
  Compass, ExternalLink, ListChecks, MessageSquare, ShieldCheck, SlidersHorizontal,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: { absolute: "DersRotası AI - Üniversite Öğrencileri İçin Akıllı Ders Planlayıcısı" },
  description:
    "Üniversite öğrencileri için derslerini, ödevlerini ve sınavlarını önceliklendirip günlük çalışma planı oluşturan akıllı ders planlayıcısı.",
};

const odak = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const anaButon = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-center text-sm font-bold text-primary dark:text-background hover:bg-accent-hover ${odak}`;
const baslik = "text-2xl font-bold tracking-tight text-main sm:text-3xl";

const adimlar = [
  { baslik: "Derslerini ve zorluklarını ekle", aciklama: "Her ders için 1–5 arasında bir zorluk seviyesi belirle." },
  { baslik: "Ödev ve sınavlarını son tarihleriyle gir", aciklama: "Görev türünü, son tarihini ve tahmini çalışma süresini ekle." },
  { baslik: "Günlük süreni belirle, 7 günlük planını al", aciklama: "Kural tabanlı planlayıcı, önceliklere ve ayırabildiğin süreye göre çalışma blokları oluştursun." },
];

const ozellikler = [
  { ikon: BookOpen, baslik: "Ders ve görev yönetimi", aciklama: "Derslerini, ödevlerini, sınavlarını, projelerini ve quizlerini tek yerde takip et." },
  { ikon: SlidersHorizontal, baslik: "Açıklanabilir öncelik puanı", aciklama: "Zorluk, son tarihe kalan süre ve görev türünün önceliği nasıl etkilediğini gerekçeleriyle gör." },
  { ikon: ListChecks, baslik: "7 günlük akıllı plan", aciklama: "Kural tabanlı algoritmayla 25–50 dakikalık bloklar oluştur; süre yetmediğinde kapasite uyarılarını gör. Kalan son ihtiyaç için daha kısa bir blok oluşabilir." },
  { ikon: CalendarDays, baslik: "Takvim görünümü", aciklama: "Görevlerinin son tarihlerini ve çalışma bloklarını takvim üzerinde birlikte incele." },
  { ikon: BarChart3, baslik: "Panel ve istatistikler", aciklama: "Girdiğin görevlerden ve kaydettiğin çalışma oturumlarından hesaplanan hedeflerini, tamamlanma durumunu ve çalışma sürelerini gör." },
  { ikon: MessageSquare, baslik: "Gemini destekli asistan", aciklama: "Asistan sayfasında ders ve görev özetine göre öneri al. Gemini anahtarı yoksa veya hizmete ulaşılamazsa yedek kural tabanlı sistem devreye girer." },
];

const ornekBloklar = [
  { ders: "Matematik", gorev: "Vizeye hazırlık", sure: "50 dk", renk: "border-l-primary" },
  { ders: "Programlama", gorev: "Proje çalışması", sure: "40 dk", renk: "border-l-success" },
  { ders: "İstatistik", gorev: "Ödev soruları", sure: "30 dk", renk: "border-l-warning" },
];

function PlanButonu() {
  return (
    <Link href="/panel" className={anaButon}>
      Çalışma Planımı Oluştur
      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </Link>
  );
}

export default function TanitimPage() {
  return (
    <div className="min-h-screen bg-background text-main">
      <a href="#ana-icerik" className={`sr-only z-50 rounded-xl bg-surface p-3 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 ${odak}`}>
        Ana içeriğe geç
      </a>
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-3 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="DersRotası AI ana sayfa" className={`inline-flex min-h-11 items-center gap-2 rounded-lg ${odak}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-tight sm:text-lg">DersRotası <span className="text-primary">AI</span></span>
          </Link>
          <nav aria-label="Sayfa bölümleri" className="hidden items-center gap-5 text-sm font-medium text-muted lg:flex">
            <a href="#nasil-calisir" className={`inline-flex min-h-11 items-center rounded-lg hover:text-main ${odak}`}>Nasıl çalışır</a>
            <a href="#ozellikler" className={`inline-flex min-h-11 items-center rounded-lg hover:text-main ${odak}`}>Özellikler</a>
            <a href="#gizlilik" className={`inline-flex min-h-11 items-center rounded-lg hover:text-main ${odak}`}>Gizlilik</a>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link href="/panel" className={`inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover sm:px-4 sm:text-sm ${odak}`}>
              Uygulamayı aç
            </Link>
          </div>
        </div>
      </header>

      <main id="ana-icerik" className="mx-auto max-w-6xl px-4 sm:px-6">
        <section aria-labelledby="hero-baslik" className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:py-24">
          <div className="min-w-0">
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-primary">Derslerin belli. Sıradaki adımın da belli olsun.</p>
            <h1 id="hero-baslik" className="max-w-xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Bugün hangi derse kaç dakika çalışacağını bil
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Derslerini, ödevlerini ve sınavlarını bir araya getir. Günlük ayırabildiğin süreye göre önceliklerini gör, 7 günlük çalışma planını oluştur.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PlanButonu />
              <a href="#nasil-calisir" className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold hover:bg-surface-hover ${odak}`}>Nasıl çalışır?</a>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              Hesap açmadan, kendi tarayıcında başla.
            </p>
          </div>

          <figure className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
            <figcaption className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <span className="inline-flex items-center gap-2 text-sm font-bold"><Compass className="h-5 w-5 text-primary" aria-hidden="true" /> Günlük çalışma planı</span>
              <span className="rounded-md border border-border bg-surface-hover px-2 py-1 text-xs font-medium text-muted">Örnek görünüm</span>
            </figcaption>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><h2 className="text-xl font-bold tracking-tight">Bugünün planı</h2><p className="mt-1 text-xs text-muted">Örnek dersler ve çalışma süreleri</p></div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="h-5 w-5" aria-hidden="true" /></span>
            </div>
            <ol className="space-y-3">
              {ornekBloklar.map((blok, index) => (
                <li key={blok.ders} className={`flex items-center gap-3 rounded-xl border border-border border-l-4 bg-background p-4 ${blok.renk}`}>
                  <span className="text-xs font-semibold tabular-nums text-muted">0{index + 1}</span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-bold">{blok.ders}</p><p className="mt-1 text-xs text-muted">{blok.gorev}</p></div>
                  <span className="shrink-0 rounded-lg bg-surface-hover px-2 py-1 text-xs font-semibold tabular-nums">{blok.sure}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 flex items-center gap-2 text-xs leading-relaxed text-muted"><Clock className="h-4 w-4 shrink-0" aria-hidden="true" /> Bu örnekte toplam 120 dakika çalışma planlandı.</p>
          </figure>
        </section>

        <section aria-labelledby="sorun-baslik" className="grid gap-5 border-y border-border py-10 md:grid-cols-[1fr_1.4fr] md:gap-12">
          <h2 id="sorun-baslik" className={baslik}>Hangi sorunu çözüyor?</h2>
          <div className="space-y-3 text-base leading-relaxed text-muted">
            <p>Bir dersin ödevi, diğerinin sınavı derken son tarihler farklı yerlerde kalabiliyor. Sınav haftasında hangi derse ne kadar zaman ayıracağını seçmek de ayrı bir iş oluyor.</p>
            <p>DersRotası, görevlerini aynı yerde görmeni ve sınırlı çalışma süreni öncelik sırasına göre planlamanı sağlar.</p>
          </div>
        </section>

        <section id="nasil-calisir" aria-labelledby="adimlar-baslik" className="scroll-mt-6 py-14 sm:py-20">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Önce bilgilerin, sonra planın</p>
          <h2 id="adimlar-baslik" className={baslik}>Nasıl çalışır?</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {adimlar.map((adim, index) => (
              <li key={adim.baslik} className="min-w-0 border-t border-border pt-5">
                <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">0{index + 1}</span>
                <h3 className="text-lg font-bold leading-snug tracking-tight">{adim.baslik}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{adim.aciklama}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="ozellikler" aria-labelledby="ozellikler-baslik" className="scroll-mt-6 border-t border-border py-14 sm:py-20">
          <h2 id="ozellikler-baslik" className={baslik}>Planlamak ve takip etmek için</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">Derslerini eklediğin andan çalışma bloklarını tamamladığın ana kadar kullanabileceğin özellikler.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ozellikler.map(({ ikon: Ikon, baslik: kartBaslik, aciklama }) => (
              <article key={kartBaslik} className="min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Ikon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="text-lg font-bold tracking-tight">{kartBaslik}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{aciklama}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted">Plan oluşturma kural tabanlıdır. Yapay zekâ yalnızca Asistan sayfasındaki Gemini önerilerinde kullanılır.</p>
        </section>

        <section aria-labelledby="puan-baslik" className="rounded-2xl border border-border bg-surface p-5 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 id="puan-baslik" className={baslik}>Öncelik puanı nasıl hesaplanır?</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">Her görev, dersin zorluğuna, son tarihe kalan gün sayısına ve görev türüne göre 100 üzerinden puan alır. Aşağıdaki değerler her bileşenin en yüksek katkısıdır.</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"><SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" /> Bu kısımda yapay zekâ kullanılmaz.</p>
            </div>
            <div className="min-w-0">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[{ ad: "Zorluk", puan: 30 }, { ad: "Aciliyet", puan: 50 }, { ad: "Tür", puan: 20 }].map((bilesen) => (
                  <div key={bilesen.ad} className="rounded-xl border border-border bg-background px-2 py-4"><p className="text-xs font-medium text-muted">{bilesen.ad}</p><p className="mt-2 text-2xl font-extrabold tabular-nums">{bilesen.puan}</p></div>
                ))}
              </div>
              <p className="mt-3 text-center text-sm font-semibold">30 + 50 + 20 = 100 üzerinden puan</p>
              <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">
                <p className="font-semibold">Örnek: zorluk 4/5, 3 gün kalmış bir sınav</p>
                <p className="mt-2 text-muted">Zorluk: 24 + aciliyet: yaklaşık 39,29 + tür: 20. Toplam en yakın tam sayıya yuvarlanır: <strong className="text-main">83 puan</strong>.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="gizlilik" aria-labelledby="gizlilik-baslik" className="grid scroll-mt-6 gap-8 py-14 sm:py-20 md:grid-cols-[1fr_1.4fr] md:gap-12">
          <div>
            <ShieldCheck className="mb-4 h-8 w-8 text-primary" aria-hidden="true" />
            <h2 id="gizlilik-baslik" className={baslik}>Verilerin nerede?</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">Hesap gerekmez. Ders ve görev verilerin yalnızca kullandığın tarayıcının LocalStorage alanında saklanır.</p>
          </div>
          <ul className="space-y-5 text-sm leading-relaxed text-muted">
            <li className="border-b border-border pb-5"><strong className="block text-base font-bold text-main">Kayıt bu tarayıcıya aittir.</strong><span className="mt-1 block">Veriler cihazlar arasında senkronize edilmez. Tarayıcı verilerini temizlersen kayıtların da silinir.</span></li>
            <li className="border-b border-border pb-5"><strong className="block text-base font-bold text-main">Asistan kullanırken bir özet gönderilir.</strong><span className="mt-1 block">Öneri almak için yalnızca ders/görev özeti ve varsa yazdığın soru sunucuya, Gemini kullanılabiliyorsa Gemini’ye gönderilir. Görev açıklamaları ve çalışma geçmişi gönderilmez.</span></li>
            <li><strong className="block text-base font-bold text-main">Kimlik bilgisi gönderilmez.</strong><span className="mt-1 block">Uygulama kimlik veya iletişim bilgisi eklemez. Ders, görev ve soru metinlerine kişisel bilgi yazmamalısın.</span></li>
          </ul>
        </section>

        <section aria-labelledby="kitle-baslik" className="grid gap-5 border-t border-border py-10 md:grid-cols-[1fr_1.4fr] md:gap-12">
          <h2 id="kitle-baslik" className={baslik}>Kimler için?</h2>
          <p className="text-base leading-relaxed text-muted">Birden fazla ders alan, sınav haftalarında zamanını planlamakta zorlanan üniversite öğrencileri için. Günlük ne kadar çalışabileceğini belirleyip derslerini bu süreye göre sıraya koymak isteyenler için.</p>
        </section>

        <section aria-labelledby="cagri-baslik" className="my-8 rounded-2xl border border-border bg-surface px-5 py-10 text-center sm:mb-16 sm:px-8 sm:py-14">
          <h2 id="cagri-baslik" className={baslik}>Bir sonraki çalışma adımını belirle.</h2>
          <p className="mx-auto mb-6 mt-3 max-w-lg leading-relaxed text-muted">Derslerini ekle, ayırabileceğin süreyi seç ve planını oluştur.</p>
          <PlanButonu />
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center">
          <p className="max-w-2xl text-xs leading-relaxed text-muted">YZO 205 Operasyonel Yapay Zekâ dersi kapsamında geliştirilmiş bir öğrenci projesidir.</p>
          <a href="https://github.com/gostasirem-jpg/dersrotasi-ai" target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-muted hover:text-main ${odak}`}>
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> GitHub <span className="sr-only">(yeni sekmede açılır)</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
