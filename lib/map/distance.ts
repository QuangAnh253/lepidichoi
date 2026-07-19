import type { Coordinates, DistanceResult } from "./types";
import { formatDistance } from "./location";

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Khoảng cách đường chim bay giữa 2 toạ độ (công thức Haversine), đơn vị
 * km. Thuần dữ liệu — không import Prisma/component, đúng nguyên tắc
 * Random Engine đã dùng ở Phase 3B (`lib/random-engine.ts`).
 */
export function calculateDistance(a: Coordinates, b: Coordinates): DistanceResult {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  const km = EARTH_RADIUS_KM * c;

  return { km, formatted: formatDistance(km) };
}
