"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCw, MapPin, Globe, Loader2, Dices, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrapCard } from "@/components/scrap-card";
import { 
  searchDatabaseForWinnerAction, 
  getGuestImportDataAction, 
  type GuestSearchResult, 
  type GuestLocation, 
  type GuestImportData 
} from "@/actions/guest";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

export function GuestWheel({ defaultEntries }: { defaultEntries: string[] }) {
  const [entries, setEntries] = useState(defaultEntries.join("\n"));
  const [candidates, setCandidates] = useState<string[]>(defaultEntries);
  
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const [dbResult, setDbResult] = useState<GuestSearchResult | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GuestLocation | null>(null);
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState<GuestImportData | null>(null);
  const [loadingImportData, setLoadingImportData] = useState(false);

  const pendingIndex = useRef(0);

  async function openImportDialog() {
    setImportDialogOpen(true);
    if (!importData) {
      setLoadingImportData(true);
      try {
        const data = await getGuestImportDataAction();
        setImportData(data);
      } finally {
        setLoadingImportData(false);
      }
    }
  }

  function appendEntries(names: string[]) {
    const currentList = entries.split("\n").map(s => s.trim()).filter(Boolean);
    const currentSet = new Set(currentList.map(s => s.toLowerCase()));
    
    const newList = [...currentList];
    for (const name of names) {
      if (!currentSet.has(name.toLowerCase())) {
        newList.push(name);
        currentSet.add(name.toLowerCase());
      }
    }
    
    setEntries(newList.join("\n"));
    setImportDialogOpen(false);
  }

  useEffect(() => {
    const list = entries.split("\n").map(s => s.trim()).filter(s => s.length > 0);
    setCandidates(list);
  }, [entries]);

  const n = candidates.length;
  const seg = n > 0 ? 360 / n : 0;
  const showLabels = n > 0 && n <= 15;

  const gradient =
    n > 0
      ? `conic-gradient(${candidates
          .map((_, i) => `${SLICE_COLORS[i % SLICE_COLORS.length]} ${i * seg}deg ${(i + 1) * seg}deg`)
          .join(", ")})`
      : "hsl(var(--muted))";

  function spin() {
    if (spinning || n === 0) return;
    setResultText(null);
    setDbResult(null);
    setSelectedLocation(null);
    
    const index = Math.floor(Math.random() * n);
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
    const winner = candidates[pendingIndex.current];
    setResultText(winner);
    
    startTransition(async () => {
      const res = await searchDatabaseForWinnerAction(winner);
      setDbResult(res);
    });
  }

  function randomLocation() {
    if (!dbResult || dbResult.locations.length === 0) return;
    const picked = dbResult.locations[Math.floor(Math.random() * dbResult.locations.length)];
    setSelectedLocation(picked);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start">
      <div className="flex flex-col gap-4 bg-card border border-border/50 shadow-soft-xl rounded-[2rem] p-6 lg:p-8 order-2 lg:order-1">
        <div>
          <h2 className="font-display text-2xl">Danh sách lựa chọn</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Nhập các món ăn hoặc địa điểm (mỗi dòng 1 lựa chọn). 
          </p>
        </div>
        <textarea
          value={entries}
          onChange={(e) => setEntries(e.target.value)}
          className="w-full h-64 lg:h-96 resize-none rounded-xl border border-border bg-background/50 p-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Ví dụ:&#10;Phở&#10;Bún chả&#10;Xem phim&#10;Nhà hàng Pháp"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground gap-2">
          <span>Tổng cộng: {n} lựa chọn</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={openImportDialog} className="gap-1.5 shrink-0">
              <Database className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Nhập nhanh từ CSDL</span><span className="sm:hidden">Từ CSDL</span>
            </Button>
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => {
              const arr = entries.split("\n").map(s => s.trim()).filter(s => s.length > 0);
              for (let i = arr.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [arr[i], arr[j]] = [arr[j], arr[i]];
              }
              setEntries(arr.join("\n"));
            }}>
              Trộn ngẫu nhiên
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 order-1 lg:order-2">
        <div className="relative">
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/3">
            <div className="h-4 w-4 rotate-45 rounded-sm bg-primary shadow-soft" />
          </div>

          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3.2, ease: [0.13, 0, 0.15, 1] }}
            onAnimationComplete={handleAnimationComplete}
            style={{ background: gradient }}
            className="relative h-72 w-72 sm:h-96 sm:w-96 rounded-full border-4 border-card shadow-soft-lg"
          >
            {showLabels &&
              candidates.map((c, i) => {
                const angle = i * seg + seg / 2;
                const pos = polarLabelPosition(angle, 37);
                return (
                  <span
                    key={`${c}-${i}`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                    }}
                    className="pointer-events-none absolute max-w-[100px] truncate font-mono text-[11px] sm:text-xs text-foreground/70"
                  >
                    {c}
                  </span>
                );
              })}
            <div className="absolute inset-[38%] rounded-full bg-card shadow-soft" />
          </motion.div>
        </div>

        <Button size="lg" onClick={spin} disabled={spinning || n === 0} className="gap-2 w-full max-w-xs">
          <RotateCw className={spinning ? "animate-spin" : ""} />
          {n === 0 ? "Chưa có lựa chọn" : spinning ? "Đang quay..." : "Hôm nay ăn..."}
        </Button>

        {resultText && (
          <div className="w-full max-w-sm animate-fade-in-up">
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">Đang tìm dữ liệu...</p>
              </div>
            ) : dbResult?.found ? (
              <ScrapCard tilt={1} tape={dbResult.type === "FOOD" ? "golden" : "terracotta"} className="w-full text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Hôm nay chốt
                </p>
                <h3 className="mt-1 font-display text-2xl">{dbResult.name}</h3>
                
                {selectedLocation ? (
                  <>
                    <p className="mt-4 font-mono text-xs uppercase tracking-widest text-primary mb-1">Đã chốt ngẫu nhiên</p>
                    <div className="bg-background/50 rounded-xl p-3 border border-border/50 text-left">
                      <p className="font-medium">{selectedLocation.name}</p>
                      {selectedLocation.address && <p className="text-xs text-muted-foreground truncate mt-0.5">{selectedLocation.address}</p>}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      {(selectedLocation.googleMapUrl || (selectedLocation.latitude != null && selectedLocation.longitude != null)) && (
                        <Button size="sm" variant="outline" asChild className="gap-1.5">
                          <a
                            href={selectedLocation.googleMapUrl || `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin className="h-3.5 w-3.5" /> Chỉ đường
                          </a>
                        </Button>
                      )}
                      {selectedLocation.url && (
                        <Button size="sm" variant="outline" asChild className="gap-1.5">
                          <a href={selectedLocation.url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-3.5 w-3.5" /> Website
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setSelectedLocation(null)} className="w-full mt-2">
                        ← Trở về danh sách
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {dbResult.locations.length > 0 && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        <p className="mb-2 font-medium">Hệ thống có các gợi ý địa chỉ sau:</p>
                        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto rounded-xl border border-border/50 bg-background/50 p-2 text-left shadow-inner [scrollbar-width:thin]">
                          {dbResult.locations.map((loc) => (
                            <div key={loc.id} className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-foreground/5">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">{loc.name}</p>
                                {loc.address && <p className="truncate text-[11px] text-muted-foreground">{loc.address}</p>}
                              </div>
                              <div className="flex shrink-0 gap-1">
                                {(loc.googleMapUrl || (loc.latitude != null && loc.longitude != null)) && (
                                   <a
                                     href={loc.googleMapUrl || `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                   >
                                     <MapPin className="h-3 w-3" />
                                   </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {dbResult.locations.length >= 2 && (
                      <div className="mt-4 flex justify-center">
                        <Button size="default" variant="default" onClick={randomLocation} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                          <Dices className="h-4 w-4" /> Chọn ngẫu nhiên 1 địa chỉ
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </ScrapCard>
            ) : (
              <ScrapCard tilt={1} tape="olive" className="w-full text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Hôm nay chốt
                </p>
                <h3 className="mt-1 font-display text-2xl">{resultText}</h3>
                <p className="mt-3 text-sm text-muted-foreground italic">
                  Không tìm thấy gợi ý địa điểm nào cho lựa chọn này trên hệ thống. Bạn có thể tự tìm kiếm trên Google Map nhé!
                </p>
              </ScrapCard>
            )}
          </div>
        )}
      </div>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Nhập nhanh từ CSDL</DialogTitle>
            <DialogDescription>
              Chọn một danh mục hoặc thẻ để điền tự động danh sách các món vào bảng lựa chọn.
            </DialogDescription>
          </DialogHeader>
          
          {loadingImportData || !importData ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="space-y-6 mt-2">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground">Nhóm chung</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => appendEntries(importData.foods.map(f => f.name))}>
                    Tất cả món ăn ({importData.foods.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => appendEntries(importData.cafes.map(f => f.name))}>
                    Tất cả đồ uống ({importData.cafes.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => appendEntries(importData.places.map(f => f.name))}>
                    Tất cả chỗ chơi ({importData.places.length})
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground">Theo Danh mục</h4>
                <div className="flex flex-wrap gap-2">
                  {importData.categories.map(cat => {
                    const count = 
                      importData.foods.filter(f => f.categoryId === cat.id).length + 
                      importData.places.filter(p => p.categoryId === cat.id).length + 
                      importData.cafes.filter(c => c.categoryId === cat.id).length;
                      
                    if (count === 0) return null;
                    
                    return (
                      <Button 
                        key={cat.id} 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => {
                          const items = [
                            ...importData.foods.filter(f => f.categoryId === cat.id).map(f => f.name),
                            ...importData.places.filter(p => p.categoryId === cat.id).map(p => p.name),
                            ...importData.cafes.filter(c => c.categoryId === cat.id).map(c => c.name),
                          ];
                          appendEntries(items);
                        }}
                      >
                        {cat.name} ({count})
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              {(() => {
                const tagSet = new Set<string>();
                importData.foods.forEach(f => f.tags.forEach(t => tagSet.add(t)));
                const allTags = Array.from(tagSet).sort();
                
                if (allTags.length === 0) return null;
                
                return (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-foreground">Theo Đặc điểm (Tags của món ăn)</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.map(tag => {
                        const items = importData.foods.filter(f => f.tags.includes(tag)).map(f => f.name);
                        return (
                          <button
                            key={tag}
                            onClick={() => appendEntries(items)}
                            className="px-2.5 py-1 text-xs rounded-full border bg-background text-muted-foreground border-border hover:bg-foreground/[0.06] hover:text-foreground transition-colors"
                          >
                            {tag} ({items.length})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
