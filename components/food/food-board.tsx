"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Store, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Wheel } from "@/components/food/wheel";
import { FoodCard } from "@/components/food/food-card";
import { FoodFormDialog } from "@/components/food/food-form-dialog";
import { RestaurantManagerDialog } from "@/components/food/restaurant-manager-dialog";
import type { Category, Restaurant } from "@prisma/client";
import type { FoodWithRelations } from "@/types";
import type { Coordinates } from "@/lib/map";

const TILTS = [-0.8, 0.6, -0.4, 1, -1.1, 0.4];

export function FoodBoard({
  foods,
  candidates,
  categories,
  restaurants,
  home,
}: {
  foods: FoodWithRelations[];
  candidates: FoodWithRelations[];
  categories: Category[];
  restaurants: Restaurant[];
  home: Coordinates | null;
}) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [showBlacklisted, setShowBlacklisted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodWithRelations | null>(null);
  const [restaurantDialogOpen, setRestaurantDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    return foods.filter((f) => {
      if (!showBlacklisted && f.isBlacklisted) return false;
      if (categoryId && f.categoryId !== categoryId) return false;
      if (search.trim() && !f.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [foods, search, categoryId, showBlacklisted]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    foods.forEach((f) => f.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [foods]);

  function openCreate() {
    setEditingFood(null);
    setFormOpen(true);
  }

  function openEdit(food: FoodWithRelations) {
    setEditingFood(food);
    setFormOpen(true);
  }

  return (
    <div className="container max-w-5xl py-14 sm:py-20">
      <header className="mx-auto max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {candidates.length} món đang chờ được chọn
        </p>
        <h1 className="mt-3 font-display text-4xl">Hôm nay ăn gì?</h1>
        <p className="mt-2 text-muted-foreground">Quay một vòng, để chúng mình quyết định giúp.</p>
      </header>

      <section className="mt-10">
        <Wheel candidates={candidates} categories={categories} />
      </section>

      <section className="mt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <h2 className="font-display text-2xl">Danh sách món</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setRestaurantDialogOpen(true)} className="gap-1.5">
              <Store className="h-3.5 w-3.5" /> Quán ăn
            </Button>
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Thêm món
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm món..."
              className="w-48 rounded-full border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setCategoryId(null)}
            className="shrink-0"
          >
            <Badge variant={categoryId === null ? "olive" : "outline"}>Tất cả</Badge>
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCategoryId(c.id)} className="shrink-0">
              <Badge variant={categoryId === c.id ? "olive" : "outline"}>{c.name}</Badge>
            </button>
          ))}
          <button
            onClick={() => setShowBlacklisted((v) => !v)}
            className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-3 w-3" />
            {showBlacklisted ? "Đang hiện món đã loại" : "Ẩn món đã loại"}
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Chưa có món nào ở đây"
            description="Thêm món đầu tiên, hoặc thử bỏ bớt bộ lọc."
            className="mt-8"
            action={
              <Button size="sm" onClick={openCreate} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Thêm món
              </Button>
            }
          />
        ) : (
          <div className="mt-6 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            {filtered.map((food, i) => (
              <div key={food.id} className="break-inside-avoid">
                <FoodCard food={food} tilt={TILTS[i % TILTS.length]} home={home} onEdit={openEdit} />
              </div>
            ))}
          </div>
        )}
      </section>

      <FoodFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        food={editingFood}
        categories={categories}
        restaurants={restaurants}
        allTags={allTags}
      />
      <RestaurantManagerDialog
        open={restaurantDialogOpen}
        onOpenChange={setRestaurantDialogOpen}
        restaurants={restaurants}
        categories={categories}
      />
    </div>
  );
}
