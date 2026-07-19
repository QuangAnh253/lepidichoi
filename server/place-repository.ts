import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * `place-repository.ts` chỉ chứa Prisma thô — không business logic
 * (candidates cho wheel, export/import payload...), việc đó thuộc về
 * `place-service.ts`. Đúng kiến trúc đã xác nhận cho Phase 4:
 *   Server Action -> PlaceService -> PlaceRepository -> Prisma
 */

export const placeWithRelations = {
  category: true,
} satisfies Prisma.PlaceInclude;

export type PlaceRaw = Prisma.PlaceGetPayload<{ include: typeof placeWithRelations }>;

export interface PlaceCreateData {
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  uploadedImageUrl: string | null;
  url: string | null;
  googleMapUrl: string | null;
  priceRange: Prisma.PlaceCreateInput["priceRange"];
  categoryId: string | null;
}

export type PlaceUpdateData = PlaceCreateData;

export const placeRepository = {
  findMany(): Promise<PlaceRaw[]> {
    return prisma.place.findMany({ include: placeWithRelations, orderBy: { createdAt: "desc" } });
  },

  findWheelCandidates(): Promise<PlaceRaw[]> {
    return prisma.place.findMany({
      where: {
        isBlacklisted: false,
        OR: [{ hiddenUntil: null }, { hiddenUntil: { lt: new Date() } }],
      },
      include: placeWithRelations,
    });
  },

  findById(id: string): Promise<PlaceRaw | null> {
    return prisma.place.findUnique({ where: { id }, include: placeWithRelations });
  },

  findManyRaw() {
    return prisma.place.findMany({ include: placeWithRelations });
  },

  create(data: PlaceCreateData) {
    return prisma.place.create({ data });
  },

  update(id: string, data: PlaceUpdateData) {
    return prisma.place.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.place.delete({ where: { id } });
  },

  setFavorite(id: string, next: boolean) {
    return prisma.place.update({ where: { id }, data: { isFavorite: next } });
  },

  setBlacklisted(id: string, next: boolean) {
    return prisma.place.update({ where: { id }, data: { isBlacklisted: next } });
  },

  setHiddenUntil(id: string, hiddenUntil: Date | null) {
    return prisma.place.update({ where: { id }, data: { hiddenUntil } });
  },
};