"use client";

import { useEffect, useState, useId } from "react";
import { X, Check } from "lucide-react";
import type { Ders, ZorlukDerecesi } from "@/lib/types";
import { DERS_RENK_PALETI, ZORLUK_METINLERI } from "@/lib/types";
import type { YeniDersGirdisi } from "@/lib/store";

interface DersFormModalProps {
  acik: boolean;
  anahtar?: number;
  duzenlenecekDers?: Ders | null;
  onKaydet: (girdi: YeniDersGirdisi) => void;
  onKapat: () => void;
}

interface FormHatalari {
  ad?: string;
  zorluk?: string;
}

interface DersFormIcerikProps {
  duzenlenecekDers?: Ders | null;
  onKaydet: (girdi: YeniDersGirdisi) => void;
  onKapat: () => void;
}

function DersFormIcerik({ duzenlenecekDers, onKaydet, onKapat }: DersFormIcerikProps) {
  const adInputId = useId();
  const kodInputId = useId();
  const adHataId = useId();
  const zorlukHataId = useId();

  const [ad, setAd] = useState(duzenlenecekDers?.ad ?? "");
  const [kod, setKod] = useState(duzenlenecekDers?.kod ?? "");
  const [zorluk, setZorluk] = useState<ZorlukDerecesi>(duzenlenecekDers?.zorluk ?? 3);
  const [renk, setRenk] = useState<string>(duzenlenecekDers?.renk ?? DERS_RENK_PALETI[0].hex);
  const [hatalar, setHatalari] = useState<FormHatalari>({});

  const dogrula = (): boolean => {
    const yeniHatalar: FormHatalari = {};
    const kirpilmisAd = ad.trim();

    if (!kirpilmisAd) {
      yeniHatalar.ad = "Ders adı zorunludur.";
    } else if (kirpilmisAd.length < 2) {
      yeniHatalar.ad = "Ders adı en az 2 karakter olmalıdır.";
    } else if (kirpilmisAd.length > 60) {
      yeniHatalar.ad = "Ders adı en fazla 60 karakter olabilir.";
    }

    if (!zorluk || zorluk < 1 || zorluk > 5) {
      yeniHatalar.zorluk = "Lütfen 1 ile 5 arasında bir zorluk seviyesi seçin.";
    }

    setHatalari(yeniHatalar);
    return Object.keys(yeniHatalar).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogrula()) return;

    onKaydet({
      ad: ad.trim(),
      kod: kod.trim() ? kod.trim().toUpperCase() : undefined,
      zorluk,
      renk,
    });
    onKapat();
  };

  return (
    <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border p-6 sm:p-7 shadow-2xl z-10">
      {/* Başlık ve Kapat Butonu */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
        <h2 id="ders-modal-baslik" className="text-xl font-bold text-main">
          {duzenlenecekDers ? "Dersi Düzenle" : "Yeni Ders Ekle"}
        </h2>
        <button
          type="button"
          onClick={onKapat}
          aria-label="Kapat"
          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-muted hover:text-main hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Ders Adı */}
        <div>
          <label
            htmlFor={adInputId}
            className="block text-sm font-semibold text-main mb-1.5"
          >
            Ders Adı <span className="text-danger">*</span>
          </label>
          <input
            id={adInputId}
            type="text"
            value={ad}
            onChange={(e) => {
              setAd(e.target.value);
              if (hatalar.ad) setHatalari((h) => ({ ...h, ad: undefined }));
            }}
            placeholder="Örn: Lineer Cebir, Diferansiyel Denklemler"
            maxLength={60}
            aria-required="true"
            aria-invalid={Boolean(hatalar.ad)}
            aria-describedby={hatalar.ad ? adHataId : undefined}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-background text-main text-base focus-visible:outline-none focus-visible:ring-2 transition-colors ${
              hatalar.ad
                ? "border-danger focus-visible:ring-danger"
                : "border-border focus-visible:ring-primary dark:focus-visible:ring-accent"
            }`}
          />
          {hatalar.ad && (
            <p id={adHataId} role="alert" className="mt-1.5 text-xs text-danger font-medium">
              {hatalar.ad}
            </p>
          )}
        </div>

        {/* Ders Kodu */}
        <div>
          <label
            htmlFor={kodInputId}
            className="block text-sm font-semibold text-main mb-1.5"
          >
            Ders Kodu <span className="text-xs font-normal text-muted">(isteğe bağlı)</span>
          </label>
          <input
            id={kodInputId}
            type="text"
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            placeholder="Örn: MAT201, CENG101"
            maxLength={15}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-border bg-background text-main text-base uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent transition-colors"
          />
        </div>

        {/* Zorluk Seviyesi */}
        <div>
          <span
            id="zorluk-etiket"
            className="block text-sm font-semibold text-main mb-2"
          >
            Zorluk Seviyesi <span className="text-danger">*</span>
          </span>

          <div
            role="radiogroup"
            aria-labelledby="zorluk-etiket"
            className="grid grid-cols-5 gap-2"
          >
            {([1, 2, 3, 4, 5] as ZorlukDerecesi[]).map((seviye) => {
              const secili = zorluk === seviye;
              return (
                <button
                  key={seviye}
                  type="button"
                  role="radio"
                  aria-checked={secili}
                  onClick={() => {
                    setZorluk(seviye);
                    if (hatalar.zorluk) setHatalari((h) => ({ ...h, zorluk: undefined }));
                  }}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-2 px-1 rounded-xl border text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent ${
                    secili
                      ? "border-primary bg-primary/10 text-primary dark:border-primary dark:bg-primary/20 dark:text-primary shadow-xs"
                      : "border-border bg-background text-muted hover:border-text-muted hover:text-main"
                  }`}
                >
                  <span className="text-base">{seviye}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-xs text-muted flex items-center justify-between">
            <span>Seçilen zorluk: <strong className="text-main font-semibold">{zorluk} - {ZORLUK_METINLERI[zorluk]}</strong></span>
            <span className="text-[11px]">(1: En kolay, 5: En zor)</span>
          </p>

          {hatalar.zorluk && (
            <p id={zorlukHataId} role="alert" className="mt-1.5 text-xs text-danger font-medium">
              {hatalar.zorluk}
            </p>
          )}
        </div>

        {/* Renk Seçimi */}
        <div>
          <span
            id="renk-etiket"
            className="block text-sm font-semibold text-main mb-2"
          >
            Ders Rengi
          </span>
          <div
            role="radiogroup"
            aria-labelledby="renk-etiket"
            className="grid grid-cols-4 sm:grid-cols-8 gap-2.5"
          >
            {DERS_RENK_PALETI.map((item) => {
              const secili = renk.toLowerCase() === item.hex.toLowerCase();
              return (
                <button
                  key={item.hex}
                  type="button"
                  role="radio"
                  aria-checked={secili}
                  aria-label={`${item.ad} rengini seç`}
                  onClick={() => setRenk(item.hex)}
                  style={{ backgroundColor: item.hex }}
                  className={`relative w-full aspect-square min-h-[44px] rounded-xl flex items-center justify-center transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    secili ? "ring-2 ring-offset-2 ring-primary scale-105 shadow-sm" : ""
                  }`}
                >
                  {secili && (
                    <Check className="w-5 h-5 text-white drop-shadow-md stroke-[3]" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onKapat}
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl border border-border bg-surface text-main font-medium hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold shadow-sm hover:bg-accent-hover active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {duzenlenecekDers ? "Değişiklikleri Kaydet" : "Dersi Ekle"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function DersFormModal({
  acik,
  anahtar = 0,
  duzenlenecekDers,
  onKaydet,
  onKapat,
}: DersFormModalProps) {
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
      aria-labelledby="ders-modal-baslik"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Karartma arka planı */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onKapat}
        aria-hidden="true"
      />

      <DersFormIcerik
        key={duzenlenecekDers ? `duzenle-${duzenlenecekDers.id}-${anahtar}` : `yeni-ders-${anahtar}`}
        duzenlenecekDers={duzenlenecekDers}
        onKaydet={onKaydet}
        onKapat={onKapat}
      />
    </div>
  );
}
