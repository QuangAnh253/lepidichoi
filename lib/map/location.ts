import type { Coordinates } from "./types";

/**
 * Format khoảng cách (km) thành chuỗi hiển thị — dưới 1km thì đổi sang
 * mét cho dễ đọc (ví dụ "350 m" thay vì "0.35 km").
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

/** Format toạ độ thành chuỗi ngắn gọn để hiển thị/debug (không dùng để tính toán). */
export function formatCoordinates(coordinates: Coordinates): string {
  return `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`;
}

/** Kiểm tra toạ độ có nằm trong khoảng hợp lệ hay không. */
export function isValidCoordinates(coordinates: Coordinates): boolean {
  return (
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}
