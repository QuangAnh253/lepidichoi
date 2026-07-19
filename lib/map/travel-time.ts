import type { TravelMode, TravelTimeResult } from "./types";

/**
 * Tốc độ trung bình giả định theo phương tiện (km/h) — chỉ là ước lượng
 * thô cho mục đích "gợi ý gần/xa", không phải chỉ đường thật (không gọi
 * routing API ngoài, đúng phạm vi "chỉ dùng Leaflet + OpenStreetMap").
 * Muốn tinh chỉnh sau này chỉ cần sửa bảng này, không phải sửa nơi gọi.
 */
const AVERAGE_SPEED_KMH: Record<TravelMode, number> = {
  WALKING: 4.5,
  MOTORBIKE: 30,
  CAR: 25, // nội thành thường chậm hơn xe máy vì kẹt xe + đỗ xe
};

const DEFAULT_MODE: TravelMode = "MOTORBIKE";

/**
 * Ước lượng thời gian di chuyển từ khoảng cách (km) + phương tiện.
 * Phase 3C chỉ cần implement mặc định (MOTORBIKE) — nhưng interface đã
 * cho phép truyền `mode` để các phase sau mở rộng (đi bộ/ô tô) mà không
 * phải sửa chữ ký hàm.
 */
export function estimateTravelTime(distanceKm: number, mode: TravelMode = DEFAULT_MODE): TravelTimeResult {
  const speed = AVERAGE_SPEED_KMH[mode];
  const minutes = Math.max(1, Math.round((distanceKm / speed) * 60));

  return {
    mode,
    minutes,
    formatted: minutes < 60 ? `~${minutes} phút` : `~${(minutes / 60).toFixed(1)} giờ`,
  };
}
