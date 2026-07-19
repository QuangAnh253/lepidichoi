import { getAllMapMarkers } from "@/server/map-service";
import { MapBoard } from "@/components/map/map-board";

export const dynamic = "force-dynamic";

export default async function BanDoPage() {
  const markers = await getAllMapMarkers();

  return (
    <div className="container max-w-5xl py-14 sm:py-20 flex flex-col h-[calc(100vh-3.5rem)]">
      <header className="mx-auto max-w-xl text-center shrink-0 mb-6">
        <h1 className="font-display text-4xl">Bản đồ tổng hợp</h1>
        <p className="mt-2 text-muted-foreground">Tất cả quán ăn, cà phê, và địa điểm vui chơi ở chung một nơi.</p>
      </header>

      <section className="flex-1 rounded-[2rem] border border-border/60 bg-secondary/30 p-2 sm:p-4 overflow-hidden relative">
        <MapBoard markers={markers} />
      </section>
    </div>
  );
}
