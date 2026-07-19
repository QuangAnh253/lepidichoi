import "server-only";
import { prisma } from "@/lib/prisma";
import type { MarkerData } from "@/components/settings/location-map";
import { getIconType } from "@/components/map/icon-mapping";

function buildPopupHtml(
  name: string,
  address?: string | null,
  imageUrl?: string | null,
  url?: string | null,
  googleMapUrl?: string | null,
  latitude?: number | null,
  longitude?: number | null
) {
  const directionsUrl = googleMapUrl || (latitude && longitude ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}` : null);
  return `
    <div style="min-width: 180px; text-align: center; font-family: inherit;">
      ${
        imageUrl
          ? `<img src="${imageUrl}" alt="${name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; border: 1px solid #eee;" />`
          : ""
      }
      <strong style="display: block; font-size: 1.1em; margin-bottom: 2px;">${name}</strong>
      ${address ? `<span style="color: #666; font-size: 0.9em; display: block; line-height: 1.3;">${address}</span>` : ""}
      
      ${
        (latitude && longitude) || url
          ? `<div style="margin-top: 10px; display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
              ${
                directionsUrl
                  ? `<a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.85em; text-decoration: none; padding: 4px 8px; background: #f4f4f5; border-radius: 6px; color: #18181b; border: 1px solid #e4e4e7; flex: 1;">📍 Đường đi</a>`
                  : ""
              }
              ${
                url
                  ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.85em; text-decoration: none; padding: 4px 8px; background: #f4f4f5; border-radius: 6px; color: #18181b; border: 1px solid #e4e4e7; flex: 1;">🌐 Website</a>`
                  : ""
              }
            </div>`
          : ""
      }
    </div>
  `;
}

export async function getAllMapMarkers(includeHome: boolean = true): Promise<MarkerData[]> {
  const markers: MarkerData[] = [];

  // 1. Home Locations (from Settings)
  if (includeHome) {
    const settings = await prisma.settings.findUnique({
    where: { id: 1 },
    include: { homeLocation: true, luaLocation: true },
  });

  if (settings?.homeLocation) {
    markers.push({
      id: `home-${settings.homeLocation.id}`,
      latitude: settings.homeLocation.latitude,
      longitude: settings.homeLocation.longitude,
      type: "HOME",
      iconType: "home",
      color: "#3b82f6",
      popupHtml: buildPopupHtml("Nhà Lê", settings.homeLocation.name, null, null, null, settings.homeLocation.latitude, settings.homeLocation.longitude),
    });
  }

  if (settings?.luaLocation) {
    markers.push({
      id: `home-${settings.luaLocation.id}`,
      latitude: settings.luaLocation.latitude,
      longitude: settings.luaLocation.longitude,
      type: "HOME",
      iconType: "home",
      color: "#3b82f6",
      popupHtml: buildPopupHtml("Nhà Pi", settings.luaLocation.name, null, null, null, settings.luaLocation.latitude, settings.luaLocation.longitude),
    });
  }
  }

  // 2. Restaurants
  const restaurants = await prisma.restaurant.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    include: { category: true },
  });
  for (const r of restaurants) {
    if (r.latitude != null && r.longitude != null) {
      markers.push({
        id: `restaurant-${r.id}`,
        latitude: r.latitude,
        longitude: r.longitude,
        type: "FOOD",
        iconType: getIconType(r.category?.name || "", "FOOD"),
        color: r.category?.color || "#ef4444",
        popupHtml: buildPopupHtml(r.name, r.address, r.imageUrl, r.url, r.googleMapUrl, r.latitude, r.longitude),
      });
    }
  }

  // 3. Cafes
  const cafes = await prisma.cafe.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    include: { category: true },
  });
  for (const c of cafes) {
    if (c.latitude != null && c.longitude != null) {
      markers.push({
        id: `cafe-${c.id}`,
        latitude: c.latitude,
        longitude: c.longitude,
        type: "DRINK",
        iconType: getIconType(c.category?.name || "", "DRINK"),
        color: c.category?.color || "#8b5a2b",
        popupHtml: buildPopupHtml(c.name, c.address, c.imageUrl, c.url, c.googleMapUrl, c.latitude, c.longitude),
      });
    }
  }

  // 4. Places
  const places = await prisma.place.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    include: { category: true },
  });
  for (const p of places) {
    if (p.latitude != null && p.longitude != null) {
      markers.push({
        id: `place-${p.id}`,
        latitude: p.latitude,
        longitude: p.longitude,
        type: "PLACE",
        iconType: getIconType(p.category?.name || "", "PLACE"),
        color: p.category?.color || "#8b5cf6",
        popupHtml: buildPopupHtml(p.name, p.address, p.imageUrl, p.url, p.googleMapUrl, p.latitude, p.longitude),
      });
    }
  }

  return markers;
}
