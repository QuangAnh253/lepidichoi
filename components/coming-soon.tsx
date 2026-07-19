import { ScrapCard } from "@/components/scrap-card";
import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  emoji: string;
  icon: LucideIcon;
  title: string;
  note: string;
}

export function ComingSoon({ emoji, icon: Icon, title, note }: ComingSoonProps) {
  return (
    <div className="container flex flex-1 items-center justify-center py-24">
      <ScrapCard tilt={-1} tape="olive" className="max-w-md text-center">
        <span className="text-4xl">{emoji}</span>
        <h1 className="mt-4 font-display text-2xl">{title}</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{note}</p>
        <div className="mt-5 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> đang ươm mầm
        </div>
      </ScrapCard>
    </div>
  );
}
