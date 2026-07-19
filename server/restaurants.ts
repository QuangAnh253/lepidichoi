import "server-only";
import { prisma } from "@/lib/prisma";

import type { Restaurant, Category } from "@prisma/client";

export type RestaurantWithCategory = Restaurant & { category: Category | null };

export async function listRestaurants(): Promise<RestaurantWithCategory[]> {
  return prisma.restaurant.findMany({ include: { category: true }, orderBy: { name: "asc" } });
}
