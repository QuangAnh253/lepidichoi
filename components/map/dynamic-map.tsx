"use client";

import dynamic from "next/dynamic";

const DynamicLocationMap = dynamic(() => import("@/components/settings/location-map"), {
  ssr: false,
});

export function MapWrapper(props: any) {
  return <DynamicLocationMap {...props} />;
}
