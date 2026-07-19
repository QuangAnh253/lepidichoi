"use client";

import { useEffect, useMemo, useRef } from "react";
import L, { type LatLngExpression } from "leaflet";
import type { Coordinates } from "@/lib/map";
import { createDivIconHtml, type IconType } from "@/components/map/icon-mapping";

const DEFAULT_CENTER: Coordinates = { latitude: 21.0285, longitude: 105.8542 }; // Hà Nội

export interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  type?: "HOME" | "FOOD" | "DRINK" | "PLACE";
  iconType?: IconType;
  color?: string;
  popupHtml?: string;
}

interface LocationMapProps {
  value?: Coordinates | null;
  onChange?: (coordinates: Coordinates) => void;
  markers?: MarkerData[];
  readOnly?: boolean;
}

export default function LocationMap({ value, onChange, markers, readOnly }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const center: Coordinates = value ?? (markers && markers.length > 0 ? { latitude: markers[0].latitude, longitude: markers[0].longitude } : DEFAULT_CENTER);
  
  const position = useMemo<LatLngExpression>(
    () => [center.latitude, center.longitude],
    [center.latitude, center.longitude]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, { scrollWheelZoom: true }).setView(position, value || markers?.length ? 15 : 12);
    
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (!readOnly && onChange) {
      const pinIcon = L.divIcon({
        className: "",
        html: createDivIconHtml("mapPin", "hsl(var(--terracotta))"),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const marker = L.marker(position, { icon: pinIcon, draggable: true }).addTo(map);

      map.on("click", (event: L.LeafletMouseEvent) => {
        onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng });
      });
      marker.on("dragend", () => {
        const next = marker.getLatLng();
        onChange({ latitude: next.lat, longitude: next.lng });
      });

      markerRef.current = marker;
    }

    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
      markers.forEach(m => {
        const icon = L.divIcon({
          className: "",
          html: createDivIconHtml(m.iconType || "mapPin", m.color),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([m.latitude, m.longitude], { icon }).addTo(map);
        if (m.popupHtml) {
          marker.bindPopup(m.popupHtml);
        }
      });
      if (markers.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    const invalidateSize = () => map.invalidateSize({ pan: false });
    const observer = new ResizeObserver(invalidateSize);
    observer.observe(container);
    const firstFrame = window.requestAnimationFrame(invalidateSize);
    const afterAnimation = window.setTimeout(invalidateSize, 300);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(firstFrame);
      window.clearTimeout(afterAnimation);
      map.remove();
      markerRef.current = null;
    };
  }, [onChange, readOnly, markers]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (markerRef.current && !readOnly) {
      markerRef.current.setLatLng(position);
    }
  }, [position, readOnly]);

  return (
    <div ref={containerRef} style={{ height: "100%", width: "100%", borderRadius: "1.75rem", zIndex: 0 }} />
  );
}
