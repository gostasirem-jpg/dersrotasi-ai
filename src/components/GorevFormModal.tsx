"use client";

import { useEffect, useState, useId } from "react";
import Link from "next/link";
import { X, AlertCircle, ArrowRight } from "lucide-react";
import type { Ders, Gorev, GorevTuru } from "@/lib/types";
import { GOREV_TURU_METINLERI } from "@/lib/types";
import { yerelTarihDizgisi } from "@/lib/tarih";
import type { YeniGorevGirdisi } from "@/lib/store";

interface GorevFormModalProps {
  acik: boolean;
  anahtar?: number;
  dersler: Ders[];
  duzenlenecekGorev?: Gorev | null;
  onKaydet: (girdi: YeniGorevGirdisi) => void;
  onKapat: () => void;
}

interface FormHatalari {
  dersId?: string;
  baslik?: string;
  sonTarih?: string;
  tahminiSaat?: string;
}

interface GorevFormIcerikProps {
  dersler: Ders[];
  duzenlenecekGorev?: Gorev | null;
  onKaydet: (girdi: YeniGorevGirdisi) => void;
  onKapat: () => void;
}

function GorevFormIcerik({
  dersler,
  duzenlenecekGorev,
  onKaydet,
  onKapat,
}: GorevFormIcerikProps) {
  const dersIdInputId = useId();
  const baslikInputId = useId();
  const sonTarihInputId = useId();
  const tahminiSaatInputId = useId();
  const aciklamaInputId = useId();

  const dersIdHataId = useId();
  const baslikHataId = useId();
  const sonTarihHataId = useId();
  const tahminiSaatHataId = useId();

  // Her açılışta temiz varsayılanlar: tür Ödev, son tarih bugün+3, süre 3 saat, başlık ve açıklama boş
  const [dersId, setDersId] = useState(
    duzenlenecekGorev?.dersId ?? (dersler.length > 0 ? dersler[0].id : "")
  );
  const [baslik, setBaslik] = useState(duzenlenecekGorev?.baslik ?? "");
  const [tur, setTur] = useState<GorevTuru>(duzenlenecekGorev?.tur ?? "odev");
  const [sonTarih, setSonTarih] = useState(
    duzenlenecekGorev?.sonTarih ?? yerelTarihDizgisi(new Date(), 3)
  );
  const [tahminiSaat, setTahminiSaat] = useState(
    duzenlenecekGorev ? String(duzenlenecekGorev.tahminiSaat) : "3"
  );
  const [aciklama, setAciklama] = useState(duzenlenecekGorev?.aciklama ?? "");
  const [hatalar, setHatalari] = useState<FormHatalari>({});

  const dogrula = (): boolean => {
    const yeniHatalar: FormHatalari = {};
    const kirpilmisBaslik = baslik.trim();

    if (!dersId) {
      yeniHatalar.dersId = "Lütfen bir ders seçin.";
    }

    if (!kirpilmisBaslik) {
      yeniHatalar.baslik = "Görev başlığı zorunludur.";
    } else if (kirpilmisBaslik.length < 2) {
      yeniHatalar.baslik = "Başlık en az 2 karakter olmalıdır.";
    } else if (kirpilmisBaslik.length > 100) {
      yeniHatalar.baslik = "Başlık en fazla 100 karakter olabilir.";
    }

    if (!sonTarih) {
      yeniHatalar.sonTarih = "Lütfen bir teslim/sınav tarihi belirleyin.";
    }

    const saatSayi = parseFloat(tahminiSaat);
    if (isNaN(saatSayi) || saatSayi < 0.5 || saatSayi > 100) {
      yeniHatalar.tahminiSaat = "Tahmini süre 0.5 ile 100 saat arasında olmalıdır.";
    }

    setHatalari(yeniHatalar);
    return Object.keys(yeniHatalar).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogrula()) return;

    onKaydet({
      dersId,
      baslik: baslik.trim(),
      tur,
      sonTarih,
      tahminiSaat: parseFloat(tahminiSaat),
      aciklama: aciklama.trim() || undefined,
    });
    onKapat();
  };

  return (
    <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border p-6 sm:p-7 shadow-2xl z-10">
      {/* Üst Başlık ve Kapat Butonu */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
        <h2 id="gorev-modal-baslik" className="text-xl font-bold text-main">
          {duzenlenecekGorev ? "Görevi Düzenle" : "Yeni Görev Ekle"}
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

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* İlgili Ders Seçimi */}
        <div>
          <label
            htmlFor={dersIdInputId}
            className="block text-sm font-semibold text-main mb-1.5"
          >
            İlgili Ders <span className="text-danger">*</span>
          </label>
          <select
            id={dersIdInputId}
            value={dersId}
            onChange={(e) => {
              setDersId(e.target.value);
              if (hatalar.dersId) setHatalari((h) => ({ ...h, dersId: undefined }));
            }}
            aria-required="true"
            aria-invalid={Boolean(hatalar.dersId)}
            aria-describedby={hatalar.dersId ? dersIdHataId : undefined}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-border bg-background text-main text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
          >
            {dersler.map((ders) => (
              <option key={ders.id} value={ders.id}>
                {ders.ad} {ders.kod ? `(${ders.kod})` : ""}
              </option>
            ))}
          </select>
          {hatalar.dersId && (
            <p id={dersIdHataId} role="alert" className="mt-1.5 text-xs text-danger font-medium">
              {hatalar.dersId}
            </p>
          )}
        </div>

        {/* Görev Başlığı */}
        <div>
          <label
            htmlFor={baslikInputId}
            className="block text-sm font-semibold text-main mb-1.5"
          >
            Görev Başlığı <span className="text-danger">*</span>
          </label>
          <input
            id={baslikInputId}
            type="text"
            value={baslik}
            onChange={(e) => {
              setBaslik(e.target.value);
              if (hatalar.baslik) setHatalari((h) => ({ ...h, baslik: undefined }));
            }}
            placeholder="Örn: 1. Vize Hazırlığı, 2. Dönem Ödevi"
            maxLength={100}
            aria-required="true"
            aria-invalid={Boolean(hatalar.baslik)}
            aria-describedby={hatalar.baslik ? baslikHataId : undefined}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-background text-main text-base focus-visible:outline-none focus-visible:ring-2 transition-colors ${
              hatalar.baslik
                ? "border-danger focus-visible:ring-danger"
                : "border-border focus-visible:ring-primary dark:focus-visible:ring-accent"
            }`}
          />
          {hatalar.baslik && (
            <p id={baslikHataId} role="alert" className="mt-1.5 text-xs text-danger font-medium">
              {hatalar.baslik}
            </p>
          )}
        </div>

        {/* Görev Türü Seçimi */}
        <div>
          <span id="gorev-turu-etiket" className="block text-sm font-semibold text-main mb-2">
            Görev Türü
          </span>
          <div
            role="radiogroup"
            aria-labelledby="gorev-turu-etiket"
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          >
            {(["sinav", "odev", "proje", "quiz"] as GorevTuru[]).map((turSecenek) => {
              const secili = tur === turSecenek;
              return (
                <button
                  key={turSecenek}
                  type="button"
                  role="radio"
                  aria-checked={secili}
                  onClick={() => setTur(turSecenek)}
                  className={`min-h-[44px] py-2 px-3 rounded-xl border text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent ${
                    secili
                      ? "border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary shadow-2xs"
                      : "border-border bg-background text-muted hover:border-text-muted hover:text-main"
                  }`}
                >
                  {GOREV_TURU_METINLERI[turSecenek]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tarih ve Tahmini Saat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={sonTarihInputId}
              className="block text-sm font-semibold text-main mb-1.5"
            >
              Son Tarih / Sınav Tarihi <span className="text-danger">*</span>
            </label>
            <input
              id={sonTarihInputId}
              type="date"
              value={sonTarih}
              onChange={(e) => {
                setSonTarih(e.target.value);
                if (hatalar.sonTarih) setHatalari((h) => ({ ...h, sonTarih: undefined }));
              }}
              aria-required="true"
              aria-invalid={Boolean(hatalar.sonTarih)}
              aria-describedby={hatalar.sonTarih ? sonTarihHataId : undefined}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-background text-main text-base focus-visible:outline-none focus-visible:ring-2 transition-colors ${
                hatalar.sonTarih
                  ? "border-danger focus-visible:ring-danger"
                  : "border-border focus-visible:ring-primary dark:focus-visible:ring-accent"
              }`}
            />
            {hatalar.sonTarih && (
              <p id={sonTarihHataId} role="alert" className="mt-1.5 text-xs text-danger font-medium">
                {hatalar.sonTarih}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={tahminiSaatInputId}
              className="block text-sm font-semibold text-main mb-1.5"
            >
              Tahmini Süre (Saat) <span className="text-danger">*</span>
            </label>
            <input
              id={tahminiSaatInputId}
              type="number"
              step="0.5"
              min="0.5"
              max="100"
              value={tahminiSaat}
              onChange={(e) => {
                setTahminiSaat(e.target.value);
                if (hatalar.tahminiSaat) setHatalari((h) => ({ ...h, tahminiSaat: undefined }));
              }}
              aria-required="true"
              aria-invalid={Boolean(hatalar.tahminiSaat)}
              aria-describedby={hatalar.tahminiSaat ? tahminiSaatHataId : undefined}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-background text-main text-base focus-visible:outline-none focus-visible:ring-2 transition-colors ${
                hatalar.tahminiSaat
                  ? "border-danger focus-visible:ring-danger"
                  : "border-border focus-visible:ring-primary dark:focus-visible:ring-accent"
              }`}
            />
            {hatalar.tahminiSaat && (
              <p id={tahminiSaatHataId} role="alert" className="mt-1.5 text-xs text-danger font-medium">
                {hatalar.tahminiSaat}
              </p>
            )}
          </div>
        </div>

        {/* Açıklama (İsteğe bağlı) */}
        <div>
          <label
            htmlFor={aciklamaInputId}
            className="block text-sm font-semibold text-main mb-1.5"
          >
            Açıklama veya Konu Notları <span className="text-xs font-normal text-muted">(isteğe bağlı)</span>
          </label>
          <textarea
            id={aciklamaInputId}
            rows={3}
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            placeholder="Örn: 1-4. üniteler arası konular, formül kağıdı hazırlanacak..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-main text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent resize-none"
          />
        </div>

        {/* Form Butonları */}
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
            {duzenlenecekGorev ? "Değişiklikleri Kaydet" : "Görevi Ekle"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function GorevFormModal({
  acik,
  anahtar = 0,
  dersler,
  duzenlenecekGorev,
  onKaydet,
  onKapat,
}: GorevFormModalProps) {
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

  // Hiç ders yokken açılırsa rehberlik ve yönlendirme görünümü
  if (dersler.length === 0) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ders-yok-baslik"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onKapat}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-2xl z-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>

          <h2 id="ders-yok-baslik" className="text-xl font-bold text-main">
            Önce Bir Ders Eklemelisin
          </h2>

          <p className="text-sm text-muted">
            Görev eklemek için önce bir ders eklemelisin.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onKapat}
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl border border-border bg-surface text-main font-medium hover:bg-surface-hover"
            >
              Vazgeç
            </button>
            <Link
              href="/dersler"
              onClick={onKapat}
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:bg-accent-hover"
            >
              <span>Dersler Sayfasına Git</span>
              <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gorev-modal-baslik"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onKapat}
        aria-hidden="true"
      />

      <GorevFormIcerik
        key={duzenlenecekGorev ? `duzenle-${duzenlenecekGorev.id}-${anahtar}` : `yeni-gorev-${anahtar}`}
        dersler={dersler}
        duzenlenecekGorev={duzenlenecekGorev}
        onKaydet={onKaydet}
        onKapat={onKapat}
      />
    </div>
  );
}
