"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createPlaceAction, updatePlaceAction, getOrCreatePlaceCategoryAction } from "@/actions/places";
import { MapPickerDialog } from "@/components/place/map-picker-dialog";
import { formatCoordinates, type Coordinates } from "@/lib/map";
import type { Category } from "@prisma/client";
import type { PlaceWithRelations } from "@/types";

interface PlaceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place?: PlaceWithRelations | null;
  categories: Category[];
  existingPlaceNames: string[];
}

const NEW_CATEGORY = "__new__";

export function PlaceFormDialog({ open, onOpenChange, place, categories, existingPlaceNames }: PlaceFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [url, setUrl] = useState("");
  const [googleMapUrl, setGoogleMapUrl] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(place?.name ?? "");
    setAddress(place?.address ?? "");
    setCoordinates(
      place?.latitude != null && place?.longitude != null
        ? { latitude: place.latitude, longitude: place.longitude }
        : null
    );
    setImageUrl(place?.imageUrl ?? "");
    setUrl(place?.url ?? "");
    setGoogleMapUrl(place?.googleMapUrl ?? "");
    setPriceRange(place?.priceRange ?? "");
    setCategoryId(place?.categoryId ?? "");
    setNewCategoryName("");
  }, [open, place]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Địa điểm cần có tên.");
      return;
    }
    
    const isDuplicate = existingPlaceNames.some(
      (n) => n.toLowerCase() === name.trim().toLowerCase() && (!place || place.name.toLowerCase() !== name.trim().toLowerCase())
    );
    if (isDuplicate) {
      toast.error("Địa điểm này đã có trong danh sách.");
      return;
    }

    startTransition(async () => {
      let finalCategoryId = categoryId;
      if (categoryId === NEW_CATEGORY) {
        if (!newCategoryName.trim()) {
          toast.error("Nhập tên danh mục mới nhé.");
          return;
        }
        const created = await getOrCreatePlaceCategoryAction(newCategoryName);
        finalCategoryId = created?.id ?? "";
      }

      const input = {
        name: name.trim(),
        address: address.trim() || null,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
        imageUrl: imageUrl.trim() || null,
        url: url.trim() || null,
        googleMapUrl: googleMapUrl.trim() || null,
        priceRange: priceRange === "" ? null : (priceRange as any),
        categoryId: finalCategoryId || null,
      };

      if (place) {
        await updatePlaceAction(place.id, input);
        toast.success("Đã lưu thay đổi.");
      } else {
        await createPlaceAction(input);
        toast.success(`Đã thêm "${input.name}" vào danh sách.`);
      }
      router.refresh();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{place ? "Sửa địa điểm" : "Thêm địa điểm mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Tên địa điểm</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Rạp CGV Vincom"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Địa chỉ</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Không bắt buộc"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Vị trí</label>
            <div className="flex items-center gap-2">
              <MapPickerDialog initialValue={coordinates} onConfirm={setCoordinates} />
              {coordinates && (
                <span className="truncate font-mono text-[11px] text-muted-foreground">
                  {formatCoordinates(coordinates)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Ảnh (URL, có thể bỏ trống)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Website / Facebook</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Khoảng giá</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Không xác định</option>
                <option value="BUDGET">$ — bình dân</option>
                <option value="MID">$$ — vừa phải</option>
                <option value="PREMIUM">$$$ — hơi sang</option>
                <option value="LUXURY">$$$$ — đặc biệt</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Không có</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value={NEW_CATEGORY}>+ Tạo danh mục mới</option>
              </select>
            </div>
          </div>
          {categoryId === NEW_CATEGORY && (
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tên danh mục mới (Rạp phim, Bảo tàng, Công viên...)"
            />
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {place ? "Lưu thay đổi" : "Thêm địa điểm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
