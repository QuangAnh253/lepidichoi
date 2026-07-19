import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const cafeWithRelations = {
  category: true,
  drinks: {
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.CafeInclude;

export type CafeRaw = Prisma.CafeGetPayload<{ include: typeof cafeWithRelations }>;

export interface CafeCreateData {
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  uploadedImageUrl: string | null;
  menuUrl: string | null;
  url: string | null;
  googleMapUrl: string | null;
  priceRange: Prisma.CafeCreateInput["priceRange"];
  categoryId: string | null;
  drinks: { name: string; isFavorite: boolean }[];
}

export type CafeUpdateData = CafeCreateData;

export const drinkRepository = {
  findAllCafes(): Promise<CafeRaw[]> {
    return prisma.cafe.findMany({
      include: cafeWithRelations,
      orderBy: { createdAt: "desc" },
    });
  },

  findCafeWheelCandidates(): Promise<CafeRaw[]> {
    return prisma.cafe.findMany({
      where: {
        isBlacklisted: false,
        OR: [{ hiddenUntil: null }, { hiddenUntil: { lt: new Date() } }],
      },
      include: cafeWithRelations,
    });
  },

  findCafeById(id: string): Promise<CafeRaw | null> {
    return prisma.cafe.findUnique({ where: { id }, include: cafeWithRelations });
  },

  findCafeByName(name: string) {
    return prisma.cafe.findFirst({ where: { name } });
  },

  createCafe(data: CafeCreateData) {
    return prisma.cafe.create({
      data: {
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        imageUrl: data.imageUrl,
        uploadedImageUrl: data.uploadedImageUrl,
        menuUrl: data.menuUrl,
        url: data.url,
        googleMapUrl: data.googleMapUrl,
        priceRange: data.priceRange,
        categoryId: data.categoryId,
        drinks: {
          create: data.drinks.map((d) => ({
            name: d.name,
            isFavorite: d.isFavorite,
          })),
        },
      },
    });
  },

  updateCafe(id: string, data: CafeUpdateData) {
    return prisma.cafe.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        imageUrl: data.imageUrl,
        uploadedImageUrl: data.uploadedImageUrl,
        menuUrl: data.menuUrl,
        url: data.url,
        googleMapUrl: data.googleMapUrl,
        priceRange: data.priceRange,
        categoryId: data.categoryId,
        drinks: {
          deleteMany: {},
          create: data.drinks.map((d) => ({
            name: d.name,
            isFavorite: d.isFavorite,
          })),
        },
      },
    });
  },

  deleteCafe(id: string) {
    return prisma.cafe.delete({ where: { id } });
  },

  setCafeFavorite(id: string, next: boolean) {
    return prisma.cafe.update({ where: { id }, data: { isFavorite: next } });
  },

  setCafeBlacklisted(id: string, next: boolean) {
    return prisma.cafe.update({ where: { id }, data: { isBlacklisted: next } });
  },

  setCafeHiddenUntil(id: string, hiddenUntil: Date | null) {
    return prisma.cafe.update({ where: { id }, data: { hiddenUntil } });
  },

  setDrinkFavorite(drinkId: string, next: boolean) {
    return prisma.drink.update({ where: { id: drinkId }, data: { isFavorite: next } });
  },

  getOrCreateCafeCategory(name: string) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    return prisma.category.upsert({
      where: { slug_type: { slug, type: "DRINK" } },
      update: {},
      create: { name, slug, type: "DRINK", icon: "coffee" },
    });
  },

  findAllCategories() {
    return prisma.category.findMany({
      where: { type: "DRINK" },
      orderBy: { name: "asc" },
    });
  },
};
