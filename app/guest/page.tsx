import { GuestWheel } from "@/components/guest/guest-wheel";
import { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Vòng Quay Đồ Ăn",
  description: "Không biết hôm nay ăn gì? Xoay vòng quay đồ ăn ngẫu nhiên của Lê Pi đi chơi (lepidichoi) để chọn món ăn, đồ uống hoặc địa điểm vui chơi tại Hà Nội ngay lập tức.",
  openGraph: {
    title: "Vòng Quay Đồ Ăn | Hôm Nay Ăn Gì?",
    description: "Vòng quay đồ ăn ngẫu nhiên, random ẩm thực Hà Nội cùng Lê Pi đi chơi (lepidichoi).",
    url: "https://lepidichoi.io.vn/guest",
    images: ["https://lepidichoi.io.vn/preview.png"],
  }
};

export default function GuestPage() {
  const defaultEntries = [
    "Bún chả",
    "Phở gà",
    "Pizza",
    "Bún đậu mắm tôm",
    "Gà xào bắp cải phô mai",
    "Gà rán"
  ];

  return (
    <main className="min-h-screen bg-background pt-12 pb-20">
      <div className="container max-w-6xl">
        <header className="mb-12 text-center animate-fade-in-up">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            một trang nhỏ, cho lựa chọn lớn
          </p>
          <h1 className="text-balance font-display text-4xl leading-[1.15] sm:text-5xl mb-6">
            Có những ngày, câu hỏi khó nhất
            <br />
            không phải là công việc -
            <br />
            mà là <span className="italic text-primary">&ldquo;hôm nay ăn gì?&rdquo;</span>
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Không sợ không chọn được, chỉ sợ thiếu thời gian ăn sập Hà Nội.
            Cứ mở lên, quay một vòng, rồi đi ăn thôi.
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
