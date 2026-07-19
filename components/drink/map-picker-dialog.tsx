"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCoordinates, type Coordinates } from "@/lib/map";

/**
 * `MapPickerDialog` — bọc `LocationMap` (đã có sẵn ở
 * `components/settings/location-map.tsx`, KHÔNG viết lại bản đồ). Khác
 * với `LocationPickerDialog` của Settings: dialog này KHÔNG tự gọi
 * server action để lưu — chỉ trả về `Coordinates` qua `onConfirm`. Cafe
 * form giữ state riêng và lưu toạ độ cùng lúc với submit form (mục 3,
 * đã xác nhận). Phase 3D.
 */
const LocationMap = dynamic(() => import("@/components/settings/location-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-card bg-muted">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

export function MapPickerDialog({
  initialValue,
  onConfirm,
}: {
  initialValue: Coordinates | null;
  onConfirm: (coordinates: Coordinates) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Coordinates | null>(initialValue);

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSelected(initialValue);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {initialValue ? "Đổi vị trí" : "Chọn trên bản đồ"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vị trí quán</DialogTitle>
          <DialogDescription>Click hoặc kéo marker tới đúng vị trí, rồi bấm Dùng vị trí này.</DialogDescription>
        </DialogHeader>

        <div className="h-[420px] w-full overflow-hidden rounded-card border border-border/70">
          <LocationMap value={selected} onChange={setSelected} />
        </div>

        <div className="font-mono text-xs text-muted-foreground">
          {selected ? formatCoordinates(selected) : "Chưa chọn vị trí"}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Huỷ
          </Button>
          <Button type="button" size="sm" onClick={handleConfirm} disabled={!selected} className="gap-1.5">
            Dùng vị trí này
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
