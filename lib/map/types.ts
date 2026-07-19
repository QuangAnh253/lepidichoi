/**
 * Map Engine — kiểu dữ liệu dùng chung.
 *
 * Đây là "hợp đồng" (contract) mà Distance Engine (`distance.ts`,
 * `travel-time.ts`, `location.ts`) triển khai, và mọi module khác
 * (Settings ở Phase 3C, Food/Drink/Place ở các phase sau) chỉ import từ
 * đây + gọi qua `distanceEngine` (xem `index.ts`) — không tự định nghĩa
 * lại object literal hay tự viết công thức tính khoảng cách ở nơi khác.
 */

/** Toạ độ địa lý thuần (không gắn với bảng Prisma cụ thể nào). */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Phương tiện di chuyển — dùng để ước lượng thời gian đi lại. */
export type TravelMode = "WALKING" | "MOTORBIKE" | "CAR";

/** Kết quả tính khoảng cách giữa 2 toạ độ. */
export interface DistanceResult {
  /** Khoảng cách đường chim bay, đơn vị km. */
  km: number;
  /** Chuỗi đã format sẵn để hiển thị, ví dụ "2.4 km" hoặc "350 m". */
  formatted: string;
}

/** Kết quả ước lượng thời gian di chuyển. */
export interface TravelTimeResult {
  mode: TravelMode;
  minutes: number;
  /** Chuỗi đã format sẵn để hiển thị, ví dụ "~8 phút". */
  formatted: string;
}

/**
 * Một địa điểm có toạ độ + tên gợi nhớ — shape trung lập dùng để truyền
 * dữ liệu vào/ra Map Engine, độc lập với model `Location` của Prisma.
 */
export interface MapLocation {
  name: string;
  coordinates: Coordinates;
}

/**
 * Interface chính của Distance Engine. Phase 3C chỉ cần implement (xem
 * `index.ts` — export `distanceEngine`); các module sau (Food/Drink/
 * Place ở phase kế tiếp) chỉ gọi qua interface này, không tự tính toán
 * khoảng cách/thời gian riêng lẻ trong component hay server action.
 */
export interface DistanceEngine {
  calculateDistance(a: Coordinates, b: Coordinates): DistanceResult;
  estimateTravelTime(distanceKm: number, mode?: TravelMode): TravelTimeResult;
  formatDistance(km: number): string;
}
