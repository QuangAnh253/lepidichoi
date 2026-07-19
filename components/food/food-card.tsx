"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Ban, EyeOff, Eye, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICE_LABEL } from "@/lib/food-labels";
import { distanceEngine, type Coordinates } from "@/lib/map";
import {
  toggleFavoriteAction,
  toggleBlacklistAction,
  hideForTodayAction,
  unhideAction,
  deleteFoodAction,
} from "@/actions/foods";
import type { FoodWithRelations } from "@/types";
import type { Restaurant } from "@prisma/client";

/**
 * Chọn quán gắn với món có tọa độ gần Nhà Lê nhất. Việc tính khoảng cách và
 * thời gian luôn đi qua `distanceEngine`, nhất quán với Drink và Place.
 */
function nearestRestaurantDistance(food: FoodWithRelations, home: Coordinates | null) {
  if (!home) return null;
  const withCoords: Array<{ latitude: number; longitude: number }> = food.restaurants.filter(
    (restaurant): restaurant is Restaurant & { latitude: number; longitude: number } =>
      restaurant.latitude != null && restaurant.longitude != null
  );
  if (withCoords.length === 0) return null;

  let best: {
    distance: ReturnType<typeof distanceEngine.calculateDistance>;
    time: ReturnType<typeof distanceEngine.estimateTravelTime>;
  } | null = null;
  for (const restaurant of withCoords) {
    const distance = distanceEngine.calculateDistance(home, {
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    });
    if (!best || distance.km < best.distance.km) {
      best = { distance, time: distanceEngine.estimateTravelTime(distance.km) };
    }
  }
  return best;
}

export function FoodCard({
  food,
  tilt = 0,
  home,
  onEdit,
}: {
  food: FoodWithRelations;
  tilt?: number;
  home: Coordinates | null;
  onEdit: (food: FoodWithRelations) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isHiddenToday = !!food.hiddenUntil && new Date(food.hiddenUntil) > new Date();
  const nearest = nearestRestaurantDistance(food, home);

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
        food.isBlacklisted || isHiddenToday ? "opacity-55" : ""
      }`}
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-secondary/60 px-6 text-center">
        {food.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={food.imageUrl} alt={food.name} className="h-full w-full object-cover" />
        ) : (
          <p className="font-display text-xl italic text-muted-foreground">{food.name}</p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug">{food.name}</h3>
          <button
            aria-label="Yêu thích"
            onClick={() => run(() => toggleFavoriteAction(food.id, !food.isFavorite))}
            disabled={isPending}
          >
            <Star
              className={
                food.isFavorite ? "h-4 w-4 shrink-0 fill-golden text-golden" : "h-4 w-4 shrink-0 text-muted-foreground"
              }
            />
          </button>
        </div>

        {food.restaurants.length > 0 && (
          <p className="text-sm text-muted-foreground">{food.restaurants.map((r) => r.name).join(", ")}</p>
        )}
        {food.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{food.description}</p>
        )}

        <div className="mt-1 flex flex-wrap gap-1.5">
          {food.category && <Badge variant="olive">{food.category.name}</Badge>}
          {food.priceRange && <Badge variant="outline">{PRICE_LABEL[food.priceRange]}</Badge>}
          {nearest && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" /> {nearest.distance.formatted} · {nearest.time.formatted}
            </Badge>
          )}
          {isHiddenToday && <Badge variant="terracotta">bỏ qua</Badge>}
          {food.isBlacklisted && <Badge variant="outline">đã loại</Badge>}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label="Sửa"
              onClick={() => onEdit(food)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label="Xoá"
              disabled={isPending}
              onClick={() => run(() => deleteFoodAction(food.id), "Đã xoá món.")}
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
                onClick={() => run(() => unhideAction(food.id))}
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
                onClick={() => run(() => hideForTodayAction(food.id))}
              >
                <EyeOff className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label={food.isBlacklisted ? "Bỏ loại" : "Loại khỏi danh sách"}
              disabled={isPending}
              onClick={() => run(() => toggleBlacklistAction(food.id, !food.isBlacklisted))}
            >
              <Ban className={food.isBlacklisted ? "h-3.5 w-3.5 text-destructive" : "h-3.5 w-3.5"} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
