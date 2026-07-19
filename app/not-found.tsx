import Link from "next/link";
import { ScrapCard } from "@/components/scrap-card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-1 items-center justify-center py-24">
      <ScrapCard tilt={-1.5} tape="terracotta" className="max-w-sm text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-2 font-display text-2xl">Trang này chưa được viết.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Có lẽ nó vẫn còn đang được ươm mầm ở đâu đó.
        </p>
        <Button asChild size="sm" className="mt-5">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </ScrapCard>
    </div>
  );
}
