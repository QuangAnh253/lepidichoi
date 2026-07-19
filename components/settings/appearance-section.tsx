"use client";

import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updateSettingsAction } from "@/actions/settings";

type Theme = "light" | "dark" | "system";
const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Hệ thống", icon: Laptop },
];

interface AppearanceSectionProps {
  initialTheme: Theme;
}

/**
 * Theme: đổi ngay lập tức trên trình duyệt này qua `next-themes` (giống
 * `ThemeToggle` ở navbar), đồng thời lưu vào Settings DB để giữ làm
 * cấu hình chung.
 */
export function AppearanceSection({ initialTheme }: AppearanceSectionProps) {
  const { setTheme } = useTheme();
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [, startTransition] = useTransition();

  function handleThemeChange(next: Theme) {
    setThemeState(next);
    setTheme(next);
    startTransition(async () => {
      try {
        await updateSettingsAction({ theme: next });
      } catch {
        toast.error("Lưu giao diện thất bại.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giao diện</CardTitle>
        <CardDescription>Chọn giao diện sáng, tối hoặc theo hệ thống.</CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-5 px-6 pb-6">
        <div className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleThemeChange(value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-300 ease-gentle",
                theme === value
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border/80 hover:bg-foreground/[0.04]"
              )}
              aria-pressed={theme === value}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
