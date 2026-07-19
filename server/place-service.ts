import "server-only";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { placeRepository, type PlaceRaw, type PlaceCreateData } from "@/server/place-repository";
import type { PlaceWithRelations, PlaceExportPayload, PlaceWheelCandidate } from "@/types";

/**
 * `place-service.ts` — nghiệp vụ Place. Server Action chỉ Zod-validate
 * rồi gọi các hàm ở đây; Repository chỉ biết Prisma thô. Kiến trúc đã
 * xác nhận cho Phase 4, cùng pattern với `drink-service.ts` (Phase 3D).
 */

// Place không có bảng nối nhiều-nhiều nào (khác Food/Drink) — `category`
// đã được include sẵn ở repository nên không cần ánh xạ lại field nào,
// nhưng vẫn giữ một hàm `mapPlace` để chỗ gọi luôn nhất quán với
// Food/Drink và dễ mở rộng nếu Place có quan hệ mới sau này.
function mapPlace(raw: PlaceRaw): PlaceWithRelations {
  return raw;
}

export async function listPlaces(): Promise<PlaceWithRelations[]> {
  const rows = await placeRepository.findMany();
  return rows.map(mapPlace);
}

/** Candidates cho bánh xe: không bị blacklist, không đang bỏ qua. Group theo category. */
export async function listPlaceWheelCandidates(): Promise<PlaceWheelCandidate[]> {
  const rows = await placeRepository.findWheelCandidates();
  const places = rows.map(mapPlace);

  const candidates: PlaceWheelCandidate[] = [];
  const categoryMap = new Map<string, PlaceWithRelations[]>();

  for (const place of places) {
    if (place.categoryId && place.category) {
      if (!categoryMap.has(place.categoryId)) {
        categoryMap.set(place.categoryId, []);
      }
      categoryMap.get(place.categoryId)!.push(place);
    } else {
      candidates.push({ type: "PLACE", id: `place_${place.id}`, place });
    }
  }

  for (const [categoryId, groupPlaces] of categoryMap.entries()) {
    const category = groupPlaces[0].category!;
    candidates.push({
      type: "CATEGORY",
      id: `cat_${categoryId}`,
      category,
      places: groupPlaces,
    });
  }

  return candidates;
}

export async function getPlaceById(id: string): Promise<PlaceWithRelations | null> {
  const row = await placeRepository.findById(id);
  return row ? mapPlace(row) : null;
}

export async function createPlace(data: PlaceCreateData) {
  return placeRepository.create(data);
}

export async function updatePlace(id: string, data: PlaceCreateData) {
  return placeRepository.update(id, data);
}

export async function deletePlace(id: string) {
  return placeRepository.delete(id);
}

export async function setPlaceFavorite(id: string, next: boolean) {
  return placeRepository.setFavorite(id, next);
}

export async function setPlaceBlacklisted(id: string, next: boolean) {
  return placeRepository.setBlacklisted(id, next);
}

export async function hidePlaceForToday(id: string) {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return placeRepository.setHiddenUntil(id, endOfDay);
}

export async function unhidePlace(id: string) {
  return placeRepository.setHiddenUntil(id, null);
}

/**
 * Giống `getOrCreateCategoryAction` của Food (`actions/foods.ts`) nhưng
 * dùng `CategoryType.PLACE` — Place dùng chung model Category, phân vùng
 * qua khoá phức hợp `slug_type` (đúng bug đã sửa ở Phase 3D).
 */
export async function getOrCreatePlaceCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = slugify(trimmed);
  const existing = await prisma.category.findUnique({ where: { slug_type: { slug, type: "PLACE" } } });
  if (existing) return existing;
  return prisma.category.create({ data: { name: trimmed, slug, type: "PLACE" } });
}

export async function exportPlaces(): Promise<PlaceExportPayload> {
  const [placesRaw, categories] = await Promise.all([
    placeRepository.findManyRaw(),
    prisma.category.findMany({ where: { type: "PLACE" }, orderBy: { name: "asc" } }),
  ]);
  const places = placesRaw.map(mapPlace);

  return {
    exportedAt: new Date().toISOString(),
    categories: categories.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, color: c.color })),
    places: places.map((p) => ({
      name: p.name,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      imageUrl: p.imageUrl,
      url: p.url,
      googleMapUrl: p.googleMapUrl,
      priceRange: p.priceRange,
      isFavorite: p.isFavorite,
      categoryName: p.category?.name ?? null,
    })),
  };
}

/** Import giữ format thống nhất với Food/Drink (mục Import/Export, Phase 4). */
export async function importPlaces(payload: PlaceExportPayload): Promise<{ imported: number }> {
  const categoryIdByName = new Map<string, string>();
  for (const c of payload.categories) {
    const slug = c.slug || slugify(c.name);
    const row = await prisma.category.upsert({
      where: { slug_type: { slug, type: "PLACE" } },
      update: {},
      create: { name: c.name, slug, type: "PLACE", icon: c.icon ?? null, color: c.color ?? null },
    });
    categoryIdByName.set(c.name, row.id);
  }

  let imported = 0;
  for (const p of payload.places) {
    const categoryId = p.categoryName ? categoryIdByName.get(p.categoryName) ?? null : null;
    await placeRepository.create({
      name: p.name,
      address: p.address ?? null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      imageUrl: p.imageUrl ?? null,
      uploadedImageUrl: null,
      url: p.url ?? null,
      googleMapUrl: p.googleMapUrl ?? null,
      priceRange: p.priceRange ?? null,
      categoryId,
    });
    imported += 1;
  }

  return { imported };
}