"use client";

import { useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { RotateCw, Star, EyeOff, MapPin, Globe, BookOpen, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ScrapCard } from "@/components/scrap-card";
import { hideCafeForTodayAction, toggleCafeFavoriteAction } from "@/actions/cafes";
import { pickRandom } from "@/lib/random-engine";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CafeWithRelations } from "@/types";

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

export function Wheel({ candidates }: { candidates: CafeWithRelations[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<CafeWithRelations | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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

  function hideToday() {
    if (!result) return;
    startTransition(async () => {
      await hideCafeForTodayAction(result.id);
      toast("Đã ẩn quán này cho hôm nay.");
      setResult(null);
      router.refresh();
    });
  }

  function favorite() {
    if (!result) return;
    const nextVal = !result.isFavorite;
    setResult({ ...result, isFavorite: nextVal });
    startTransition(async () => {
      await toggleCafeFavoriteAction(result.id, nextVal);
      router.refresh();
    });
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
                  {c.name}
                </span>
              );
            })}
          <div className="absolute inset-[38%] rounded-full bg-card shadow-soft" />
        </motion.div>
      </div>

      <Button size="lg" onClick={spin} disabled={spinning || n === 0} className="gap-2">
        <RotateCw className={spinning ? "animate-spin" : ""} />
        {n === 0 ? "Chưa có quán nào để quay" : spinning ? "Đang quay..." : "Hôm nay tới..."}
      </Button>

      {result && (
        <ScrapCard tilt={1} tape="golden" className="w-full max-w-sm text-center animate-fade-in-up">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">hôm nay tới</p>
          <h3 className="mt-1 font-display text-2xl">{result.name}</h3>
          {result.address && <p className="mt-2 text-sm text-muted-foreground">{result.address}</p>}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {(result.googleMapUrl || (result.latitude != null && result.longitude != null)) && (
              <Button size="sm" variant="outline" asChild className="gap-1.5">
                <a
                  href={result.googleMapUrl || `https://www.google.com/maps/dir/?api=1&destination=${result.latitude},${result.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-3.5 w-3.5" /> Chỉ đường
                </a>
              </Button>
            )}
            {result.url && (
              <Button size="sm" variant="outline" asChild className="gap-1.5">
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-3.5 w-3.5" /> Website
                </a>
              </Button>
            )}
            {(result.menuUrl || (result.drinks && result.drinks.length > 0)) && (
              <Button size="sm" variant="outline" onClick={() => setMenuOpen(true)} className="gap-1.5 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 hover:text-amber-800 border-amber-500/30">
                <BookOpen className="h-3.5 w-3.5" /> Xem Menu
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={favorite} disabled={isPending} className="gap-1.5">
              <Star className={result.isFavorite ? "h-3.5 w-3.5 fill-golden text-golden" : "h-3.5 w-3.5"} />
              Yêu thích
            </Button>
            <Button size="sm" variant="ghost" onClick={hideToday} disabled={isPending} className="gap-1.5">
              <EyeOff className="h-3.5 w-3.5" /> bỏ qua
            </Button>
          </div>
        </ScrapCard>
      )}

      {result && (
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Menu: {result.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-6">
              {result.menuUrl && (
                <div className="rounded-xl border border-border bg-black/5 overflow-hidden">
                  <TransformWrapper
                    initialScale={1}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit={true}
                    wheel={{ step: 0.1 }}
                  >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                      <div className="flex flex-col">
                        <div className="flex items-center justify-end gap-1 p-2 bg-background/80 border-b border-border/50">
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => zoomIn()}>
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => zoomOut()}>
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => resetTransform()}>
                            <Maximize className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-center bg-transparent cursor-grab active:cursor-grabbing w-full">
                          <TransformComponent wrapperClass="!w-full flex justify-center" contentClass="!w-full flex justify-center">
                            <img src={result.menuUrl!} alt={`Menu của ${result.name}`} className="max-w-full max-h-[60vh] object-contain pointer-events-none" />
                          </TransformComponent>
                        </div>
                      </div>
                    )}
                  </TransformWrapper>
                </div>
              )}
              {result.drinks && result.drinks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold border-b border-border/60 pb-2">Danh sách món gợi ý:</h4>
                  <ul className="space-y-2">
                    {result.drinks.map((d) => (
                      <li key={d.id} className="flex items-center gap-2 text-sm">
                        <Star className={`h-4 w-4 flex-none ${d.isFavorite ? "fill-golden text-golden" : "text-muted-foreground"}`} />
                        <span>{d.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}