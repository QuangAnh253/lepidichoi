"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-terracotta/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-golden/5 blur-3xl" />
      
      <div className="w-full max-w-md bg-card border border-border/50 shadow-soft-xl rounded-[2rem] p-8 relative z-10 animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-terracotta/10 rounded-full flex items-center justify-center animate-pulse">
            <Heart className="h-8 w-8 text-terracotta fill-terracotta/20" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-3xl font-display text-center mb-2">Góc private</h1>
        <p className="text-muted-foreground text-center mb-10 text-sm">
          Khu vực hạn chế, vui lòng trả lời câu hỏi bảo mật để truy cập nhé!
        </p>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <label htmlFor="password" className="block text-[15px] font-medium text-foreground text-center">
              Biệt danh hoặc ngày sinh của bạn là gì?
            </label>
            <input
              id="password"
              name="password"
              type="text"
              autoFocus
              autoComplete="off"
              className={cn(
                "w-full rounded-2xl border bg-background/50 px-4 py-4 text-center text-lg outline-none focus:ring-2 focus:ring-ring transition-all",
                error ? "border-destructive focus:ring-destructive" : "border-border/60"
              )}
              placeholder="Nhập vào đây..."
            />
            {error && (
              <p className="text-destructive text-sm text-center">
                {error}
              </p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full rounded-xl py-6 text-base shadow-soft" 
            disabled={isPending}
          >
            {isPending ? "Đang truy cập..." : "Truy cập Góc private"}
          </Button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground mb-3">Hình như bạn đi lạc vào đây ư?</p>
          <Button variant="outline" asChild className="rounded-xl w-full text-muted-foreground hover:text-foreground">
            <Link href="/guest">
              Vào Trang Khách
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
