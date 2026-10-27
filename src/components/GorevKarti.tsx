"use client";

import { useState } from "react";
import {
  Check,
  Calendar,
  Clock,
  AlertTriangle,
  Edit3,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Gorev, Ders } from "@/lib/types";
import { GOREV_TURU_METINLERI } from "@/lib/types";
import { kalanGun, kalanGunEtiketi, formatTarih } from "@/lib/tarih";

interface GorevKartiProps {
  gorev: Gorev;
  ders?: Ders;
  onTamamlandiDegistir: (id: string) => void;
  onDuzenle: (gorev: Gorev) => void;
  onSil: (gorev: Gorev) => void;
}

export function GorevKarti({
  gorev,
  ders,
  onTamamlandiDegistir,
  onDuzenle,
  onSil,
}: GorevKartiProps) {
  const [aciklamaGoster, setAciklamaGoster] = useState(false);

  const gunFarki = kalanGun(gorev.sonTarih);
  const gecikmis = gunFarki < 0 && !gorev.tamamlandi;
  const bugun = gunFarki === 0 && !gorev.tamamlandi;

  // Tür rozeti stili
  const turRozetStili = {
    sinav: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    odev: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    proje: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    quiz: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  }[gorev.tur];

  return (
    <article
      className={`group relative rounded-2xl border transition-all p-4 sm:p-5 flex flex-col justify-between ${
        gorev.tamamlandi
          ? "bg-surface/60 border-border opacity-75"
          : gecikmis
          ? "bg-red-500/5 border-danger/40 shadow-xs"
          : bugun
          ? "bg-amber-500/5 border-warning/40 shadow-xs"
          : "bg-surface border-border hover:border-text-muted/40 hover:shadow-xs"
      }`}
    >
      <div className="space-y-3">
        {/* Üst Satır: Onay Kutusu + Başlık + Ders Rozeti + İşlem Butonları */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Tamamlandı Onay Kutusu (Erişilebilir ve en az 44px dokunma alanı) */}
            <button
              type="button"
              role="checkbox"
              aria-checked={gorev.tamamlandi}
              aria-label={`"${gorev.baslik}" görevini ${
                gorev.tamamlandi ? "tamamlanmadı olarak işaretle" : "tamamlandı olarak işaretle"
              }`}
              onClick={() => onTamamlandiDegistir(gorev.id)}
              className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent ${
                gorev.tamamlandi
                  ? "text-success hover:opacity-80"
                  : "text-muted hover:text-main"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  gorev.tamamlandi
                    ? "bg-success border-success text-white"
                    : "border-border bg-background hover:border-primary"
                }`}
              >
                {gorev.tamamlandi && (
                  <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                )}
              </div>
            </button>

            {/* Görev Başlığı ve Rozetler */}
            <div className="space-y-1.5 flex-1 min-w-0 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Ders Rozeti */}
                {ders && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${ders.renk}18`,
                      color: ders.renk,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: ders.renk }}
                      aria-hidden="true"
                    />
                    <span className="truncate max-w-[150px]">{ders.ad}</span>
                  </span>
                )}

                {/* Tür Rozeti */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${turRozetStili}`}
                >
                  {GOREV_TURU_METINLERI[gorev.tur]}
                </span>

                {/* Süre Rozeti */}
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{gorev.tahminiSaat} sa</span>
                </span>
              </div>

              <h3
                className={`text-base sm:text-lg font-bold tracking-tight text-main break-words ${
                  gorev.tamamlandi ? "line-through text-muted" : ""
                }`}
              >
                {gorev.baslik}
              </h3>
            </div>
          </div>

          {/* Aksiyon Butonları (Düzenle & Sil) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onDuzenle(gorev)}
              aria-label={`"${gorev.baslik}" görevini düzenle`}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-muted hover:text-main hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent transition-colors"
            >
              <Edit3 className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onSil(gorev)}
              aria-label={`"${gorev.baslik}" görevini sil`}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-muted hover:text-danger hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Açıklama alanı (Varsa) */}
        {gorev.aciklama && (
          <div className="pl-14 pr-2">
            <button
              type="button"
              onClick={() => setAciklamaGoster(!aciklamaGoster)}
              aria-expanded={aciklamaGoster}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-main font-medium min-h-[32px]"
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{aciklamaGoster ? "Notu gizle" : "Notu göster"}</span>
              {aciklamaGoster ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>

            {aciklamaGoster && (
              <p className="mt-1.5 p-3 rounded-xl bg-surface-hover/70 text-xs sm:text-sm text-text-muted leading-relaxed border border-border/60">
                {gorev.aciklama}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Alt Bilgi: Tarih ve Kalan Gün Etiketi */}
      <div className="pt-3 mt-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted">
          <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="font-medium">{formatTarih(gorev.sonTarih)}</span>
        </div>

        {/* Kalan Gün Durum Rozeti (Geçmişse kırmızı vurgulu) */}
        <div>
          {gorev.tamamlandi ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-success/10 text-success">
              Tamamlandı
            </span>
          ) : gecikmis ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-danger/15 text-danger border border-danger/30">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{kalanGunEtiketi(gorev.sonTarih)}</span>
            </span>
          ) : bugun ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-warning/15 text-warning border border-warning/30">
              Bugün Son Gün
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-surface-hover text-text-muted">
              {kalanGunEtiketi(gorev.sonTarih)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
