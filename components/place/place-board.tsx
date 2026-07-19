"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Wheel } from "@/components/place/wheel";
import { PlaceCard } from "@/components/place/place-card";
import { PlaceFormDialog } from "@/components/place/place-form-dialog";
import { DataPortability } from "@/components/place/data-portability";
import type { Category } from "@prisma/client";
import type { PlaceWithRelations, PlaceWheelCandidate } from "@/types";
import type { Coordinates } from "@/lib/map";

const TILTS = [-0.8, 0.6, -0.4, 1, -1.1, 0.4];

export function PlaceBoard({
  places,
  candidates,
  categories,
  home,
}: {
  places: PlaceWithRelations[];
  candidates: PlaceWheelCandidate[];
  categories: Category[];
  home: Coordinates | null;
}) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [showBlacklisted, setShowBlacklisted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceWithRelations | null>(null);

  const filtered = useMemo(() => {
    return places.filter((p) => {
      if (!showBlacklisted && p.isBlacklisted) return false;
      if (categoryId && p.categoryId !== categoryId) return false;
      if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [places, search, categoryId, showBlacklisted]);

  function openCreate() {
    setEditingPlace(null);
    setFormOpen(true);
  }

  function openEdit(place: PlaceWithRelations) {
    setEditingPlace(place);
    setFormOpen(true);
  }

  return (
    <div className="container max-w-5xl py-14 sm:py-20">
      <header className="mx-auto max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {candidates.length} địa điểm đang chờ được chọn
        </p>
        <h1 className="mt-3 font-display text-4xl">Hôm nay chơi đâu?</h1>
        <p className="mt-2 text-muted-foreground">Quay một vòng, để chúng mình quyết định giúp.</p>
      </header>

      <section className="mt-10">
        <Wheel candidates={candidates} />
      </section>

      <section className="mt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <h2 className="font-display text-2xl">Danh sách địa điểm</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DataPortability />
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Thêm địa điểm
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm địa điểm..."
              className="w-48 rounded-full border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button onClick={() => setCategoryId(null)} className="shrink-0">
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
            {showBlacklisted ? "Đang hiện địa điểm đã loại" : "Ẩn địa điểm đã loại"}
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Chưa có địa điểm nào ở đây"
            description="Thêm địa điểm đầu tiên, hoặc thử bỏ bớt bộ lọc."
            className="mt-8"
            action={
              <Button size="sm" onClick={openCreate} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Thêm địa điểm
              </Button>
            }
          />
        ) : (
          <div className="mt-6 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            {filtered.map((place, i) => (
              <div key={place.id} className="break-inside-avoid">
                <PlaceCard place={place} tilt={TILTS[i % TILTS.length]} home={home} onEdit={openEdit} />
              </div>
            ))}
          </div>
        )}
      </section>

      <PlaceFormDialog open={formOpen} onOpenChange={setFormOpen} place={editingPlace} categories={categories} />
    </div>
  );
}