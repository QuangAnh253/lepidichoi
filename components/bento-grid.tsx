import { cn } from "@/lib/utils";

export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  span?: string;
  /** A whisper of rotation so the grid doesn't feel machine-perfect. */
  tilt?: number;
}

export function BentoItem({ children, className, span, tilt = 0 }: BentoItemProps) {
  return (
    <div
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
      className={cn(
        "group relative overflow-hidden rounded-card border border-border/70 bg-card p-6 shadow-soft transition-all duration-500 ease-gentle hover:-translate-y-1 hover:shadow-soft-lg",
        span,
        className
      )}
    >
      {children}
    </div>
  );
}
