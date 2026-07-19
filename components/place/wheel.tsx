"use client";

import { useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { RotateCw, Star, EyeOff, MapPin, Globe, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrapCard } from "@/components/scrap-card";
import { hidePlaceForTodayAction, togglePlaceFavoriteAction } from "@/actions/places";
import { pickRandom } from "@/lib/random-engine";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PlaceWithRelations, PlaceWheelCandidate } from "@/types";

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

export function Wheel({ candidates }: { candidates: PlaceWheelCandidate[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<PlaceWheelCandidate | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<PlaceWithRelations | null>(null);
  const pendingIndex = useRef(0);

  const n = candidates.length;
  const seg = n > 0 ? 360 / n : 0;
  const showLabels = n > 0 && n <= 12;

  const gradient =
    n > 0
      ? `conic-gradient(${candidates
          .map((_, i) => `${SLICE_COLORS[i % SLICE_COLORS.length]} ${i * seg}deg ${(i + 1) * seg}deg`)
          .join(", ")})`
      : "hsl(var(--muted))";

  function spin() {
    if (spinning || n === 0) return;
    setResult(null);
    setSelectedSubItem(null);
    const { winner } = pickRandom(candidates);
    if (!winner) return;
    const index = Math.max(0, candidates.findIndex((c) => c.id === winner.id));
    pendingIndex.current = index;
    const center = index * seg + seg / 2;
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = (((360 - center - currentMod) % 360) + 360) % 360;
    const target = rotation + 5 * 360 + delta;
    setSpinning(true);
    setRotation(target);
  }

  function handleAnimationComplete() {
    setSpinning(false);
    setResult(candidates[pendingIndex.current] ?? null);
  }

  function hideToday(placeId: string) {
    startTransition(async () => {
      await hidePlaceForTodayAction(placeId);
      toast("Đã trốn địa điểm này cho hôm nay.");
      if (result?.type === "PLACE" || selectedSubItem) {
        setResult(null);
        setSelectedSubItem(null);
      }
      router.refresh();
    });
  }

  function favorite(place: PlaceWithRelations) {
    const nextVal = !place.isFavorite;
    if (selectedSubItem && selectedSubItem.id === place.id) {
      setSelectedSubItem({ ...selectedSubItem, isFavorite: nextVal });
    } else if (result?.type === "PLACE" && result.place.id === place.id) {
      setResult({ ...result, place: { ...result.place, isFavorite: nextVal } });
    }
    startTransition(async () => {
      await togglePlaceFavoriteAction(place.id, nextVal);
      router.refresh();
    });
  }
  
  function randomSubItem() {
    if (result?.type !== "CATEGORY" || result.places.length === 0) return;
    const picked = result.places[Math.floor(Math.random() * result.places.length)];
    setSelectedSubItem(picked);
  }

  return (
    <div className="flex flex-col items-center gap-8">
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
            candidates.map((c, i) => {
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
                  {c.type === "CATEGORY" ? c.category.name : c.place.name}
                </span>
              );
            })}
          <div className="absolute inset-[38%] rounded-full bg-card shadow-soft" />
        </motion.div>
      </div>

      <Button size="lg" onClick={spin} disabled={spinning || n === 0} className="gap-2">
        <RotateCw className={spinning ? "animate-spin" : ""} />
        {n === 0 ? "Chưa có địa điểm nào để quay" : spinning ? "Đang quay..." : "Hôm nay đi..."}
      </Button>

      {result && (
        <div className="w-full max-w-sm animate-fade-in-up">
          {result.type === "PLACE" || selectedSubItem ? (
            <ScrapCard tilt={1} tape="terracotta" className="w-full text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                hôm nay chơi
              </p>
              <h3 className="mt-1 font-display text-2xl">
                {selectedSubItem ? selectedSubItem.name : (result as any).place.name}
              </h3>
              {(selectedSubItem ? selectedSubItem.category : (result as any).place.category) && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedSubItem ? selectedSubItem.category?.name : (result as any).place.category?.name}
                </p>
              )}
              {(selectedSubItem ? selectedSubItem.address : (result as any).place.address) && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedSubItem ? selectedSubItem.address : (result as any).place.address}
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {(() => {
                  const p = selectedSubItem || (result as any).place;
                  return (
                    <>
                      {(p.googleMapUrl || (p.latitude != null && p.longitude != null)) && (
                        <Button size="sm" variant="outline" asChild className="gap-1.5">
                          <a
                            href={p.googleMapUrl || `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin className="h-3.5 w-3.5" /> Chỉ đường
                          </a>
                        </Button>
                      )}
                      {p.url && (
                        <Button size="sm" variant="outline" asChild className="gap-1.5">
                          <a href={p.url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-3.5 w-3.5" /> Website
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => favorite(p)} disabled={isPending} className="gap-1.5">
                        <Star className={p.isFavorite ? "h-3.5 w-3.5 fill-golden text-golden" : "h-3.5 w-3.5"} />
                        Yêu thích
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => hideToday(p.id)} disabled={isPending} className="gap-1.5">
                        <EyeOff className="h-3.5 w-3.5" /> bỏ qua
                      </Button>
                      
                      {selectedSubItem && (
                        <Button size="sm" variant="ghost" onClick={() => setSelectedSubItem(null)} className="w-full mt-2">
                          ← Trở về danh sách
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            </ScrapCard>
          ) : (
            <ScrapCard tilt={1} tape="terracotta" className="w-full text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                hôm nay đi
              </p>
              <h3 className="mt-1 font-display text-2xl">{result.category.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Có {result.places.length} địa điểm trong danh mục này.
              </p>
              
              <div className="mt-4 flex justify-center">
                <Button size="default" variant="default" onClick={randomSubItem} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Dices className="h-4 w-4" /> Chọn ngẫu nhiên 1 địa điểm
                </Button>
              </div>

              <div className="mt-5 max-h-56 overflow-y-auto rounded-xl border border-border/50 bg-background/50 p-2 text-left shadow-inner [scrollbar-width:thin]">
                <div className="flex flex-col gap-1.5">
                  {result.places.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-foreground/5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        {p.address && <p className="truncate text-xs text-muted-foreground">{p.address}</p>}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {(p.googleMapUrl || (p.latitude != null && p.longitude != null)) && (
                           <a
                             href={p.googleMapUrl || `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                           >
                             <MapPin className="h-3 w-3" />
                           </a>
                        )}
                        <button
                          onClick={() => setSelectedSubItem(p)}
                          className="inline-flex h-7 px-2 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90"
                        >
                          Chọn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrapCard>
          )}
        </div>
      )}
    </div>
  );
}