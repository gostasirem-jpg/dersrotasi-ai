import React from "react";

interface YukleniyorIskeletiProps {
  baslik?: string;
  adet?: number;
}

export function YukleniyorIskeleti({
  baslik = "Veriler yükleniyor...",
  adet = 3,
}: YukleniyorIskeletiProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="space-y-4 w-full animate-pulse"
    >
      <span className="sr-only">{baslik}</span>

      {/* Başlık iskeleti */}
      <div className="h-8 w-48 bg-border/60 rounded-lg" />
      <div className="h-4 w-72 bg-border/40 rounded-md" />

      {/* Kart iskeletleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {Array.from({ length: adet }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-surface p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-border/60 rounded" />
              <div className="h-5 w-12 bg-border/40 rounded-full" />
            </div>
            <div className="h-4 w-24 bg-border/40 rounded" />
            <div className="h-8 w-full bg-border/30 rounded-lg mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
