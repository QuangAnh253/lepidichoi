import type { LucideIcon } from "lucide-react";
import { UtensilsCrossed, Coffee, MapPinned } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  emoji: string;
  description: string;
  ready: boolean;
}

// Single source of truth for every place that lists sections of the site
// (navbar, landing page, footer). `ready: false` sections render as a
// soft "đang ươm mầm" note instead of a working page.
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/hom-nay-an-gi",
    label: "Hôm nay ăn gì",
    icon: UtensilsCrossed,
    emoji: "🍜",
    description: "Bánh xe may mắn cho bữa ăn hôm nay",
    ready: true,
  },
  {
    href: "/hom-nay-uong-gi",
    label: "Hôm nay uống gì",
    icon: Coffee,
    emoji: "☕",
    description: "Bánh xe may mắn cho ly nước hôm nay",
    ready: true,
  },
  {
    href: "/hom-nay-choi-dau",
    label: "Hôm nay chơi đâu",
    icon: MapPinned,
    emoji: "🎯",
    description: "Bánh xe may mắn cho cuộc chơi hôm nay",
    ready: true,
  },
  {
    href: "/ban-do",
    label: "Bản đồ",
    icon: MapPinned,
    emoji: "🗺️",
    description: "Xem tất cả địa điểm trên một bản đồ",
    ready: true,
  },
];