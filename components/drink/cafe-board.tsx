"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Store, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Wheel } from "@/components/drink/wheel";
import { CafeCard } from "@/components/drink/cafe-card";
import { CafeManagerDialog } from "@/components/drink/cafe-manager-dialog";
import { DataPortability } from "@/components/drink/data-portability";
import type { Category } from "@prisma/client";
import type { CafeWithRelations } from "@/types";
import type { Coordinates } from "@/lib/map";

const TILTS = [-0.8, 0.6, -0.4, 1, -1.1, 0.4];

export function CafeBoard({
  cafes,
  candidates,
  categories,
  home,
}: {
  cafes: CafeWithRelations[];
  candidates: CafeWithRelations[];
  categories: Category[];
  home: Coordinates | null;
}) {
  const [search, setSearch] = useState("");
  const [showBlacklisted, setShowBlacklisted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCafe, setEditingCafe] = useState<CafeWithRelations | null>(null);

  const filtered = useMemo(() => {
    return cafes.filter((c) => {
      if (!showBlacklisted && c.isBlacklisted) return false;
      if (search.trim() && !c.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [cafes, search, showBlacklisted]);

  function openCreate() {
    setEditingCafe(null);
    setFormOpen(true);
  }

  function openEdit(cafe: CafeWithRelations) {
    setEditingCafe(cafe);
    setFormOpen(true);
  }

  return (
    <div className="container max-w-5xl py-14 sm:py-20">
      <header className="mx-auto max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {candidates.length} quán đang chờ được chọn
        </p>
        <h1 className="mt-3 font-display text-4xl">Hôm nay uống gì?</h1>
        <p className="mt-2 text-muted-foreground">Quay một vòng, để chúng mình quyết định giúp.</p>
      </header>

      <section className="mt-10">
        {/* Pass candidate names instead of drink candidates */}
        <Wheel candidates={candidates as any} />
      </section>

      <section className="mt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <h2 className="font-display text-2xl">Danh sách quán cà phê</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DataPortability />
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Thêm quán
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm quán..."
              className="w-48 rounded-full border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setShowBlacklisted((v) => !v)}
            className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-3 w-3" />
            {showBlacklisted ? "Đang hiện quán đã loại" : "Ẩn quán đã loại"}
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Chưa có quán nào ở đây"
            description="Thêm quán đầu tiên, hoặc thử bỏ bớt bộ lọc."
            className="mt-8"
            action={
              <Button size="sm" onClick={openCreate} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Thêm quán
              </Button>
            }
          />
        ) : (
          <div className="mt-6 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            {filtered.map((cafe, i) => (
              <div key={cafe.id} className="break-inside-avoid">
                <CafeCard cafe={cafe} tilt={TILTS[i % TILTS.length]} home={home} onEdit={openEdit} />
              </div>
            ))}
          </div>
        )}
      </section>

      <CafeManagerDialog open={formOpen} onOpenChange={setFormOpen} cafe={editingCafe} categories={categories} />
    </div>
  );
}
