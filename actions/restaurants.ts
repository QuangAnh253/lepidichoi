"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const PATH = "/hom-nay-an-gi";

const restaurantInputSchema = z.object({
  name: z.string().trim().min(1, "Cần có tên quán").max(120),
  address: z.string().trim().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
  url: z.string().trim().url().optional().or(z.literal("")).nullable(),
  googleMapUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
  priceRange: z.enum(["BUDGET", "MID", "PREMIUM", "LUXURY"]).nullable().optional(),
  categoryId: z.string().optional().nullable(),
});

export type RestaurantInput = z.infer<typeof restaurantInputSchema>;

export async function createRestaurantAction(input: RestaurantInput) {
  const data = restaurantInputSchema.parse(input);
  const created = await prisma.restaurant.create({
    data: {
      name: data.name,
      address: data.address || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      imageUrl: data.imageUrl || null,
      url: data.url || null,
      googleMapUrl: data.googleMapUrl || null,
      priceRange: data.priceRange ?? null,
      categoryId: data.categoryId || null,
    },
  });
  revalidatePath(PATH);
  return created;
}

export async function updateRestaurantAction(id: string, input: RestaurantInput) {
  const data = restaurantInputSchema.parse(input);
  await prisma.restaurant.update({
    where: { id },
    data: {
      name: data.name,
      address: data.address || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      imageUrl: data.imageUrl || null,
      url: data.url || null,
      googleMapUrl: data.googleMapUrl || null,
      priceRange: data.priceRange ?? null,
      categoryId: data.categoryId || null,
    },
  });
  revalidatePath(PATH);
}

export async function deleteRestaurantAction(id: string) {
  await prisma.restaurant.delete({ where: { id } });
  revalidatePath(PATH);
}
