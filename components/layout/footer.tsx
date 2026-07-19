"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isGuestPage = pathname.startsWith("/guest");

  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col items-center gap-1.5 py-10 text-center">
        <p className="font-display text-sm text-muted-foreground">
          hôm nay ăn gì - một góc nhỏ cho hai người.
        </p>
        <p className="font-mono text-[11px] text-muted-foreground/70">
          Ăn gì? · Uống gì? · Chơi ở đâu? · Quay 1 vòng là rõ
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/50 mt-2 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} made with ❤️ by Lê Quang Anh
        </p>
        {isGuestPage && (
          <p className="max-w-xl text-[10px] text-muted-foreground/40 mt-4 leading-relaxed px-4">
            <strong>Miễn trừ trách nhiệm:</strong> Mọi thông tin về quán ăn, đồ uống và địa điểm trên trang web này (Bao gồm địa chỉ, giá cả, và giờ hoạt động) được thu thập dựa trên trải nghiệm cá nhân và chỉ mang tính chất tham khảo. Chúng tôi không chịu trách nhiệm pháp lý đối với mọi sự cố, thiệt hại hoặc sự bất tiện nào (như quán đóng cửa, dời địa chỉ, v.v.) phát sinh từ việc sử dụng thông tin trên trang web này.
          </p>
        )}
      </div>
    </footer>
  );
}
