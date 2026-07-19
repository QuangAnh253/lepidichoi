import { getAllMapMarkers } from "@/server/map-service";
import { MapBoard } from "@/components/map/map-board";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bản Đồ Ẩm Thực & Địa Điểm",
  description: "Bản đồ quán ngon Hà Nội và các địa điểm đi chơi hấp dẫn nhất được tổng hợp bởi Lê Pi đi chơi (lepidichoi). Khám phá ngay!",
  openGraph: {
    title: "Bản Đồ Ẩm Thực & Địa Điểm | Hôm Nay Ăn Gì?",
    description: "Bản đồ các quán ngon Hà Nội, cà phê bệt, chốn ăn chơi được đúc kết trên một bản đồ duy nhất bởi Lê Pi đi chơi.",
    url: "https://lepidichoi.io.vn/guest/ban-do",
  }
};

export default async function GuestBanDoPage() {
  // Pass false to exclude home locations
  const markers = await getAllMapMarkers(false);

  return (
    <div className="container max-w-5xl py-8 flex flex-col h-[calc(100vh)]">
      <header className="shrink-0 mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">Bản đồ Công khai</h1>
          <p className="text-sm text-muted-foreground mt-1">Các quán ăn và địa điểm vui chơi.</p>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-2 hidden sm:inline-flex">
          <Link href="/guest">
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Link>
        </Button>
      </header>

      <section className="flex-1 rounded-[2rem] border border-border/60 bg-secondary/30 p-2 sm:p-4 overflow-hidden relative mb-4">
        <MapBoard markers={markers} />
      </section>
      
      <div className="sm:hidden shrink-0 pb-4">
        <Button variant="outline" className="w-full gap-2" asChild>
          <Link href="/guest">
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Link>
        </Button>
      </div>
    </div>
  );
}
