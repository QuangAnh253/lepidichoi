/**
 * Điểm vào duy nhất của Map Engine. Các module sau (Food/Drink/Place ở
 * phase tiếp theo) chỉ nên `import { distanceEngine } from "@/lib/map"`
 * và gọi qua interface `DistanceEngine` — không tự tính khoảng cách
 * trong component hay server action.
 */
import { calculateDistance } from "./distance";
import { estimateTravelTime } from "./travel-time";
import { formatDistance } from "./location";
import type { DistanceEngine } from "./types";

export const distanceEngine: DistanceEngine = {
  calculateDistance,
  estimateTravelTime,
  formatDistance,
};

export * from "./types";
export { calculateDistance } from "./distance";
export { estimateTravelTime } from "./travel-time";
export { formatDistance, formatCoordinates, isValidCoordinates } from "./location";
