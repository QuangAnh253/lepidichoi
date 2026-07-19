"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PRICE_OPTIONS } from "@/lib/food-labels";
import { createFoodAction, updateFoodAction, getOrCreateCategoryAction } from "@/actions/foods";
import { RestaurantBadgeSelect } from "@/components/food/restaurant-badge-select";
import type { Category, Restaurant, PriceRange } from "@prisma/client";
import type { FoodWithRelations } from "@/types";

const SPICY_OPTIONS = [
  { value: "", label: "Không xác định" },
  { value: "0", label: "Không cay" },
  { value: "1", label: "Hơi cay" },
  { value: "2", label: "Cay" },
  { value: "3", label: "Rất cay" },
];

interface FoodFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food?: FoodWithRelations | null;
  categories: Category[];
  restaurants: Restaurant[];
  allTags: string[];
  existingFoodNames: string[];
}

const NEW_CATEGORY = "__new__";

export function FoodFormDialog({ open, onOpenChange, food, categories, restaurants, allTags, existingFoodNames }: FoodFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [spicyLevel, setSpicyLevel] = useState("");
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [restaurantIds, setRestaurantIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setName(food?.name ?? "");
    setDescription(food?.description ?? "");
    setImageUrl(food?.imageUrl ?? "");
    setPriceRange(food?.priceRange ?? "");
    setSpicyLevel(food?.spicyLevel != null ? String(food.spicyLevel) : "");
    setTags(food?.tags?.join(", ") ?? "");
    setCategoryId(food?.categoryId ?? "");
    setNewCategoryName("");
    setRestaurantIds(food?.restaurants?.map((r) => r.id) ?? []);
  }, [open, food]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Món ăn cần có tên.");
      return;
    }
    
    const isDuplicate = existingFoodNames.some(
      (n) => n.toLowerCase() === name.trim().toLowerCase() && (!food || food.name.toLowerCase() !== name.trim().toLowerCase())
    );
    if (isDuplicate) {
      toast.error("Món này đã có trong danh sách.");
      return;
    }

    startTransition(async () => {
      let finalCategoryId = categoryId;
      if (categoryId === NEW_CATEGORY) {
        if (!newCategoryName.trim()) {
          toast.error("Nhập tên danh mục mới nhé.");
          return;
        }
        const created = await getOrCreateCategoryAction(newCategoryName);
        finalCategoryId = created?.id ?? "";
      }

      const input = {
        name: name.trim(),
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        priceRange: (priceRange || null) as PriceRange | null,
        spicyLevel: spicyLevel === "" ? null : Number(spicyLevel),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        categoryId: finalCategoryId || null,
        restaurantIds,
      };

      if (food) {
        await updateFoodAction(food.id, input);
        toast.success("Đã lưu thay đổi.");
      } else {
        await createFoodAction(input);
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
          <DialogTitle>{food ? "Sửa món ăn" : "Thêm món ăn mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Tên món</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Phở bò tái"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Vài dòng ghi nhớ vì sao món này đáng ăn..."
            />
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
              <label className="text-sm text-muted-foreground">Khoảng giá</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Không xác định</option>
                {PRICE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Độ cay</label>
              <select
                value={spicyLevel}
                onChange={(e) => setSpicyLevel(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {SPICY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
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
            {categoryId === NEW_CATEGORY && (
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tên danh mục mới"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Quán ăn (có thể chọn nhiều)</label>
            <RestaurantBadgeSelect restaurants={restaurants} selectedIds={restaurantIds} onChange={setRestaurantIds} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Tag (Đặc điểm)</label>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {allTags.map((t) => {
                  const currentTags = tags.split(",").map(x => x.trim()).filter(Boolean);
                  const isSelected = currentTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setTags(currentTags.filter(x => x !== t).join(", "));
                        } else {
                          setTags([...currentTags, t].join(", "));
                        }
                      }}
                      className={`px-2 py-1 text-[11px] rounded-md border transition-colors ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nhập thêm tag mới cách nhau bởi dấu phẩy..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {food ? "Lưu thay đổi" : "Thêm món"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
