"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Ban, EyeOff, Eye, Pencil, Trash2, MapPin, Globe, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICE_LABEL } from "@/lib/food-labels";
import { distanceEngine, type Coordinates } from "@/lib/map";
import {
  togglePlaceFavoriteAction,
  togglePlaceBlacklistAction,
  hidePlaceForTodayAction,
  unhidePlaceAction,
  deletePlaceAction,
} from "@/actions/places";
import type { PlaceWithRelations } from "@/types";

/**
 * Khác Drink/Food (khoảng cách tới Cafe/Restaurant *gắn với* item),
 * Place có toạ độ ngay trên chính nó — không có bảng nối nào để tìm
 * "địa điểm gần nhất". Vẫn gọi qua `distanceEngine`, không tự tính.
 */
function placeDistance(place: PlaceWithRelations, home: Coordinates | null) {
  if (!home || place.latitude == null || place.longitude == null) return null;
  const distance = distanceEngine.calculateDistance(home, { latitude: place.latitude, longitude: place.longitude });
  const time = distanceEngine.estimateTravelTime(distance.km);
  return { distance, time };
}

export function PlaceCard({
  place,
  tilt = 0,
  home,
  onEdit,
}: {
  place: PlaceWithRelations;
  tilt?: number;
  home: Coordinates | null;
  onEdit: (place: PlaceWithRelations) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isHiddenToday = !!place.hiddenUntil && new Date(place.hiddenUntil) > new Date();
  const nearest = placeDistance(place, home);

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
        place.isBlacklisted || isHiddenToday ? "opacity-55" : ""
      }`}
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-secondary/60 px-6 text-center">
        {place.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={place.imageUrl} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <p className="font-display text-xl italic text-muted-foreground">{place.name}</p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug">{place.name}</h3>
          <button
            aria-label="Yêu thích"
            onClick={() => run(() => togglePlaceFavoriteAction(place.id, !place.isFavorite))}
            disabled={isPending}
          >
            <Star
              className={
                place.isFavorite ? "h-4 w-4 shrink-0 fill-golden text-golden" : "h-4 w-4 shrink-0 text-muted-foreground"
              }
            />
          </button>
        </div>

        {place.address && <p className="text-sm text-muted-foreground">{place.address}</p>}

        <div className="mt-1 flex flex-wrap gap-1.5">
          {place.category && <Badge variant="outline">{place.category.name}</Badge>}
          {place.priceRange && <Badge variant="outline">{PRICE_LABEL[place.priceRange]}</Badge>}
          {nearest && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" /> {nearest.distance.formatted} · {nearest.time.formatted}
            </Badge>
          )}
          {isHiddenToday && <Badge variant="terracotta">bỏ qua</Badge>}
          {place.isBlacklisted && <Badge variant="outline">đã loại</Badge>}
        </div>

        {place.url && (
          <div className="flex flex-wrap gap-3 pt-0.5 text-xs text-muted-foreground">
            <a
              href={place.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground"
            >
              <Globe className="h-3 w-3" /> Website / Facebook
            </a>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Sửa" onClick={() => onEdit(place)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label="Xoá"
              disabled={isPending}
              onClick={() => run(() => deletePlaceAction(place.id), "Đã xoá địa điểm.")}
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
                onClick={() => run(() => unhidePlaceAction(place.id))}
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
                onClick={() => run(() => hidePlaceForTodayAction(place.id))}
              >
                <EyeOff className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label={place.isBlacklisted ? "Bỏ loại" : "Loại khỏi danh sách"}
              disabled={isPending}
              onClick={() => run(() => togglePlaceBlacklistAction(place.id, !place.isBlacklisted))}
            >
              <Ban className={place.isBlacklisted ? "h-3.5 w-3.5 text-destructive" : "h-3.5 w-3.5"} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
