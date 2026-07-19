"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

export type OverviewMapMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  kind: "home" | "restaurant" | "cafe" | "place";
  categoryName?: string | null;
};

const markerStyle: Record<OverviewMapMarker["kind"], { color: string; icon: string; label: string }> = {
  home: {
    color: "#bd6a46",
    label: "Nhà",
    icon: '<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-6h6v6"/>',
  },
  restaurant: {
    color: "#c9822d",
    label: "Quán ăn",
    icon: '<path d="M4 10h16"/><path d="M5 10c.6 6 3 9 7 9s6.4-3 7-9"/><path d="M8 5h8"/>',
  },
  cafe: {
    color: "#7b5b45",
    label: "Quán cà phê",
    icon: '<path d="M4 8h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M16 10h1a3 3 0 0 1 0 6h-1"/><path d="M7 4v2M11 4v2"/>',
  },
  place: {
    color: "#547b69",
    label: "Địa điểm",
    icon: '<path d="m3 9 9-5 9 5"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/>',
  },
};

function iconFor(marker: OverviewMapMarker) {
  const style = markerStyle[marker.kind];
  const category = marker.categoryName?.toLocaleLowerCase("vi") ?? "";
  const categoryIcon = category.includes("rạp") || category.includes("phim")
    ? '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m7 5 2 14M15 5l-2 14"/>'
    : category.includes("nhà sách") || category.includes("sách")
    ? '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/>'
    : category.includes("vui chơi") || category.includes("công viên")
    ? '<circle cx="12" cy="12" r="7"/><path d="M12 5v14M5 12h14M7 7l10 10M17 7 7 17"/>'
    : category.includes("bảo tàng")
    ? markerStyle.place.icon
    : style.icon;
  return L.divIcon({
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18],
    html: `<span style="display:grid;width:38px;height:38px;place-items:center;border:3px solid #fff;border-radius:9999px;background:${style.color};box-shadow:0 3px 10px rgba(0,0,0,.35)">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${categoryIcon}</svg>
    </span>`,
  });
}

export default function OverviewMap({ markers }: { markers: OverviewMapMarker[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fallback: L.LatLngExpression = [21.0285, 105.8542];
    const map = L.map(container, { scrollWheelZoom: false, zoomControl: true }).setView(fallback, 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const points: L.LatLngExpression[] = [];
    markers.forEach((marker) => {
      const point: L.LatLngExpression = [marker.latitude, marker.longitude];
      points.push(point);
      L.marker(point, { icon: iconFor(marker) })
        .addTo(map)
        .bindPopup(`<strong>${marker.name}</strong><br/><span>${markerStyle[marker.kind].label}</span>`);
    });

    if (points.length === 1) map.setView(points[0], 15);
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [42, 42], maxZoom: 14 });

    const invalidateSize = () => map.invalidateSize({ pan: false });
    const observer = new ResizeObserver(invalidateSize);
    observer.observe(container);
    const frame = window.requestAnimationFrame(invalidateSize);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      map.remove();
    };
  }, [markers]);

  return <div ref={containerRef} className="h-[360px] w-full" aria-label="Bản đồ các địa điểm đã lưu" />;
}
