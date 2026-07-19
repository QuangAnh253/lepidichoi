"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { updateLocationAction } from "@/actions/settings";
import { formatCoordinates, type Coordinates } from "@/lib/map";

/**
 * `LocationPickerDialog` CHỈ lo phần Dialog (mở/đóng, tiêu đề, nút Save)
 * — bản đồ thật nằm ở `LocationMap`. Leaflet cần `window`/`document` nên
 * phải `dynamic(..., { ssr: false })` ngay tại đây (nơi gọi), không phải
 * bên trong chính `LocationMap`.
 */
const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-card bg-muted">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface LocationPickerDialogProps {
  kind: "home" | "lua";
  label: string;
  initialValue: Coordinates | null;
}

export function LocationPickerDialog({ kind, label, initialValue }: LocationPickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Coordinates | null>(initialValue);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!selected) {
      toast.error("Chọn một điểm trên bản đồ trước đã.");
      return;
    }
    startTransition(async () => {
      try {
        await updateLocationAction({ kind, latitude: selected.latitude, longitude: selected.longitude });
        toast.success(`Đã lưu ${label}.`);
        setOpen(false);
      } catch {
        toast.error("Lưu vị trí thất bại, thử lại nhé.");
      }
    });
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
        <Button variant="outline" size="sm" className="gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          Chọn trên bản đồ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            Click hoặc kéo marker tới đúng vị trí, rồi bấm Lưu.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[420px] w-full overflow-hidden rounded-card border border-border/70">
          <LocationMap value={selected} onChange={setSelected} />
        </div>

        <div className="font-mono text-xs text-muted-foreground">
          {selected ? formatCoordinates(selected) : "Chưa chọn vị trí"}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
            Huỷ
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending} className="gap-1.5">
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
