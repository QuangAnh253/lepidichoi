"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as placeService from "@/server/place-service";
import type { PlaceExportPayload } from "@/types";

// Removed specific PATH constant since we revalidate layout now

const lenientUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val) return null;
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
    return `https://${val}`;
  });

const placeInputSchema = z.object({
  name: z.string().trim().min(1, "Cần có tên địa điểm").max(120),
  address: z.string().trim().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  imageUrl: lenientUrl,
  url: lenientUrl,
  googleMapUrl: lenientUrl,
  priceRange: z.enum(["BUDGET", "MID", "PREMIUM", "LUXURY"]).nullable().optional(),
  categoryId: z.string().optional().nullable(),
});

export type PlaceInput = z.infer<typeof placeInputSchema>;

export async function createPlaceAction(input: PlaceInput) {
  const data = placeInputSchema.parse(input);
  await placeService.createPlace({
    name: data.name,
    address: data.address || null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    imageUrl: data.imageUrl || null,
    url: data.url || null,
    googleMapUrl: data.googleMapUrl || null,
    priceRange: data.priceRange ?? null,
    categoryId: data.categoryId || null,
  });
  revalidatePath("/", "layout");
}

export async function updatePlaceAction(id: string, input: PlaceInput) {
  const data = placeInputSchema.parse(input);
  await placeService.updatePlace(id, {
    name: data.name,
    address: data.address || null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    imageUrl: data.imageUrl || null,
    url: data.url || null,
    googleMapUrl: data.googleMapUrl || null,
    priceRange: data.priceRange ?? null,
    categoryId: data.categoryId || null,
  });
  revalidatePath("/", "layout");
}

export async function deletePlaceAction(id: string) {
  await placeService.deletePlace(id);
  revalidatePath("/", "layout");
}

export async function togglePlaceFavoriteAction(id: string, next: boolean) {
  await placeService.setPlaceFavorite(id, next);
  revalidatePath("/", "layout");
}

export async function togglePlaceBlacklistAction(id: string, next: boolean) {
  await placeService.setPlaceBlacklisted(id, next);
  revalidatePath("/", "layout");
}

export async function hidePlaceForTodayAction(id: string) {
  await placeService.hidePlaceForToday(id);
  revalidatePath("/", "layout");
}

export async function unhidePlaceAction(id: string) {
  await placeService.unhidePlace(id);
  revalidatePath("/", "layout");
}

export async function getPlaceWheelCandidatesAction() {
  return placeService.listPlaceWheelCandidates();
}

export async function getOrCreatePlaceCategoryAction(name: string) {
  const created = await placeService.getOrCreatePlaceCategory(name);
  revalidatePath("/", "layout");
  return created;
}

export async function exportPlacesAction(): Promise<PlaceExportPayload> {
  return placeService.exportPlaces();
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
  places: z
    .array(
      z.object({
        name: z.string(),
        address: z.string().nullable().optional(),
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
        url: z.string().nullable().optional(),
        googleMapUrl: z.string().nullable().optional(),
        priceRange: z.enum(["BUDGET", "MID", "PREMIUM", "LUXURY"]).nullable().optional(),
        isFavorite: z.boolean().default(false),
        categoryName: z.string().nullable().optional(),
      })
    )
    .default([]),
});

export async function importPlacesAction(raw: unknown) {
  const payload = importPayloadSchema.parse(raw);
  const result = await placeService.importPlaces({
    exportedAt: new Date().toISOString(),
    categories: payload.categories.map((c) => ({
      name: c.name,
      slug: c.slug ?? "",
      icon: c.icon ?? null,
      color: c.color ?? null,
    })),
    places: payload.places.map((p) => ({
      name: p.name,
      address: p.address ?? null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      imageUrl: p.imageUrl ?? null,
      url: p.url ?? null,
      googleMapUrl: p.googleMapUrl ?? null,
      priceRange: p.priceRange ?? null,
      isFavorite: p.isFavorite,
      categoryName: p.categoryName ?? null,
    })),
  });
  revalidatePath("/", "layout");
  return result;
}