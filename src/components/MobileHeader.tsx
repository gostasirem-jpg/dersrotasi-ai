"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { ALL_NAV_ITEMS } from "./nav-items";

export function MobileHeader() {
  const pathname = usePathname();

  // Geçerli sayfanın adını bul
  const currentItem = ALL_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const currentTitle = currentItem ? currentItem.name : "Panel";

  return (
    <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-surface/95 backdrop-blur border-b border-border z-30 flex items-center justify-between px-3 sm:px-4">
      {/* Logo */}
      <Link
        href="/panel"
        className="flex items-center gap-2 min-h-[44px] px-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
        aria-label="DersRotası AI Ana Sayfası"
      >
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground flex items-center justify-center">
          <Compass className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sm tracking-tight text-main">
            DersRotası
          </span>
          <span className="text-[10px] font-semibold text-accent leading-none uppercase">
            AI
          </span>
        </div>
      </Link>

      {/* Aktif Sayfa Başlık Rozeti */}
      <div className="flex items-center">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-hover text-main border border-border">
          {currentTitle}
        </span>
      </div>
    </header>
  );
}
