"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Ban, EyeOff, Eye, Pencil, Trash2, MapPin, Coffee } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICE_LABEL } from "@/lib/food-labels";
import { distanceEngine, type Coordinates } from "@/lib/map";
import {
  toggleCafeFavoriteAction,
  toggleCafeBlacklistAction,
  hideCafeForTodayAction,
  unhideCafeAction,
  deleteCafeAction,
  toggleDrinkFavoriteAction,
} from "@/actions/cafes";
import type { CafeWithRelations } from "@/types";

function getCafeDistance(cafe: CafeWithRelations, home: Coordinates | null) {
  if (!home || cafe.latitude == null || cafe.longitude == null) return null;
  const distance = distanceEngine.calculateDistance(home, { latitude: cafe.latitude, longitude: cafe.longitude });
  return { distance, time: distanceEngine.estimateTravelTime(distance.km) };
}

export function CafeCard({
  cafe,
  tilt = 0,
  home,
  onEdit,
}: {
  cafe: CafeWithRelations;
  tilt?: number;
  home: Coordinates | null;
  onEdit: (cafe: CafeWithRelations) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isHiddenToday = !!cafe.hiddenUntil && new Date(cafe.hiddenUntil) > new Date();
  const nearest = getCafeDistance(cafe, home);

  function run(fn: () => Promise<unknown>, successMsg?: string) {
    startTransition(async () => {
      await fn();
      if (successMsg) toast(successMsg);
      router.refresh();
    });
  }

  return (
    <Card
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
      className={`flex flex-col overflow-hidden transition-opacity ${
        cafe.isBlacklisted || isHiddenToday ? "opacity-55" : ""
      }`}
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-secondary/60 px-6 text-center">
        {cafe.uploadedImageUrl || cafe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cafe.uploadedImageUrl || cafe.imageUrl!} alt={cafe.name} className="h-full w-full object-cover" />
        ) : (
          <p className="font-display text-xl italic text-muted-foreground">{cafe.name}</p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug">{cafe.name}</h3>
          <button
            aria-label="Yêu thích quán"
            onClick={() => run(() => toggleCafeFavoriteAction(cafe.id, !cafe.isFavorite))}
            disabled={isPending}
          >
            <Star
              className={
                cafe.isFavorite ? "h-4 w-4 shrink-0 fill-golden text-golden" : "h-4 w-4 shrink-0 text-muted-foreground"
              }
            />
          </button>
        </div>

        {cafe.address && <p className="text-sm text-muted-foreground line-clamp-1">{cafe.address}</p>}

        <div className="mt-1 flex flex-wrap gap-1.5">
          {cafe.category?.name && <Badge variant="secondary">{cafe.category.name}</Badge>}
          {cafe.priceRange && <Badge variant="outline">{PRICE_LABEL[cafe.priceRange]}</Badge>}
          {nearest && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" /> {nearest.distance.formatted} · {nearest.time.formatted}
            </Badge>
          )}
          {isHiddenToday && <Badge variant="terracotta">bỏ qua</Badge>}
          {cafe.isBlacklisted && <Badge variant="outline">đã loại</Badge>}
        </div>

        {cafe.drinks && cafe.drinks.length > 0 && (
          <div className="mt-3 space-y-1.5 rounded-lg bg-secondary/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <Coffee className="h-3 w-3" /> Menu
            </p>
            {cafe.drinks.map((drink) => (
              <div key={drink.id} className="flex items-center justify-between gap-2 text-sm">
                <span className={drink.isFavorite ? "font-medium" : ""}>{drink.name}</span>
                <button
                  onClick={() => run(() => toggleDrinkFavoriteAction(drink.id, !drink.isFavorite))}
                  disabled={isPending}
                  className="flex-none"
                >
                  <Star
                    className={`h-3.5 w-3.5 transition-colors ${
                      drink.isFavorite ? "fill-amber-500 text-amber-500" : "text-muted-foreground hover:text-amber-500"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Sửa" onClick={() => onEdit(cafe)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label="Xoá"
              disabled={isPending}
              onClick={() => run(() => deleteCafeAction(cafe.id), "Đã xoá quán.")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            {isHiddenToday ? (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Bỏ trốn"
                disabled={isPending}
                onClick={() => run(() => unhideCafeAction(cafe.id))}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="bỏ qua"
                disabled={isPending}
                onClick={() => run(() => hideCafeForTodayAction(cafe.id))}
              >
                <EyeOff className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label={cafe.isBlacklisted ? "Bỏ loại" : "Loại khỏi danh sách"}
              disabled={isPending}
              onClick={() => run(() => toggleCafeBlacklistAction(cafe.id, !cafe.isBlacklisted))}
            >
              <Ban className={cafe.isBlacklisted ? "h-3.5 w-3.5 text-destructive" : "h-3.5 w-3.5"} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
