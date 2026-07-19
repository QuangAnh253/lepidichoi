import "server-only";
import { settingsRepository, type SettingsRow } from "@/server/settings-repository";
import { isValidCoordinates } from "@/lib/map";
import type { Coordinates } from "@/lib/map";

/**
 * Settings Service — toàn bộ nghiệp vụ của Settings nằm ở đây.
 * `SettingsService → Repository → Prisma`. Server Action (`actions/settings.ts`)
 * chỉ validate input bằng Zod rồi gọi thẳng các hàm ở file này — không tự
 * quyết định logic (ví dụ: có tạo Settings mặc định hay không, có tạo
 * Location mới hay update Location cũ) ở tầng Action hay ở Component.
 */

const LOCATION_LABEL: Record<LocationKind, string> = {
  home: "Nhà Lê",
  lua: "Nhà Pi",
};

export type LocationKind = "home" | "lua";

/**
 * Đảm bảo luôn có đúng 1 dòng Settings (id = 1). Component/Server Action
 * không cần biết Settings có tồn tại trong DB hay chưa — gọi hàm này là
 * luôn nhận về dữ liệu hợp lệ.
 */
export async function getSettings(): Promise<SettingsRow> {
  const existing = await settingsRepository.findSettings();
  if (existing) return existing;
  return settingsRepository.createDefaultSettings();
}

export interface UpdateSettingsInput {
  theme?: "light" | "dark" | "system";
  musicEnabled?: boolean;
  defaultRadiusKm?: number;
}

export async function updateSettings(input: UpdateSettingsInput): Promise<SettingsRow> {
  // Đảm bảo hàng singleton tồn tại trước khi update (tự chữa lành nếu vì
  // lý do gì đó dòng Settings id=1 chưa có — ví dụ DB mới, seed chưa chạy).
  await getSettings();
  return settingsRepository.updateSettingsFields(input);
}

export interface UpdateLocationInput {
  kind: LocationKind;
  coordinates: Coordinates;
}

export async function updateLocation({ kind, coordinates }: UpdateLocationInput): Promise<SettingsRow> {
  if (!isValidCoordinates(coordinates)) {
    throw new Error("Toạ độ không hợp lệ.");
  }

  const settings = await getSettings();
  const name = LOCATION_LABEL[kind];
  const existingLocationId = kind === "home" ? settings.homeLocationId : settings.luaLocationId;

  if (existingLocationId) {
    await settingsRepository.updateLocation(existingLocationId, {
      name,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });
    return (await settingsRepository.findSettings()) ?? settings;
  }

  const created = await settingsRepository.createLocation({
    name,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  });

  return kind === "home"
    ? settingsRepository.linkHomeLocation(created.id)
    : settingsRepository.linkLuaLocation(created.id);
}
