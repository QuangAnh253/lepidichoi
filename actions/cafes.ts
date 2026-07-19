"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as drinkService from "@/server/drink-service";
import type { CafeExportPayload } from "@/types";

const PATH = "/hom-nay-uong-gi";

const cafeInputSchema = z.object({
  name: z.string().trim().min(1, "Cần có tên quán").max(120),
  address: z.string().trim().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
  menuUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
  url: z.string().trim().url().optional().or(z.literal("")).nullable(),
  googleMapUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
  priceRange: z.enum(["BUDGET", "MID", "PREMIUM", "LUXURY"]).nullable().optional(),
  categoryId: z.string().optional().nullable(),
  drinks: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        isFavorite: z.boolean().default(false),
      })
    )
    .default([]),
});

export type CafeInput = z.infer<typeof cafeInputSchema>;

export async function createCafeAction(input: CafeInput) {
  const data = cafeInputSchema.parse(input);
  const created = await drinkService.createCafe({
    name: data.name,
    address: data.address || null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    imageUrl: data.imageUrl || null,
    menuUrl: data.menuUrl || null,
    url: data.url || null,
    googleMapUrl: data.googleMapUrl || null,
    priceRange: data.priceRange ?? null,
    categoryId: data.categoryId || null,
    drinks: data.drinks,
  });
  revalidatePath(PATH);
  return created;
}

export async function updateCafeAction(id: string, input: CafeInput) {
  const data = cafeInputSchema.parse(input);
  await drinkService.updateCafe(id, {
    name: data.name,
    address: data.address || null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    imageUrl: data.imageUrl || null,
    menuUrl: data.menuUrl || null,
    url: data.url || null,
    googleMapUrl: data.googleMapUrl || null,
    priceRange: data.priceRange ?? null,
    categoryId: data.categoryId || null,
    drinks: data.drinks,
  });
  revalidatePath(PATH);
}

export async function deleteCafeAction(id: string) {
  await drinkService.deleteCafe(id);
  revalidatePath(PATH);
}

export async function toggleCafeFavoriteAction(id: string, next: boolean) {
  await drinkService.setCafeFavorite(id, next);
  revalidatePath(PATH);
}

export async function toggleCafeBlacklistAction(id: string, next: boolean) {
  await drinkService.setCafeBlacklisted(id, next);
  revalidatePath(PATH);
}

export async function hideCafeForTodayAction(id: string) {
  await drinkService.hideCafeForToday(id);
  revalidatePath(PATH);
}

export async function unhideCafeAction(id: string) {
  await drinkService.unhideCafe(id);
  revalidatePath(PATH);
}

export async function toggleDrinkFavoriteAction(drinkId: string, next: boolean) {
  await drinkService.setDrinkFavorite(drinkId, next);
  revalidatePath(PATH);
}

export async function getOrCreateCafeCategoryAction(name: string) {
  const created = await drinkService.getOrCreateCafeCategory(name);
  revalidatePath(PATH);
  return created;
}

export async function exportCafesAction(): Promise<CafeExportPayload> {
  return drinkService.exportCafes();
}

export async function importCafesAction(payload: CafeExportPayload) {
  const result = await drinkService.importCafes(payload);
  revalidatePath(PATH);
  return result;
}
