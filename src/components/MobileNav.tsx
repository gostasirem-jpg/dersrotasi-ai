"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { MOBILE_PRIMARY_ITEMS, MOBILE_MENU_ITEMS } from "./nav-items";
import { ThemeToggle } from "./ThemeToggle";

export function MobileNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Sayfa değiştiğinde menüyü otomatik kapat (React state adjustment pattern)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMenuOpen(false);
  }

  // Esc tuşuna basıldığında paneli kapat ve arka plan kaydırmasını engelle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Alt çekmecedeki sayfalardan biri aktif mi?
  const isDrawerRouteActive = MOBILE_MENU_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* Sabit Alt Navigasyon Çubuğu */}
      <nav
        aria-label="Mobil Alt Gezinme Menüsü"
        className="lg:hidden fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-border z-40 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {/* 4 Ana Sayfa */}
          {MOBILE_PRIMARY_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 py-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent ${
                  isActive
                    ? "text-primary dark:text-primary font-semibold"
                    : "text-muted hover:text-main"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110" : ""
                  }`}
                  aria-hidden="true"
                />
                <span className="text-[11px] mt-1 leading-none tracking-tight">
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* 5. Buton: "Menü" */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-expanded={isMenuOpen}
            aria-haspopup="dialog"
            aria-label="Daha fazla menü seçeneği"
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 py-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent ${
              isDrawerRouteActive || isMenuOpen
                ? "text-primary dark:text-primary font-semibold"
                : "text-muted hover:text-main"
            }`}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
            <span className="text-[11px] mt-1 leading-none tracking-tight">
              Menü
            </span>
          </button>
        </div>
      </nav>

      {/* Alttan Açılan Panel (Drawer / Bottom Sheet) */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ek Menü Seçenekleri"
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
        >
          {/* Karartma Arka Planı (Dışına dokununca kapatır) */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panel Gövdesi */}
          <div className="relative bg-surface rounded-t-3xl border-t border-border p-5 z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl max-w-lg mx-auto w-full">
            {/* Tutamaç (Handle) */}
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-4" aria-hidden="true" />

            {/* Panel Başlığı ve Kapat Butonu */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="font-semibold text-sm text-main">
                Diğer Bölümler
              </span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Menüyü kapat"
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-muted hover:text-main hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Panel İçindeki Sayfa Bağlantıları */}
            <div className="py-3 space-y-1">
              {MOBILE_MENU_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl min-h-[44px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary"
                        : "text-muted hover:text-main hover:bg-surface-hover"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? "text-primary dark:text-primary" : "text-muted"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="flex flex-col">
                      <span className="leading-tight">{item.name}</span>
                      <span className="text-[11px] text-muted font-normal mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Tema Değiştirme Butonu */}
            <div className="pt-3 border-t border-border flex items-center justify-between px-2">
              <span className="text-sm font-medium text-main">Görünüm Teması</span>
              <ThemeToggle showLabel={true} className="border border-border bg-surface-hover/70" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
