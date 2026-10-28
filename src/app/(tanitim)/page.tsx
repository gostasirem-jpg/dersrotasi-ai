import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: { absolute: "DersRotası AI - Üniversite Öğrencileri İçin Akıllı Ders Planlayıcısı" }, 
   description:
    "Üniversite öğrencileri için derslerini, ödevlerini ve sınavlarını önceliklendirip günlük çalışma planı oluşturan akıllı ders planlayıcısı.",
};

export default function TanitimPage() {
  return (
    <div className="min-h-screen bg-background text-main flex flex-col justify-between">
      {/* Üst Çubuk */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-bold text-base sm:text-lg tracking-tight text-main">
            DersRotası <span className="text-accent text-xs font-semibold uppercase">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Ana Tanıtım Alanı (Yer Tutucu) */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary shadow-xs">
            <Compass className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-main">
              DersRotası AI
            </h1>
            <p className="text-base sm:text-lg text-muted max-w-md mx-auto leading-relaxed">
              Üniversite öğrencileri için derslerini, ödevlerini ve sınavlarını önceliklendirip günlük çalışma planı oluşturan akıllı ders planlayıcısı.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/panel"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] min-w-[44px] px-6 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-base shadow-sm hover:bg-accent-hover active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <span>Çalışma Planımı Oluştur</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>

      {/* Alt Bilgi */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-muted border-t border-border">
        <p>© 2026 DersRotası AI. Üniversite öğrencileri için akıllı ders planlayıcısı.</p>
      </footer>
    </div>
  );
}
