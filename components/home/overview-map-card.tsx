"use client";

import dynamic from "next/dynamic";
import { Loader2, Map, ArrowRight, Home, UtensilsCrossed, Coffee, MapPinned } from "lucide-react";
import type { OverviewMapMarker } from "./overview-map";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const OverviewMap = dynamic(() => import("./overview-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center bg-muted">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

export function OverviewMapCard({ markers }: { markers: OverviewMapMarker[] }) {
  return (
    <section className="mx-auto mt-20 max-w-5xl overflow-hidden rounded-card border border-border/70 bg-card shadow-soft">
      <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-7">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Map className="h-4 w-4" />
            <p className="font-mono text-xs uppercase tracking-[0.16em]">Bản đồ chung</p>
          </div>
          <h2 className="mt-1 font-display text-2xl">Những nơi của hai đứa</h2>
        </div>
        <div className="flex items-center gap-4">
          <p className="hidden sm:block font-mono text-xs text-muted-foreground">{markers.length} vị trí</p>
          <Button asChild variant="outline" size="sm" className="rounded-full gap-1.5 h-9 hidden sm:inline-flex">
            <Link href="/ban-do">
              Mở bản đồ <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="border-y border-border/70">
        <OverviewMap markers={markers} />
      </div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between sm:justify-start gap-x-6 gap-y-3 px-6 py-4 font-mono text-[11px] uppercase tracking-wider font-semibold text-muted-foreground sm:px-7">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <span className="flex items-center gap-1.5"><Home className="h-4 w-4 text-[#bd6a46]" /> Nhà</span>
          <span className="flex items-center gap-1.5"><UtensilsCrossed className="h-4 w-4 text-[#c9822d]" /> Quán ăn</span>
          <span className="flex items-center gap-1.5"><Coffee className="h-4 w-4 text-[#7b5b45]" /> Quán cà phê</span>
          <span className="flex items-center gap-1.5"><MapPinned className="h-4 w-4 text-[#547b69]" /> Địa điểm vui chơi</span>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full sm:hidden rounded-full gap-1.5 h-9 mt-2">
          <Link href="/ban-do">
            Mở bản đồ <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
