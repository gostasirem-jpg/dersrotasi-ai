"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  const observer = new MutationObserver(() => callback());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => {
    window.removeEventListener("storage", callback);
    observer.disconnect();
  };
}

function getSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    try {
      localStorage.setItem("dersrotasi-tema", nextTheme);
    } catch {
      // localStorage erişim kısıtlamalarında sessizce devam edilir
    }
  };

  const label = isDark ? "Açık temaya geç" : "Koyu temaya geç";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg p-2.5 text-muted hover:text-main hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-accent transition-colors ${className}`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400 shrink-0" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 shrink-0" aria-hidden="true" />
      )}
      {showLabel && (
        <span className="ml-3 text-sm font-medium">
          {isDark ? "Açık Tema" : "Koyu Tema"}
        </span>
      )}
    </button>
  );
}
