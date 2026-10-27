"use client";

import { Edit3, Trash2, CheckCircle2, Clock } from "lucide-react";
import type { Ders, Gorev } from "@/lib/types";
import { ZORLUK_METINLERI } from "@/lib/types";

interface DersKartiProps {
  ders: Ders;
  gorevler: Gorev[];
  onDuzenle: (ders: Ders) => void;
  onSil: (ders: Ders, bagliGorevSayisi: number) => void;
}

export function DersKarti({ ders, gorevler, onDuzenle, onSil }: DersKartiProps) {
  // Bu derse ait görevleri ve bekleyenleri hesapla
  const derseAitGorevler = gorevler.filter((g) => g.dersId === ders.id);
  const bekleyenGorevSayisi = derseAitGorevler.filter((g) => !g.tamamlandi).length;

  return (
    <article
      className="group relative rounded-2xl border border-border bg-surface p-5 sm:p-6 transition-all hover:border-text-muted/40 hover:shadow-sm flex flex-col justify-between"
      style={{
        borderLeftColor: ders.renk,
        borderLeftWidth: "6px",
      }}
    >
      <div className="space-y-4">
        {/* Üst Kısım: Başlık, Kod ve İşlem Butonları */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg sm:text-xl text-main tracking-tight leading-snug">
                {ders.ad}
              </h3>
              {ders.kod && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-surface-hover border border-border text-muted">
                  {ders.kod}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onDuzenle(ders)}
              aria-label={`${ders.ad} dersini düzenle`}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-muted hover:text-main hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent transition-colors"
            >
              <Edit3 className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onSil(ders, derseAitGorevler.length)}
              aria-label={`${ders.ad} dersini sil`}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-muted hover:text-danger hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Zorluk Seviyesi Göstergesi */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted font-medium">Zorluk Seviyesi</span>
            <span className="font-semibold text-main">
              {ders.zorluk} / 5 ({ZORLUK_METINLERI[ders.zorluk]})
            </span>
          </div>

          <div
            className="flex items-center gap-1.5"
            role="meter"
            aria-label={`Zorluk seviyesi 5 üzerinden ${ders.zorluk}`}
            aria-valuenow={ders.zorluk}
            aria-valuemin={1}
            aria-valuemax={5}
          >
            {[1, 2, 3, 4, 5].map((nokta) => (
              <div
                key={nokta}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  nokta <= ders.zorluk
                    ? "opacity-100"
                    : "bg-border/60 opacity-40"
                }`}
                style={{
                  backgroundColor: nokta <= ders.zorluk ? ders.renk : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Alt Bilgi: Bekleyen Görevler Rozeti */}
      <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted">
          {bekleyenGorevSayisi > 0 ? (
            <>
              <Clock className="w-4 h-4 text-warning shrink-0" aria-hidden="true" />
              <span className="font-medium text-main">
                {bekleyenGorevSayisi} bekleyen görev
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
              <span className="text-muted">Bekleyen görev yok</span>
            </>
          )}
        </div>

        <span className="text-[11px] text-muted">
          Toplam {derseAitGorevler.length} görev
        </span>
      </div>
    </article>
  );
}
