"use client";

import { useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { RotateCw, Star, EyeOff, MapPin, Globe, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrapCard } from "@/components/scrap-card";
import { hideForTodayAction, toggleFavoriteAction } from "@/actions/foods";
import { pickRandom } from "@/lib/random-engine";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { FoodWithRelations } from "@/types";
import type { Restaurant, Category } from "@prisma/client";
import { useMemo } from "react";

const SLICE_COLORS = [
  "hsl(var(--terracotta) / 0.5)",
  "hsl(var(--golden) / 0.45)",
  "hsl(var(--olive) / 0.42)",
  "hsl(var(--muted))",
];

function polarLabelPosition(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 50 + radius * Math.sin(rad), y: 50 - radius * Math.cos(rad) };
}

export function Wheel({ candidates, categories }: { candidates: FoodWithRelations[], categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<FoodWithRelations | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const pendingIndex = useRef(0);

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterPrice, setFilterPrice] = useState<string>("all");

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (filterCategory !== "all" && c.categoryId !== filterCategory) return false;
      if (filterPrice !== "all" && (c.priceRange || "") !== filterPrice) return false;
      if (filterTags.length > 0 && !filterTags.every((t) => c.tags.includes(t))) return false;
      return true;
    });
  }, [candidates, filterCategory, filterPrice, filterTags]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    candidates.forEach((c) => {
      if (filterCategory !== "all" && c.categoryId !== filterCategory) return;
      if (filterPrice !== "all" && (c.priceRange || "") !== filterPrice) return;
      c.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [candidates, filterCategory, filterPrice]);

  const n = filteredCandidates.length;
  const seg = n > 0 ? 360 / n : 0;
  const showLabels = n > 0 && n <= 12;

  const gradient =
    n > 0
      ? `conic-gradient(${filteredCandidates
          .map((_, i) => `${SLICE_COLORS[i % SLICE_COLORS.length]} ${i * seg}deg ${(i + 1) * seg}deg`)
          .join(", ")})`
      : "hsl(var(--muted))";

  function spin() {
    if (spinning || n === 0) return;
    setResult(null);
    setSelectedRestaurant(null);
    const { winner } = pickRandom(filteredCandidates);
    if (!winner) return;
    const index = Math.max(0, filteredCandidates.findIndex((c) => c.id === winner.id));
    pendingIndex.current = index;
    const center = index * seg + seg / 2;
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = ((360 - center - currentMod) % 360 + 360) % 360;
    const target = rotation + 5 * 360 + delta;
    setSpinning(true);
    setRotation(target);
  }

  function handleAnimationComplete() {
    setSpinning(false);
    setResult(filteredCandidates[pendingIndex.current] ?? null);
  }

  function hideToday() {
    if (!result) return;
    startTransition(async () => {
      await hideForTodayAction(result.id);
      toast("Đã trốn món này cho hôm nay.");
      setResult(null);
      setSelectedRestaurant(null);
      router.refresh();
    });
  }

  function favorite() {
    if (!result) return;
    const nextVal = !result.isFavorite;
    setResult({ ...result, isFavorite: nextVal });
    startTransition(async () => {
      await toggleFavoriteAction(result.id, nextVal);
      router.refresh();
    });
  }
  
  function randomRestaurant() {
    if (!result || result.restaurants.length === 0) return;
    const picked = result.restaurants[Math.floor(Math.random() * result.restaurants.length)];
    setSelectedRestaurant(picked);
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="w-full max-w-xl mx-auto flex flex-col gap-3 p-4 bg-card/60 backdrop-blur-sm rounded-2xl border border-border shadow-soft relative z-20">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setFilterTags([]); }}
            disabled={spinning}
            className="flex-1 min-w-[140px] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            <option value="all">Tất cả món</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterPrice}
            onChange={(e) => { setFilterPrice(e.target.value); setFilterTags([]); }}
            disabled={spinning}
            className="flex-1 min-w-[140px] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            <option value="all">Mọi mức giá</option>
            <option value="BUDGET">$ - Bình dân</option>
            <option value="MID">$$ - Vừa phải</option>
            <option value="PREMIUM">$$$ - Hơi sang</option>
            <option value="LUXURY">$$$$ - Đặc biệt</option>
          </select>
        </div>
        
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {availableTags.map((tag) => (
              <button
                key={tag}
                disabled={spinning}
                onClick={() => {
                  if (filterTags.includes(tag)) setFilterTags(filterTags.filter((t) => t !== tag));
                  else setFilterTags([...filterTags, tag]);
                }}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors disabled:opacity-50 ${
                  filterTags.includes(tag) 
                    ? "bg-primary text-primary-foreground border-primary font-medium" 
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/3">
          <div className="h-4 w-4 rotate-45 rounded-sm bg-primary shadow-soft" />
        </div>

        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3.2, ease: [0.13, 0, 0.15, 1] }}
          onAnimationComplete={handleAnimationComplete}
          style={{ background: gradient }}
          className="relative h-72 w-72 rounded-full border-4 border-card shadow-soft-lg sm:h-80 sm:w-80"
        >
          {showLabels &&
            filteredCandidates.map((c, i) => {
              const angle = i * seg + seg / 2;
              const pos = polarLabelPosition(angle, 37);
              return (
                <span
                  key={c.id}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  }}
                  className="pointer-events-none absolute max-w-[80px] truncate font-mono text-[10px] text-foreground/70"
                >
                  {c.name}
                </span>
              );
            })}
          <div className="absolute inset-[38%] rounded-full bg-card shadow-soft" />
        </motion.div>
      </div>

      <Button size="lg" onClick={spin} disabled={spinning || n === 0} className="gap-2">
        <RotateCw className={spinning ? "animate-spin" : ""} />
        {n === 0 ? "Chưa có món nào để quay" : spinning ? "Đang quay..." : "Hôm nay ăn..."}
      </Button>

      {result && (
        <div className="w-full max-w-sm animate-fade-in-up">
          {selectedRestaurant ? (
            <ScrapCard tilt={1} tape="golden" className="w-full text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                chốt hạ quán
              </p>
              <h3 className="mt-1 font-display text-2xl">{selectedRestaurant.name}</h3>
              {selectedRestaurant.address && (
                <p className="mt-2 text-sm text-muted-foreground">{selectedRestaurant.address}</p>
              )}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {(selectedRestaurant.googleMapUrl || (selectedRestaurant.latitude != null && selectedRestaurant.longitude != null)) && (
                  <Button size="sm" variant="outline" asChild className="gap-1.5">
                    <a
                      href={selectedRestaurant.googleMapUrl || `https://www.google.com/maps/dir/?api=1&destination=${selectedRestaurant.latitude},${selectedRestaurant.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-3.5 w-3.5" /> Chỉ đường
                    </a>
                  </Button>
                )}
                {selectedRestaurant.url && (
                  <Button size="sm" variant="outline" asChild className="gap-1.5">
                    <a href={selectedRestaurant.url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setSelectedRestaurant(null)} className="w-full mt-2">
                  ← Trở về món {result.name}
                </Button>
              </div>
            </ScrapCard>
          ) : (
            <ScrapCard tilt={1} tape="golden" className="w-full text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                hôm nay ăn
              </p>
              <h3 className="mt-1 font-display text-2xl">{result.name}</h3>
              {result.description && (
                <p className="mt-2 text-sm text-muted-foreground">{result.description}</p>
              )}
              {result.restaurants.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="mb-2 font-medium">Có thể ăn ở:</p>
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto rounded-xl border border-border/50 bg-background/50 p-2 text-left shadow-inner [scrollbar-width:thin]">
                    {result.restaurants.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-foreground/5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                          {r.address && <p className="truncate text-[11px] text-muted-foreground">{r.address}</p>}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          {(r.googleMapUrl || (r.latitude != null && r.longitude != null)) && (
                             <a
                               href={r.googleMapUrl || `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                             >
                               <MapPin className="h-3 w-3" />
                             </a>
                          )}
                          <button
                            onClick={() => setSelectedRestaurant(r)}
                            className="inline-flex h-7 px-2.5 font-medium items-center justify-center rounded-md bg-primary text-primary-foreground text-[11px] hover:bg-primary/90"
                          >
                            Chọn
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {result.restaurants.length >= 2 && (
                <div className="mt-4 flex justify-center">
                  <Button size="default" variant="default" onClick={randomRestaurant} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Dices className="h-4 w-4" /> Chọn ngẫu nhiên 1 quán
                  </Button>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Button size="sm" variant="outline" onClick={favorite} disabled={isPending} className="gap-1.5">
                  <Star className={result.isFavorite ? "h-3.5 w-3.5 fill-golden text-golden" : "h-3.5 w-3.5"} />
                  Yêu thích món
                </Button>
                <Button size="sm" variant="ghost" onClick={hideToday} disabled={isPending} className="gap-1.5">
                  <EyeOff className="h-3.5 w-3.5" /> bỏ qua
                </Button>
              </div>
            </ScrapCard>
          )}
        </div>
      )}
    </div>
  );
}