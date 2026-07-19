"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Cafe } from "@prisma/client";

/**
 * Multi-select cho Cafe — cùng UX pattern với RestaurantBadgeSelect của
 * Food (mỗi quán một Badge, click để chọn/bỏ). Xây mới độc lập theo
 * phương án B (đã xác nhận): không sửa/generic-hoá file Food.
 */
export function CafeBadgeSelect({
  cafes,
  selectedIds,
  onChange,
}: {
  cafes: Cafe[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cafes;
    return cafes.filter((c) => c.name.toLowerCase().includes(q));
  }, [cafes, search]);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  if (cafes.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Chưa có quán cà phê nào. Thêm quán trong mục &ldquo;Quán cà phê&rdquo; trước nhé.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm quán..."
          className="w-full rounded-xl border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground">Không tìm thấy quán nào khớp &ldquo;{search}&rdquo;.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {filtered.map((c) => {
            const active = selectedIds.includes(c.id);
            return (
              <button key={c.id} type="button" onClick={() => toggle(c.id)} className="shrink-0" aria-pressed={active}>
                <Badge variant={active ? "olive" : "outline"}>{c.name}</Badge>
              </button>
            );
          })}
        </div>
      )}

      {selectedIds.length > 0 && (
        <p className="font-mono text-[11px] text-muted-foreground">Đã chọn {selectedIds.length} quán</p>
      )}
    </div>
  );
}
