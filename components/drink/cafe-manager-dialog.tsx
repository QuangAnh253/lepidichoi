"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createCafeAction, updateCafeAction, getOrCreateCafeCategoryAction } from "@/actions/cafes";
import { MapPickerDialog } from "@/components/drink/map-picker-dialog";
import { formatCoordinates, type Coordinates } from "@/lib/map";
import type { Category } from "@prisma/client";
import type { CafeWithRelations } from "@/types";

interface CafeManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cafe?: CafeWithRelations | null;
  categories: Category[];
  existingCafeNames: string[];
}

const NEW_CATEGORY = "__new__";

export function CafeManagerDialog({ open, onOpenChange, cafe, categories, existingCafeNames }: CafeManagerDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const [url, setUrl] = useState("");
  const [googleMapUrl, setGoogleMapUrl] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const [drinks, setDrinks] = useState<{ id?: string; name: string; isFavorite: boolean }[]>([]);

  useEffect(() => {
    if (!open) return;
    setName(cafe?.name ?? "");
    setAddress(cafe?.address ?? "");
    setCoordinates(
      cafe?.latitude != null && cafe?.longitude != null
        ? { latitude: cafe.latitude, longitude: cafe.longitude }
        : null
    );
    setImageUrl(cafe?.imageUrl ?? "");
    setMenuUrl(cafe?.menuUrl ?? "");
    setUrl(cafe?.url ?? "");
    setGoogleMapUrl(cafe?.googleMapUrl ?? "");
    setPriceRange(cafe?.priceRange ?? "");
    setCategoryId(cafe?.categoryId ?? "");
    setNewCategoryName("");
    setDrinks(
      cafe?.drinks.map((d) => ({ id: d.id, name: d.name, isFavorite: d.isFavorite })) ?? []
    );
  }, [open, cafe]);

  function handleAddDrink() {
    setDrinks([...drinks, { name: "", isFavorite: false }]);
  }

  function handleRemoveDrink(index: number) {
    const copy = [...drinks];
    copy.splice(index, 1);
    setDrinks(copy);
  }

  function handleDrinkChange(index: number, val: string) {
    const copy = [...drinks];
    copy[index].name = val;
    setDrinks(copy);
  }

  function toggleDrinkFavorite(index: number) {
    const copy = [...drinks];
    copy[index].isFavorite = !copy[index].isFavorite;
    setDrinks(copy);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Quán cần có tên.");
      return;
    }
    
    const isDuplicate = existingCafeNames.some(
      (n) => n.toLowerCase() === name.trim().toLowerCase() && (!cafe || cafe.name.toLowerCase() !== name.trim().toLowerCase())
    );
    if (isDuplicate) {
      toast.error("Quán này đã có trong danh sách.");
      return;
    }

    startTransition(async () => {
      let finalCategoryId = categoryId;
      if (categoryId === NEW_CATEGORY) {
        if (!newCategoryName.trim()) {
          toast.error("Nhập tên danh mục mới nhé.");
          return;
        }
        const created = await getOrCreateCafeCategoryAction(newCategoryName);
        finalCategoryId = created?.id ?? "";
      }

      const input = {
        name: name.trim(),
        address: address.trim() || null,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
        imageUrl: imageUrl.trim() || null,
        menuUrl: menuUrl.trim() || null,
        url: url.trim() || null,
        googleMapUrl: googleMapUrl.trim() || null,
        priceRange: priceRange === "" ? null : (priceRange as any),
        categoryId: finalCategoryId || null,
        drinks: drinks
          .filter((d) => d.name.trim().length > 0)
          .map((d) => ({ name: d.name.trim(), isFavorite: d.isFavorite })),
      };

      if (cafe) {
        await updateCafeAction(cafe.id, input);
        toast.success("Đã lưu thay đổi.");
      } else {
        await createCafeAction(input);
        toast.success(`Đã thêm quán "${input.name}".`);
      }
      router.refresh();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>{cafe ? "Sửa thông tin quán" : "Thêm quán cà phê mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border/60 pb-2">Thông tin quán</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Tên quán</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="The Coffee House"
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
              <label className="text-sm text-muted-foreground">Google Map URL (tuỳ chọn)</label>
              <input
                value={googleMapUrl}
                onChange={(e) => setGoogleMapUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Ảnh đại diện quán (URL, có thể bỏ trống)</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Ảnh Menu quán (URL, có thể bỏ trống)</label>
              <input
                value={menuUrl}
                onChange={(e) => setMenuUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://... (link ảnh menu)"
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
                  <option value="BUDGET">$ - bình dân</option>
                  <option value="MID">$$ - vừa phải</option>
                  <option value="PREMIUM">$$$ - hơi sang</option>
                  <option value="LUXURY">$$$$ - đặc biệt</option>
                </select>
              </div>
            </div>

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
            
            {categoryId === NEW_CATEGORY && (
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring mt-2"
                placeholder="Tên danh mục mới (Cà phê bệt, Trà sữa...)"
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="font-semibold text-foreground">Menu của quán</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddDrink} className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" /> Thêm món
              </Button>
            </div>
            
            <div className="space-y-2">
              {drinks.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Chưa có món nào. Bấm Thêm món để lưu menu.</p>
              )}
              {drinks.map((d, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleDrinkFavorite(index)}
                    className="flex-none p-2 text-muted-foreground hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className="h-4 w-4"
                      fill={d.isFavorite ? "currentColor" : "none"}
                      stroke={d.isFavorite ? "currentColor" : "currentColor"}
                      color={d.isFavorite ? "#f59e0b" : "currentColor"}
                    />
                  </button>
                  <input
                    value={d.name}
                    onChange={(e) => handleDrinkChange(index, e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tên đồ uống (vd: Trà đào cam sả)"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDrink(index)}
                    className="flex-none p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/60">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {cafe ? "Lưu thay đổi" : "Thêm quán"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
