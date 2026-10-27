"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { ALL_NAV_ITEMS } from "./nav-items";
import { ThemeToggle } from "./ThemeToggle";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:border-r lg:border-border lg:bg-surface lg:z-30"
      aria-label="Masaüstü Kenar Çubuğu"
    >
      {/* Logo Alanı */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link
          href="/panel"
          className="group flex items-center gap-3 min-h-[44px] rounded-lg p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent"
          aria-label="DersRotası AI Ana Sayfasına Git"
        >
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5 transition-transform duration-200 group-hover:rotate-45" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-main leading-tight">
              DersRotası
            </span>
            <span className="text-[11px] font-semibold text-accent leading-none uppercase tracking-wider">
              AI Planlayıcı
            </span>
          </div>
        </Link>
      </div>

      {/* Navigasyon Bağlantıları */}
      <nav aria-label="Ana Menü" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {ALL_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary shadow-2xs"
                  : "text-muted hover:text-main hover:bg-surface-hover"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? "text-primary dark:text-primary" : "text-muted"
                }`}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Alt Bölüm: Tema Butonu */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-surface-hover/70 border border-border/60">
          <span className="text-xs font-medium text-muted pl-1">Görünüm</span>
          <ThemeToggle showLabel={false} />
        </div>
      </div>
    </aside>
  );
}
