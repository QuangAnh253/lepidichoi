"use client";

import { useState, useTransition } from "react";
import { Radar } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDistance } from "@/lib/map";
import { updateSettingsAction } from "@/actions/settings";

interface RadiusSectionProps {
  initialRadiusKm: number;
}

const MIN_KM = 0.5;
const MAX_KM = 50;
const STEP_KM = 0.5;

/**
 * Default Radius — bán kính mặc định dùng làm gợi ý "gần nhà" cho Map
 * Engine (Phase 3D trở đi sẽ dùng giá trị này khi lọc Food/Drink/Place
 * theo khoảng cách). Phase 3C chỉ cần lưu giá trị, chưa lọc gì cả.
 */
export function RadiusSection({ initialRadiusKm }: RadiusSectionProps) {
  const [radiusKm, setRadiusKm] = useState(initialRadiusKm);
  const [, startTransition] = useTransition();

  function commit(next: number) {
    startTransition(async () => {
      try {
        await updateSettingsAction({ defaultRadiusKm: next });
      } catch {
        toast.error("Lưu bán kính thất bại.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Radar className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Bán kính mặc định</CardTitle>
            <CardDescription>Dùng để gợi ý những chỗ &quot;gần nhà&quot;.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-3 px-6 pb-6">
        <input
          type="range"
          min={MIN_KM}
          max={MAX_KM}
          step={STEP_KM}
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          onPointerUp={() => commit(radiusKm)}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          aria-label="Bán kính mặc định (km)"
        />
        <span className="font-mono text-sm text-muted-foreground">{formatDistance(radiusKm)}</span>
      </div>
    </Card>
  );
}
