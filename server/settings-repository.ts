import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, Location } from "@prisma/client";

/**
 * Settings Repository — tầng DUY NHẤT được gọi thẳng vào Prisma cho
 * Settings/Location. Không chứa business logic (không tự quyết định
 * "nếu chưa có thì tạo mặc định" — đó là việc của `settings-service.ts`).
 * Mọi hàm ở đây chỉ là thao tác CRUD thô, 1-1 với một câu lệnh Prisma.
 */

const withLocations = {
  homeLocation: true,
  luaLocation: true,
} satisfies Prisma.SettingsInclude;

export type SettingsRow = Prisma.SettingsGetPayload<{ include: typeof withLocations }>;

export const settingsRepository = {
  async findSettings(): Promise<SettingsRow | null> {
    return prisma.settings.findUnique({ where: { id: 1 }, include: withLocations });
  },

  async createDefaultSettings(): Promise<SettingsRow> {
    return prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
      include: withLocations,
    });
  },

  async updateSettingsFields(
    data: Partial<Pick<Prisma.SettingsUpdateInput, "theme" | "musicEnabled" | "defaultRadiusKm">>
  ): Promise<SettingsRow> {
    return prisma.settings.update({ where: { id: 1 }, data, include: withLocations });
  },

  async createLocation(data: { name: string; latitude: number; longitude: number }): Promise<Location> {
    return prisma.location.create({ data });
  },

  async updateLocation(
    id: string,
    data: { name: string; latitude: number; longitude: number }
  ): Promise<Location> {
    return prisma.location.update({ where: { id }, data });
  },

  async linkHomeLocation(locationId: string): Promise<SettingsRow> {
    return prisma.settings.update({
      where: { id: 1 },
      data: { homeLocationId: locationId },
      include: withLocations,
    });
  },

  async linkLuaLocation(locationId: string): Promise<SettingsRow> {
    return prisma.settings.update({
      where: { id: 1 },
      data: { luaLocationId: locationId },
      include: withLocations,
    });
  },
};
