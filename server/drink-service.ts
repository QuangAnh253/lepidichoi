import "server-only";
import { drinkRepository, type CafeRaw, type CafeCreateData } from "@/server/drink-repository";
import type { CafeWithRelations, CafeExportPayload } from "@/types";

function mapCafe(raw: CafeRaw): CafeWithRelations {
  return raw;
}

export async function listCafes(): Promise<CafeWithRelations[]> {
  const rows = await drinkRepository.findAllCafes();
  return rows.map(mapCafe);
}

export async function listCafeWheelCandidates(): Promise<CafeWithRelations[]> {
  const rows = await drinkRepository.findCafeWheelCandidates();
  return rows.map(mapCafe);
}

export async function getCafeById(id: string): Promise<CafeWithRelations | null> {
  const row = await drinkRepository.findCafeById(id);
  return row ? mapCafe(row) : null;
}

export async function createCafe(data: CafeCreateData) {
  return drinkRepository.createCafe(data);
}

export async function updateCafe(id: string, data: CafeCreateData) {
  return drinkRepository.updateCafe(id, data);
}

export async function deleteCafe(id: string) {
  return drinkRepository.deleteCafe(id);
}

export async function setCafeFavorite(id: string, next: boolean) {
  return drinkRepository.setCafeFavorite(id, next);
}

export async function setCafeBlacklisted(id: string, next: boolean) {
  return drinkRepository.setCafeBlacklisted(id, next);
}

export async function hideCafeForToday(id: string) {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return drinkRepository.setCafeHiddenUntil(id, endOfDay);
}

export async function unhideCafe(id: string) {
  return drinkRepository.setCafeHiddenUntil(id, null);
}

export async function setDrinkFavorite(drinkId: string, next: boolean) {
  return drinkRepository.setDrinkFavorite(drinkId, next);
}

export async function getOrCreateCafeCategory(name: string) {
  return drinkRepository.getOrCreateCafeCategory(name);
}

export async function listCategories() {
  return drinkRepository.findAllCategories();
}

export async function exportCafes(): Promise<CafeExportPayload> {
  const categories = await drinkRepository.findAllCategories();
  const cafesRaw = await drinkRepository.findAllCafes();
  const cafes = cafesRaw.map(mapCafe);

  return {
    exportedAt: new Date().toISOString(),
    categories: categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      color: c.color,
    })),
    cafes: cafes.map((c) => ({
      name: c.name,
      address: c.address,
      latitude: c.latitude,
      longitude: c.longitude,
      imageUrl: c.imageUrl,
      menuUrl: c.menuUrl,
      url: c.url,
      googleMapUrl: c.googleMapUrl,
      priceRange: c.priceRange,
      isFavorite: c.isFavorite,
      categoryName: c.category?.name ?? null,
      drinks: c.drinks.map((d) => ({
        name: d.name,
        isFavorite: d.isFavorite,
      })),
    })),
  };
}

export async function importCafes(payload: CafeExportPayload): Promise<{ imported: number }> {
  const categoryIdByName = new Map<string, string>();
  for (const c of payload.categories) {
    const existing = await drinkRepository.getOrCreateCafeCategory(c.name);
    categoryIdByName.set(existing.name, existing.id);
  }

  let imported = 0;
  for (const c of payload.cafes) {
    const categoryId = c.categoryName ? categoryIdByName.get(c.categoryName) || null : null;
    const existing = await drinkRepository.findCafeByName(c.name);
    if (!existing) {
      await drinkRepository.createCafe({
        name: c.name,
        address: c.address ?? null,
        latitude: c.latitude ?? null,
        longitude: c.longitude ?? null,
        imageUrl: c.imageUrl ?? null,
        menuUrl: c.menuUrl ?? null,
        url: c.url ?? null,
        googleMapUrl: c.googleMapUrl ?? null,
        priceRange: c.priceRange ?? null,
        categoryId,
        drinks: c.drinks.map((d) => ({ name: d.name, isFavorite: d.isFavorite })),
      });
      imported += 1;
    }
  }

  return { imported };
}
