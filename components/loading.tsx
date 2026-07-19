import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

export function LoadingScreen({ label = "đang pha một chút thời gian..." }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <Spinner className="h-5 w-5 text-primary" />
      <p className="font-display text-sm italic text-muted-foreground">{label}</p>
    </div>
  );
}
