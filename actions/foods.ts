"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { listWheelCandidates, exportFoods as exportFoodsData } from "@/server/foods";
import type { FoodExportPayload } from "@/types";

const PATH = "/hom-nay-an-gi";

const priceRangeEnum = z.enum(["BUDGET", "MID", "PREMIUM", "LUXURY"]).nullable().optional();

const foodInputSchema = z.object({
  name: z.string().trim().min(1, "Cần có tên món").max(120),
  description: z.string().trim().max(500).optional().nullable(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
  priceRange: priceRangeEnum,
  spicyLevel: z.number().int().min(0).max(3).optional().nullable(),
  tags: z.array(z.string().trim().min(1)).max(10).default([]),
  categoryId: z.string().optional().nullable(),
  // Một món có thể gắn nhiều quán (nhiều-nhiều qua FoodRestaurant) — mảng
  // id thay vì 1 id (mục 6, đã xác nhận).
  restaurantIds: z.array(z.string()).max(30).default([]),
});

export type FoodInput = z.infer<typeof foodInputSchema>;

export async function createFoodAction(input: FoodInput) {
  const data = foodInputSchema.parse(input);
  await prisma.food.create({
    data: {
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      priceRange: data.priceRange ?? null,
      spicyLevel: data.spicyLevel ?? null,
      tags: data.tags,
      categoryId: data.categoryId || null,
      restaurantLinks: {
        create: data.restaurantIds.map((restaurantId) => ({ restaurantId })),
      },
    },
  });
  revalidatePath(PATH);
}

export async function updateFoodAction(id: string, input: FoodInput) {
  const data = foodInputSchema.parse(input);
  await prisma.food.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      priceRange: data.priceRange ?? null,
      spicyLevel: data.spicyLevel ?? null,
      tags: data.tags,
      categoryId: data.categoryId || null,
      // Đồng bộ lại toàn bộ liên kết quán ăn: xoá hết link cũ rồi tạo lại
      // đúng danh sách mới. Đơn giản và đủ nhanh cho quy mô dữ liệu này —
      // không cần tính diff thêm/bớt.
      restaurantLinks: {
        deleteMany: {},
        create: data.restaurantIds.map((restaurantId) => ({ restaurantId })),
      },
    },
  });
  revalidatePath(PATH);
}

export async function deleteFoodAction(id: string) {
  await prisma.food.delete({ where: { id } });
  revalidatePath(PATH);
}

export async function toggleFavoriteAction(id: string, next: boolean) {
  await prisma.food.update({ where: { id }, data: { isFavorite: next } });
  revalidatePath(PATH);
}

export async function toggleBlacklistAction(id: string, next: boolean) {
  await prisma.food.update({ where: { id }, data: { isBlacklisted: next } });
  revalidatePath(PATH);
}

export async function hideForTodayAction(id: string) {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  await prisma.food.update({ where: { id }, data: { hiddenUntil: endOfDay } });
  revalidatePath(PATH);
}

export async function unhideAction(id: string) {
  await prisma.food.update({ where: { id }, data: { hiddenUntil: null } });
  revalidatePath(PATH);
}

export async function getWheelCandidatesAction() {
  return listWheelCandidates();
}

export async function getOrCreateCategoryAction(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = slugify(trimmed);
  const existing = await prisma.category.findUnique({ where: { slug_type: { slug, type: "FOOD" } } });
  if (existing) return existing;
  const created = await prisma.category.create({ data: { name: trimmed, slug, type: "FOOD" } });
  revalidatePath(PATH);
  return created;
}

export async function exportFoodsAction(): Promise<FoodExportPayload> {
  return exportFoodsData();
}

const importPayloadSchema = z.object({
  categories: z
    .array(
      z.object({
        name: z.string(),
        slug: z.string().optional(),
        icon: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
      })
    )
    .default([]),
  restaurants: z
    .array(
      z.object({
        name: z.string(),
        address: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        priceRange: priceRangeEnum,
        rating: z.number().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .default([]),
  foods: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
        priceRange: priceRangeEnum,
        spicyLevel: z.number().nullable().optional(),
        tags: z.array(z.string()).default([]),
        isFavorite: z.boolean().default(false),
        categoryName: z.string().nullable().optional(),
        restaurantNames: z.array(z.string()).default([]),
      })
    )
    .default([]),
});

export async function importFoodsAction(raw: unknown) {
  const payload = importPayloadSchema.parse(raw);

  const categoryIdByName = new Map<string, string>();
  for (const c of payload.categories) {
    const slug = c.slug || slugify(c.name);
    const row = await prisma.category.upsert({
      where: { slug_type: { slug, type: "FOOD" } },
      update: {},
      create: { name: c.name, slug, type: "FOOD", icon: c.icon ?? null, color: c.color ?? null },
    });
    categoryIdByName.set(c.name, row.id);
  }

  const restaurantIdByName = new Map<string, string>();
  for (const r of payload.restaurants) {
    const existing = await prisma.restaurant.findFirst({ where: { name: r.name } });
    const row =
      existing ??
      (await prisma.restaurant.create({
        data: {
          name: r.name,
          address: r.address ?? null,
          priceRange: r.priceRange ?? null,
        },
      }));
    restaurantIdByName.set(r.name, row.id);
  }

  let imported = 0;
  for (const f of payload.foods) {
    const categoryId = f.categoryName ? categoryIdByName.get(f.categoryName) ?? null : null;
    const restaurantIds = f.restaurantNames
      .map((name) => restaurantIdByName.get(name))
      .filter((id): id is string => Boolean(id));

    await prisma.food.create({
      data: {
        name: f.name,
        description: f.description ?? null,
        imageUrl: f.imageUrl ?? null,
        priceRange: f.priceRange ?? null,
        spicyLevel: f.spicyLevel ?? null,
        tags: f.tags,
        isFavorite: f.isFavorite,
        categoryId,
        restaurantLinks: {
          create: restaurantIds.map((restaurantId) => ({ restaurantId })),
        },
      },
    });
    imported += 1;
  }

  revalidatePath(PATH);
  return { imported };
}
