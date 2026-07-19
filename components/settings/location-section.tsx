"use client";

import { Home, HeartHandshake } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LocationPickerDialog } from "@/components/settings/location-picker-dialog";
import { distanceEngine, formatCoordinates, type Coordinates } from "@/lib/map";

interface LocationSectionProps {
  home: Coordinates | null;
  lua: Coordinates | null;
}

function LocationRow({
  icon: Icon,
  title,
  description,
  kind,
  label,
  coordinates,
}: {
  icon: typeof Home;
  title: string;
  description: string;
  kind: "home" | "lua";
  label: string;
  coordinates: Coordinates | null;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            {coordinates ? formatCoordinates(coordinates) : description}
          </p>
        </div>
      </div>
      <LocationPickerDialog kind={kind} label={label} initialValue={coordinates} />
    </div>
  );
}

export function LocationSection({ home, lua }: LocationSectionProps) {
  const distance = home && lua ? distanceEngine.calculateDistance(home, lua) : null;
  const travelTime = distance ? distanceEngine.estimateTravelTime(distance.km) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vị trí</CardTitle>
        <CardDescription>Chọn trên bản đồ, không cần nhập toạ độ tay.</CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-4 px-6 pb-6">
        <LocationRow
          icon={Home}
          title="Nhà Lê"
          description="Chưa đặt vị trí"
          kind="home"
          label="Nhà Lê"
          coordinates={home}
        />
        <Separator />
        <LocationRow
          icon={HeartHandshake}
          title="Nhà Pi"
          description="Chưa đặt vị trí"
          kind="lua"
          label="Nhà Pi"
          coordinates={lua}
        />

        {distance && travelTime && (
          <>
            <Separator />
            <p className="font-mono text-xs text-muted-foreground">
              Khoảng cách 2 nhà: {distance.formatted} · ước lượng {travelTime.formatted} (xe máy)
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
