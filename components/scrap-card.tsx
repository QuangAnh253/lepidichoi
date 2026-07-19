import { cn } from "@/lib/utils";

interface ScrapCardProps {
  children: React.ReactNode;
  className?: string;
  /** Slight handmade tilt, in degrees. Keep small — this is a whisper, not a gimmick. */
  tilt?: number;
  tape?: "golden" | "olive" | "terracotta" | "none";
}

/**
 * Signature element of the "Digital Garden" design system — a page torn
 * from a scrapbook. Big soft radius, a whisper of rotation, a small
 * washi-tape accent pinned in the corner. Used for the day's wheel result
 * and other moments that deserve to feel handled, not generated.
 */
export function ScrapCard({ children, className, tilt = -1.2, tape = "golden" }: ScrapCardProps) {
  return (
    <div
      style={{ transform: `rotate(${tilt}deg)` }}
      className={cn(
        "relative rounded-card border border-border/70 bg-card p-7 shadow-soft-lg",
        className
      )}
    >
      {tape !== "none" && (
        <span
          aria-hidden
          className={cn(
            "absolute -top-3 left-8 h-6 w-16 -rotate-3 rounded-sm opacity-70",
            tape === "golden" && "bg-golden/40",
            tape === "olive" && "bg-olive/35",
            tape === "terracotta" && "bg-terracotta/35"
          )}
        />
      )}
      {children}
    </div>
  );
}
