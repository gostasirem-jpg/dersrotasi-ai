import type { ComponentType } from "react";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  Compass,
  Bot,
  BarChart3,
  type LucideProps,
} from "lucide-react";

export interface NavItemConfig {
  name: string;
  href: string;
  icon: ComponentType<LucideProps>;
  description: string;
}

export const ALL_NAV_ITEMS: NavItemConfig[] = [
  {
    name: "Panel",
    href: "/panel",
    icon: LayoutDashboard,
    description: "Günlük dersler, yaklaşan sınavlar ve haftalık durum özeti.",
  },
  {
    name: "Dersler",
    href: "/dersler",
    icon: BookOpen,
    description: "Kayıtlı dersleriniz, ders programı ve ders materyalleri.",
  },
  {
    name: "Görevler",
    href: "/gorevler",
    icon: CheckSquare,
    description: "Ödevler, projeler ve sınav hazırlık görevleri takibi.",
  },
  {
    name: "Takvim",
    href: "/takvim",
    icon: Calendar,
    description: "Akademik takvim, sınav tarihleri ve etkinlik programı.",
  },
  {
    name: "Plan",
    href: "/plan",
    icon: Compass,
    description: "Yapay zeka ile kişiselleştirilmiş akıllı çalışma planı.",
  },
  {
    name: "Asistan",
    href: "/asistan",
    icon: Bot,
    description: "Dersler ve sınavlar için akıllı akademik asistan.",
  },
  {
    name: "İstatistikler",
    href: "/istatistikler",
    icon: BarChart3,
    description: "Çalışma süreleri, tamamlama oranları ve akademik gelişim.",
  },
];

// Telefon ve tablette alt navigasyon çubuğunda gösterilen 4 ana sayfa
export const MOBILE_PRIMARY_ITEMS: NavItemConfig[] = [
  ALL_NAV_ITEMS[0], // Panel
  ALL_NAV_ITEMS[2], // Görevler
  ALL_NAV_ITEMS[4], // Plan
  ALL_NAV_ITEMS[5], // Asistan
];

// "Menü" alttan açılır panelinde gösterilen 3 sayfa
export const MOBILE_MENU_ITEMS: NavItemConfig[] = [
  ALL_NAV_ITEMS[1], // Dersler
  ALL_NAV_ITEMS[3], // Takvim
  ALL_NAV_ITEMS[6], // İstatistikler
];
