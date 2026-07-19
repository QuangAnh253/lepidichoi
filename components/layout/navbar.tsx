"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_ITEMS } from "@/lib/constants";
import { LogIn } from "lucide-react";

interface NavbarProps {
  isAuthenticated?: boolean;
}


export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const pathname = usePathname();

  const items = isAuthenticated 
    ? NAV_ITEMS 
    : [
        { href: "/guest", label: "Hôm nay ăn gì", emoji: "🍜", ready: true },
        { href: "/guest/ban-do", label: "Bản đồ", emoji: "🗺️", ready: true }
      ];

  return (
    <header className="glass-nav sticky top-0 z-40 border-b border-border/60">
      <div className="container flex h-14 items-center justify-between gap-2">
        <Link href="/" className="shrink-0 font-display text-lg tracking-tight">
          hôm nay ăn gì<span className="text-primary">.</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.ready ? item.href : "#"}
                aria-disabled={!item.ready}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-foreground/[0.06] text-foreground"
                    : item.ready
                    ? "text-muted-foreground hover:text-foreground"
                    : "cursor-default text-muted-foreground/40"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5">
          {isAuthenticated && (
            <Link
              href="/cai-dat"
              aria-label="Cài đặt"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-foreground/[0.06]",
                pathname === "/cai-dat" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>
          )}
          <ThemeToggle />
          {isAuthenticated ? (
            <form action={logoutAction} className="ml-1">
              <button
                type="submit"
                aria-label="Đăng xuất"
                title="Khoá cửa (Đăng xuất)"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              aria-label="Đăng nhập"
              title="Đăng nhập"
              className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <LogIn className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="border-t border-border/50 sm:hidden">
        <nav className="container flex gap-1.5 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.ready ? item.href : "#"}
                aria-disabled={!item.ready}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs whitespace-nowrap transition-colors",
                  active
                    ? "border-transparent bg-foreground/[0.06] text-foreground"
                    : item.ready
                    ? "border-border/70 text-muted-foreground"
                    : "border-border/40 text-muted-foreground/40"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {isAuthenticated && (
            <Link
              href="/cai-dat"
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs whitespace-nowrap transition-colors",
                pathname === "/cai-dat"
                  ? "border-transparent bg-foreground/[0.06] text-foreground"
                  : "border-border/70 text-muted-foreground"
              )}
            >
              <Settings className="h-3 w-3" /> Cài đặt
            </Link>
          )}
          {isAuthenticated ? (
            <form action={logoutAction} className="shrink-0 flex">
              <button
                type="submit"
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-destructive/30 px-3.5 py-1.5 font-mono text-xs whitespace-nowrap text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-3 w-3" /> Đăng xuất
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 px-3.5 py-1.5 font-mono text-xs whitespace-nowrap text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <LogIn className="h-3 w-3" /> Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
