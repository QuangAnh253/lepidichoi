"use client";

import { AppearanceSection } from "@/components/settings/appearance-section";
import { LocationSection } from "@/components/settings/location-section";
import { RadiusSection } from "@/components/settings/radius-section";
import { MusicSection } from "@/components/settings/music-section";
import type { SettingsWithLocations } from "@/types";

interface SettingsFormProps {
  settings: SettingsWithLocations;
}

/**
 * "Nhạc trưởng" của trang /cai-dat — chỉ composition, không tự gọi
 * action hay chứa business logic (giống vai trò `FoodBoard` cho trang
 * ăn gì). Mỗi section tự quản lý state + gọi action của riêng nó.
 */
export function SettingsForm({ settings }: SettingsFormProps) {
  return (
    <div className="space-y-4">
      <AppearanceSection
        initialTheme={(settings.theme as "light" | "dark" | "system") ?? "system"}
      />

      <LocationSection
        home={
          settings.homeLocation
            ? { latitude: settings.homeLocation.latitude, longitude: settings.homeLocation.longitude }
            : null
        }
        lua={
          settings.luaLocation
            ? { latitude: settings.luaLocation.latitude, longitude: settings.luaLocation.longitude }
            : null
        }
      />

      <RadiusSection initialRadiusKm={settings.defaultRadiusKm} />

      <MusicSection initialEnabled={settings.musicEnabled} />
    </div>
  );
}
