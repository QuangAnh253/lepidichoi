"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X, ExternalLink, Navigation } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  createRestaurantAction,
  updateRestaurantAction,
  deleteRestaurantAction,
} from "@/actions/restaurants";
import { getOrCreateCategoryAction } from "@/actions/foods";
import type { Restaurant, Category } from "@prisma/client";
import { MapPickerDialog } from "@/components/drink/map-picker-dialog";
import { formatCoordinates, type Coordinates } from "@/lib/map";

interface RestaurantManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurants: Restaurant[];
  categories: Category[];
}

const NEW_CATEGORY = "__new__";

type Draft = { name: string; address: string; coordinates: Coordinates | null; imageUrl: string; url: string; googleMapUrl: string; priceRange: string; categoryId: string; newCategoryName: string; };
const EMPTY_DRAFT: Draft = { name: "", address: "", coordinates: null, imageUrl: "", url: "", googleMapUrl: "", priceRange: "", categoryId: "", newCategoryName: "" };

export function RestaurantManagerDialog({ open, onOpenChange, restaurants, categories }: RestaurantManagerDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  function startEdit(r: Restaurant) {
    setEditingId(r.id);
    setCreating(false);
    setDraft({ name: r.name, address: r.address ?? "", coordinates: r.latitude != null && r.longitude != null ? { latitude: r.latitude, longitude: r.longitude } : null, imageUrl: r.imageUrl ?? "", url: r.url ?? "", googleMapUrl: r.googleMapUrl ?? "", priceRange: r.priceRange ?? "", categoryId: r.categoryId ?? "", newCategoryName: "" });
  }

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  }

  function cancel() {
    setEditingId(null);
    setCreating(false);
    setDraft(EMPTY_DRAFT);
  }

  function save() {
    if (!draft.name.trim()) {
      toast.error("Cần có tên quán.");
      return;
    }
    startTransition(async () => {
      let finalCategoryId = draft.categoryId;
      if (draft.categoryId === NEW_CATEGORY) {
        if (!draft.newCategoryName.trim()) {
          toast.error("Nhập tên danh mục mới nhé.");
          return;
        }
        const created = await getOrCreateCategoryAction(draft.newCategoryName);
        finalCategoryId = created?.id ?? "";
      }

      const input = {
        name: draft.name.trim(),
        address: draft.address.trim() || null,
        latitude: draft.coordinates?.latitude ?? null,
        longitude: draft.coordinates?.longitude ?? null,
        imageUrl: draft.imageUrl.trim() || null,
        url: draft.url.trim() || null,
        googleMapUrl: draft.googleMapUrl.trim() || null,
        priceRange: draft.priceRange === "" ? null : (draft.priceRange as any),
        categoryId: finalCategoryId || null,
      };
      if (editingId) {
        await updateRestaurantAction(editingId, input);
        toast.success("Đã cập nhật quán.");
      } else {
        await createRestaurantAction(input);
        toast.success("Đã thêm quán mới.");
      }
      router.refresh();
      cancel();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteRestaurantAction(id);
      toast("Đã xoá quán.");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quán ăn</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {restaurants.map((r) =>
            editingId === r.id ? (
              <RestaurantDraftRow key={r.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} categories={categories} />
            ) : (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/70 px-3.5 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  {r.address && <p className="text-xs text-muted-foreground">{r.address}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <a href={googleMapUrl(r)} target="_blank" rel="noopener noreferrer" aria-label="Xem trên Google Maps"><Button size="icon" variant="ghost" className="h-8 w-8"><ExternalLink className="h-3.5 w-3.5" /></Button></a>
                  <a href={directionsUrl(r)} target="_blank" rel="noopener noreferrer" aria-label="Chỉ đường"><Button size="icon" variant="ghost" className="h-8 w-8"><Navigation className="h-3.5 w-3.5" /></Button></a>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(r)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={isPending}
                    onClick={() => remove(r.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          )}

          {creating && (
            <RestaurantDraftRow draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} categories={categories} />
          )}

          {!creating && (
            <Button variant="outline" size="sm" onClick={startCreate} className="w-full gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Thêm quán
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RestaurantDraftRow({
  draft,
  setDraft,
  onSave,
  onCancel,
  categories,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  categories: Category[];
}) {
  return (
    <div className="space-y-2 rounded-xl border border-border/70 p-3.5">
      <input
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        placeholder="Tên quán"
        autoFocus
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        value={draft.address}
        onChange={(e) => setDraft({ ...draft, address: e.target.value })}
        placeholder="Địa chỉ (không bắt buộc)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <MapPickerDialog initialValue={draft.coordinates} onConfirm={(coordinates) => setDraft({ ...draft, coordinates })} />
      {draft.coordinates && <p className="font-mono text-[11px] text-muted-foreground">{formatCoordinates(draft.coordinates)}</p>}
      <input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="Ảnh (URL)" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
      <input value={draft.googleMapUrl} onChange={(e) => setDraft({ ...draft, googleMapUrl: e.target.value })} placeholder="Google Map URL (Tuỳ chọn)" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
      <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="Website/ Facebook (1 URL)" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
      <div className="grid grid-cols-2 gap-2">
        <select value={draft.priceRange} onChange={(e) => setDraft({ ...draft, priceRange: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
          <option value="">Khoảng giá (Không xác định)</option>
          <option value="BUDGET">$ - bình dân</option>
          <option value="MID">$$ - vừa phải</option>
          <option value="PREMIUM">$$$ - hơi sang</option>
          <option value="LUXURY">$$$$ - đặc biệt</option>
        </select>
      </div>
      <select value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
        <option value="">Không phân loại</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
        <option value={NEW_CATEGORY}>+ Tạo danh mục mới</option>
      </select>
      {draft.categoryId === NEW_CATEGORY && (
        <input
          value={draft.newCategoryName}
          onChange={(e) => setDraft({ ...draft, newCategoryName: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Tên danh mục mới (Bún, Phở, Cơm...)"
        />
      )}
      <div className="flex justify-end gap-1.5">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" className="h-8 w-8" onClick={onSave}>
          <Check className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function googleMapUrl(place: Pick<Restaurant, "name" | "address" | "latitude" | "longitude" | "googleMapUrl">) {
  if (place.googleMapUrl) return place.googleMapUrl;
  const query = place.latitude != null && place.longitude != null ? `${place.latitude},${place.longitude}` : `${place.name} ${place.address ?? ""}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
function directionsUrl(place: Pick<Restaurant, "name" | "address" | "latitude" | "longitude" | "googleMapUrl">) {
  if (place.googleMapUrl) return place.googleMapUrl;
  const destination = place.latitude != null && place.longitude != null ? `${place.latitude},${place.longitude}` : `${place.name} ${place.address ?? ""}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}
