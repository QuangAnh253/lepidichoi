"use client";

import { useState, useMemo } from "react";
import { MapWrapper } from "@/components/map/dynamic-map";
import type { MarkerData } from "@/components/settings/location-map";

export function MapBoard({ markers }: { markers: MarkerData[] }) {
  const [showFood, setShowFood] = useState(true);
  const [showDrink, setShowDrink] = useState(true);
  const [showPlace, setShowPlace] = useState(true);
  const [showHome, setShowHome] = useState(true);

  const hasHome = useMemo(() => markers.some((m) => m.type === "HOME"), [markers]);

  const filteredMarkers = useMemo(() => {
    return markers.filter((m) => {
      if (m.type === "FOOD" && !showFood) return false;
      if (m.type === "DRINK" && !showDrink) return false;
      if (m.type === "PLACE" && !showPlace) return false;
      if (m.type === "HOME" && !showHome) return false;
      return true;
    });
  }, [markers, showFood, showDrink, showPlace, showHome]);

  return (
    <>
      <div className="absolute top-4 left-4 z-10 bg-card/80 backdrop-blur-md p-3 rounded-2xl shadow-soft border border-border flex flex-col gap-2 pointer-events-auto">
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showFood}
            onChange={(e) => setShowFood(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
          />
          Quán ăn
        </label>
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDrink}
            onChange={(e) => setShowDrink(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
          />
          Cà phê / Đồ uống
        </label>
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPlace}
            onChange={(e) => setShowPlace(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
          />
          Địa điểm vui chơi
        </label>
        {hasHome && (
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showHome}
              onChange={(e) => setShowHome(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
            />
            Nhà
          </label>
        )}
      </div>
      <MapWrapper markers={filteredMarkers} readOnly />
    </>
  );
}
