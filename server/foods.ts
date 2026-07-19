import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { FoodWithRelations, FoodExportPayload } from "@/types";

// Prisma vẫn join qua bảng nối `restaurantLinks` (model FoodRestaurant, nhiều-
// nhiều) — nhưng UI chỉ nên biết `restaurants[]` phẳng (mục 6, đã xác
// nhận). `mapFood` là nơi DUY NHẤT làm việc với `restaurantLinks` thô; mọi hàm
// khác trong file này (và toàn bộ UI) chỉ thấy `restaurants[]`.
const withRelations = {
  category: true,
  restaurantLinks: {
    include: { restaurant: true },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.FoodInclude;

type FoodRaw = Prisma.FoodGetPayload<{ include: typeof withRelations }>;

function mapFood(raw: FoodRaw): FoodWithRelations {
  const { restaurantLinks, ...rest } = raw;
  return { ...rest, restaurants: restaurantLinks.map((link) => link.restaurant) };
}

export async function listFoods(): Promise<FoodWithRelations[]> {
  const rows = await prisma.food.findMany({
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapFood);
}

/**
 * Candidates eligible for the wheel: not blacklisted, and not hidden for
 * today (hiddenUntil either unset or already in the past).
 */
export async function listWheelCandidates(): Promise<FoodWithRelations[]> {
  const rows = await prisma.food.findMany({
    where: {
      isBlacklisted: false,
      OR: [{ hiddenUntil: null }, { hiddenUntil: { lt: new Date() } }],
    },
    include: withRelations,
  });
  return rows.map(mapFood);
}

export async function getFoodById(id: string): Promise<FoodWithRelations | null> {
  const row = await prisma.food.findUnique({ where: { id }, include: withRelations });
  return row ? mapFood(row) : null;
}

export async function exportFoods(): Promise<FoodExportPayload> {
  const [foods, categories, restaurants] = await Promise.all([
    prisma.food.findMany({ include: withRelations }),
    prisma.category.findMany(),
    prisma.restaurant.findMany(),
  ]);

  const mappedFoods = foods.map(mapFood);

  return {
    exportedAt: new Date().toISOString(),
    categories: categories.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, color: c.color })),
    restaurants: restaurants.map((r) => ({
      name: r.name,
      address: r.address,
      priceRange: r.priceRange,
    })),
    foods: mappedFoods.map((f) => ({
      name: f.name,
      description: f.description,
      imageUrl: f.imageUrl,
      priceRange: f.priceRange,
      spicyLevel: f.spicyLevel,
      tags: f.tags,
      isFavorite: f.isFavorite,
      categoryName: f.category?.name ?? null,
      restaurantNames: f.restaurants.map((r) => r.name),
    })),
  };
}
