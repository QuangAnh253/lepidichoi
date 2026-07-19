"use server";

import { prisma } from "@/lib/prisma";

export type GuestLocation = {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapUrl: string | null;
  url: string | null;
};

export type GuestSearchResult = {
  found: boolean;
  type: "FOOD" | "DRINK" | "PLACE" | "CATEGORY" | null;
  name: string;
  locations: GuestLocation[];
};

export async function searchDatabaseForWinnerAction(name: string): Promise<GuestSearchResult> {
  const query = name.trim();
  if (!query) return { found: false, type: null, name: query, locations: [] };

  // 1. Check Food
  const food = await prisma.food.findFirst({
    where: { name: { equals: query, mode: "insensitive" } },
    include: { restaurantLinks: { include: { restaurant: true } } },
  });

  if (food) {
    return {
      found: true,
      type: "FOOD",
      name: food.name,
      locations: food.restaurantLinks.map((link) => ({
        id: link.restaurant.id,
        name: link.restaurant.name,
        address: link.restaurant.address,
        latitude: link.restaurant.latitude,
        longitude: link.restaurant.longitude,
        googleMapUrl: link.restaurant.googleMapUrl,
        url: link.restaurant.url,
      })),
    };
  }

  // 2. Check Place (Unique Place)
  const place = await prisma.place.findFirst({
    where: { name: { equals: query, mode: "insensitive" } },
  });

  if (place) {
    return {
      found: true,
      type: "PLACE",
      name: place.name,
      locations: [
        {
          id: place.id,
          name: place.name,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          googleMapUrl: place.googleMapUrl,
          url: place.url,
        },
      ],
    };
  }

  // 3. Check Category (Type)
  const category = await prisma.category.findFirst({
    where: { name: { equals: query, mode: "insensitive" } },
  });

  if (category) {
    // If it's a category, we need to find all places or restaurants inside it
    if (category.type === "PLACE") {
      const places = await prisma.place.findMany({
        where: { categoryId: category.id, isBlacklisted: false },
      });
      return {
        found: true,
        type: "CATEGORY",
        name: category.name,
        locations: places.map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
          googleMapUrl: p.googleMapUrl,
          url: p.url,
        })),
      };
    } else if (category.type === "FOOD") {
      const restaurants = await prisma.restaurant.findMany({
        where: { categoryId: category.id },
      });
      return {
        found: true,
        type: "CATEGORY",
        name: category.name,
        locations: restaurants.map((r) => ({
          id: r.id,
          name: r.name,
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
          googleMapUrl: r.googleMapUrl,
          url: r.url,
        })),
      };
    }
    // Note: Drinks don't currently have standalone categories tied directly to standalone items in the same way, but could be added.
  }

  // 4. Check Cafe (Drinks)
  const cafe = await prisma.cafe.findFirst({
    where: { name: { equals: query, mode: "insensitive" } },
  });

  if (cafe) {
    return {
      found: true,
      type: "DRINK", // Treating Cafe as DRINK location
      name: cafe.name,
      locations: [
        {
          id: cafe.id,
          name: cafe.name,
          address: cafe.address,
          latitude: cafe.latitude,
          longitude: cafe.longitude,
          googleMapUrl: cafe.googleMapUrl,
          url: cafe.url,
        },
      ],
    };
  }

  return { found: false, type: null, name: query, locations: [] };
}

export type GuestImportData = {
  foods: { name: string; categoryId: string | null; tags: string[] }[];
  places: { name: string; categoryId: string | null }[];
  cafes: { name: string; categoryId: string | null }[];
  categories: { id: string; name: string; type: string }[];
};

export async function getGuestImportDataAction(): Promise<GuestImportData> {
  const [foods, places, cafes, categories] = await Promise.all([
    prisma.food.findMany({
      where: { isBlacklisted: false },
      select: { name: true, categoryId: true, tags: true },
    }),
    prisma.place.findMany({
      where: { isBlacklisted: false },
      select: { name: true, categoryId: true },
    }),
    prisma.cafe.findMany({
      where: { isBlacklisted: false },
      select: { name: true, categoryId: true },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, type: true },
    }),
  ]);

  return { foods, places, cafes, categories };
}
