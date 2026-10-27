"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface OnayModaliProps {
  acik: boolean;
  baslik: string;
  mesaj: string;
  onayButonMetni?: string;
  iptalButonMetni?: string;
  tehlikeliMi?: boolean;
  onOnay: () => void;
  onKapat: () => void;
}

export function OnayModali({
  acik,
  baslik,
  mesaj,
  onayButonMetni = "Sil",
  iptalButonMetni = "Vazgeç",
  tehlikeliMi = true,
  onOnay,
  onKapat,
}: OnayModaliProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!acik) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onKapat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [acik, onKapat]);

  if (!acik) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onay-modal-baslik"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Karartma arka planı */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onKapat}
        aria-hidden="true"
      />

      {/* Modal gövdesi */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border p-6 shadow-2xl z-10 space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                tehlikeliMi
                  ? "bg-red-500/10 text-danger dark:bg-red-500/20"
                  : "bg-primary/10 text-primary dark:bg-primary/20"
              }`}
            >
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2
              id="onay-modal-baslik"
              className="text-lg font-bold text-main leading-snug"
            >
              {baslik}
            </h2>
          </div>

          <button
            type="button"
            onClick={onKapat}
            aria-label="Kapat"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-muted hover:text-main hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm sm:text-base text-muted leading-relaxed">
          {mesaj}
        </p>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onKapat}
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl border border-border bg-surface text-main font-medium hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
          >
            {iptalButonMetni}
          </button>
          <button
            type="button"
            onClick={() => {
              onOnay();
              onKapat();
            }}
            className={`w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              tehlikeliMi
                ? "bg-danger hover:opacity-90 focus-visible:ring-danger"
                : "bg-primary hover:bg-primary-hover focus-visible:ring-primary"
            }`}
          >
            {onayButonMetni}
          </button>
        </div>
      </div>
    </div>
  );
}
