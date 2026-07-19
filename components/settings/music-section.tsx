"use client";

import { useState, useTransition } from "react";
import { Music } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateSettingsAction } from "@/actions/settings";

interface MusicSectionProps {
  initialEnabled: boolean;
}

export function MusicSection({ initialEnabled }: MusicSectionProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      try {
        await updateSettingsAction({ musicEnabled: next });
        toast.success(next ? "Đã bật nhạc nền." : "Đã tắt nhạc nền.");
      } catch {
        setEnabled(!next);
        toast.error("Lưu thất bại, thử lại nhé.");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Music className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Nhạc nền</CardTitle>
            <CardDescription>Bật nhạc khi mở trang, tắt nếu thấy ồn.</CardDescription>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={handleChange} aria-label="Bật/tắt nhạc nền" />
      </CardHeader>
    </Card>
  );
}
