import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { BentoGrid, BentoItem } from "@/components/bento-grid";
import { Button } from "@/components/ui/button";
import { OverviewMapCard } from "@/components/home/overview-map-card";
import type { OverviewMapMarker } from "@/components/home/overview-map";
import { getSettings } from "@/server/settings-service";
import { listRestaurants } from "@/server/restaurants";
import { listCafes } from "@/server/drink-service";
import { listPlaces } from "@/server/place-service";

export default async function LandingPage() {
  const [settings, restaurants, cafes, places] = await Promise.all([
    getSettings(),
    listRestaurants(),
    listCafes(),
    listPlaces(),
  ]);
  const ready = NAV_ITEMS.filter((i) => i.ready);
  const growing = NAV_ITEMS.filter((i) => !i.ready);
  const markers: OverviewMapMarker[] = [
    ...(settings.homeLocation ? [{
      id: "home",
      name: "Nhà Lê",
      latitude: settings.homeLocation.latitude,
      longitude: settings.homeLocation.longitude,
      kind: "home" as const,
    }] : []),
    ...(settings.luaLocation ? [{
      id: "lua",
      name: "Nhà Pi",
      latitude: settings.luaLocation.latitude,
      longitude: settings.luaLocation.longitude,
      kind: "home" as const,
    }] : []),
    ...restaurants
      .filter((item) => item.latitude != null && item.longitude != null)
      .map((item) => ({ id: `restaurant-${item.id}`, name: item.name, latitude: item.latitude!, longitude: item.longitude!, kind: "restaurant" as const, categoryName: item.category?.name })),
    ...cafes
      .filter((item) => item.latitude != null && item.longitude != null)
      .map((item) => ({ id: `cafe-${item.id}`, name: item.name, latitude: item.latitude!, longitude: item.longitude!, kind: "cafe" as const, categoryName: item.category?.name })),
    ...places
      .filter((item) => item.latitude != null && item.longitude != null)
      .map((item) => ({ id: `place-${item.id}`, name: item.name, latitude: item.latitude!, longitude: item.longitude!, kind: "place" as const, categoryName: item.category?.name })),
  ];

  return (
    <div className="container py-16 sm:py-24">
      <section className="mx-auto max-w-2xl text-center">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          một trang nhỏ, cho hai người
        </p>
        <h1 className="text-balance font-display text-4xl leading-[1.15] sm:text-5xl">
          Có những ngày, câu hỏi khó nhất
          <br />
          không phải là công việc -
          <br />
          mà là <span className="italic text-primary">&ldquo;hôm nay ăn gì?&rdquo;</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-muted-foreground">
          Không sợ không chọn được, chỉ sợ thiếu thời gian ăn sập Hà Nội.
          Cứ mở lên, quay một vòng, rồi đi ăn thôi.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/hom-nay-an-gi">
            Chọn món hôm nay <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <OverviewMapCard markers={markers} />

      <section className="mt-20 sm:mt-28">
        <BentoGrid>
          {ready.map((item, i) => {
            const Icon = item.icon;
            return (
              <BentoItem
                key={item.href}
                span="sm:col-span-2 lg:col-span-2 lg:row-span-1"
                tilt={-0.6}
                className="flex flex-col justify-between"
              >
                <Link href={item.href} className="flex h-full flex-col justify-between gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/80 text-foreground shadow-inner">
                    <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">hoạt động</span>
                    </div>
                    <h2 className="font-display text-2xl group-hover:text-primary transition-colors">{item.label}</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </Link>
              </BentoItem>
            );
          })}

          {growing.map((item, i) => {
            const Icon = item.icon;
            const tilts = [0.8, -0.5, 1.1];
            return (
              <BentoItem
                key={item.href}
                span="lg:col-span-2"
                tilt={tilts[i % tilts.length]}
                className="flex flex-col justify-between opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
              >
                <div className="flex h-full flex-col justify-between gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-inner">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-muted-foreground/50"></span>
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">ươm mầm</span>
                    </div>
                    <h2 className="font-display text-xl">{item.label}</h2>
                  </div>
                </div>
              </BentoItem>
            );
          })}
        </BentoGrid>
      </section>
    </div>
  );
}
