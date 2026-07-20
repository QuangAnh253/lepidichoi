import { GuestWheel } from "@/components/guest/guest-wheel";
import { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Vòng Quay Đồ Ăn Hà Nội | Random Món Ăn Hôm Nay - Lê Pi đi chơi",
  description: "Không biết hôm nay ăn gì ở Hà Nội? Dùng ngay vòng quay đồ ăn ngẫu nhiên (random món ăn) của Lê Pi đi chơi (lepidichoi) để chọn quán ăn ngon, đồ uống và địa điểm vui chơi ngay lập tức.",
  keywords: [
    "vòng quay đồ ăn hà nội",
    "hôm nay ăn gì",
    "random món ăn",
    "vòng quay ăn gì",
    "vòng quay đồ ăn",
    "ăn gì hôm nay",
    "chọn món ăn ngẫu nhiên",
    "địa điểm ăn ngon hà nội",
    "lepidichoi"
  ],
  openGraph: {
    title: "Vòng Quay Đồ Ăn Hà Nội | Hôm Nay Ăn Gì?",
    description: "Vòng quay đồ ăn ngẫu nhiên, random ẩm thực Hà Nội cùng Lê Pi đi chơi (lepidichoi).",
    url: "https://lepidichoi.io.vn/guest",
    images: ["https://lepidichoi.io.vn/preview.png"],
  }
};

export default function GuestPage() {
  const defaultEntries = [
    "Bún chả",
    "Bún đậu mắm tôm",
    "Hamburger",
    "Tokbokki",
    "Steak (Bò bít tết)",
    "Phở gà",
    "Pizza",
    "Bánh mì chảo",
    "Phở bò",
    "Bún cá cay",
    "Bún bò Huế",
    "Bánh đa cua",
    "Miến lươn trộn",
    "Bún riêu cua",
    "Cháo sườn sụn",
    "Gà rán",
    "Gà xào bắp cải phô mai",
    "Hot dog phô mai Hàn Quốc",
    "Salad ức gà sốt mè rang",
    "Takoyaki",
    "Bánh xèo Nhật Bản (Okonomiyaki)",
    "Pad Thái",
    "Cơm thố trộn (Bibimbap)",
    "Mì Ramen",
    "Vịt quay Bắc Kinh",
    "Sushi / Sashimi",
    "Lẩu Thái Tom Yum",
    "Dimsum",
    "Kimbap",
    "Cơm gà xối mỡ",
    "Cơm tấm sườn bì chả",
    "Cơm niêu Singapore (Ếch/Bò)",
    "Xôi xéo thịt kho trứng",
    "Cơm rang dưa bò",
    "Mì Ý (Pasta)"
  ];

  return (
    <main className="min-h-screen bg-background pt-12 pb-20">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Vòng Quay Đồ Ăn Hà Nội - Lê Pi đi chơi",
            "alternateName": "Hôm Nay Ăn Gì?",
            "url": "https://lepidichoi.io.vn/guest",
            "description": "Ứng dụng vòng quay đồ ăn ngẫu nhiên giúp bạn quyết định hôm nay ăn gì, uống gì và đi đâu chơi tại Hà Nội.",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "VND"
            }
          })
        }}
      />
      <div className="container max-w-6xl">
        <header className="mb-12 text-center animate-fade-in-up">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            VÒNG QUAY ĐỒ ĂN HÀ NỘI NGẪU NHIÊN
          </h2>
          <h1 className="text-balance font-display text-4xl leading-[1.15] sm:text-5xl mb-6">
            Có những ngày, câu hỏi khó nhất
            <br />
            không phải là công việc -
            <br />
            mà là <span className="italic text-primary">&ldquo;hôm nay ăn gì?&rdquo;</span>
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Bạn đang phân vân không biết ăn gì ở Hà Nội? Cứ mở vòng quay random món ăn lên, xoay một vòng rồi đi ăn thôi.
          </p>
        </header>

        <GuestWheel defaultEntries={defaultEntries} />
        
        <div className="mt-24 flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto">
          
          <Link href="/guest/ban-do" className="group relative w-full block overflow-hidden rounded-[2rem] border border-border/50 bg-card p-6 shadow-soft transition-all hover:shadow-soft-xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-terracotta/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-secondary/80 shadow-inner group-hover:scale-105 transition-transform duration-500">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-display text-2xl group-hover:text-primary transition-colors">Khám phá Bản đồ</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Toàn bộ kho tàng quán xá, cà phê, và chốn ăn chơi được đúc kết trên một bản đồ duy nhất. Vào ngó thử xem!
                </p>
              </div>
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:translate-x-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>

          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
            Khu vực dành riêng
          </Link>
        </div>
      </div>
    </main>
  );
}
